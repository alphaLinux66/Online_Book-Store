from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Count
from .models import Book, CartItem, Review, ChatInteraction, Order, OrderItem
from .serializers import (
    UserSerializer, BookSerializer, CartItemSerializer, 
    ReviewSerializer, CustomTokenObtainPairSerializer, ChatInteractionSerializer
)

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = (IsAdminUserOrReadOnly,)

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        book = serializer.validated_data['book']
        cart_item = CartItem.objects.filter(user=self.request.user, book=book).first()
        if cart_item:
            cart_item.quantity += serializer.validated_data.get('quantity', 1)
            cart_item.save()
        else:
            serializer.save(user=self.request.user)

    @action(detail=False, methods=['delete'], url_path='remove-book/(?P<book_id>[^/.]+)')
    def remove_book(self, request, book_id=None):
        try:
            cart_item = CartItem.objects.get(user=request.user, book_id=book_id)
            cart_item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear_cart(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # For simplicity, if they aren't safe methods, we allow to anyone who is authenticated, 
            # and we will restrict modifying others' reviews in get_queryset or object level perms.
            # But let admin do anything.
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = Review.objects.all().order_by('-created_at')
        book_id = self.request.query_params.get('book', None)
        if book_id is not None:
            queryset = queryset.filter(book_id=book_id)
        
        # If user is not admin and is trying to modify (not a list action)
        if self.action in ['update', 'partial_update', 'destroy'] and not self.request.user.is_staff:
            return queryset.filter(user=self.request.user)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ChatInteractionViewSet(viewsets.ModelViewSet):
    queryset = ChatInteraction.objects.all()
    serializer_class = ChatInteractionSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

from django.db.models import Sum, F
from django.db.models.functions import TruncDate
from django.utils import timezone
import datetime

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        cart_items = CartItem.objects.filter(user=user)
        
        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
            
        total_amount = sum(item.quantity * item.book.price for item in cart_items)
        
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            status='Placed'
        )
        
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                book=item.book,
                quantity=item.quantity,
                price_at_purchase=item.book.price
            )
            
        cart_items.delete()
        return Response({"message": "Checkout successful", "order_id": order.id}, status=status.HTTP_201_CREATED)

class AdminAnalyticsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            days = int(request.query_params.get('days', 90))
        except ValueError:
            days = 90

        chat_intents = list(ChatInteraction.objects.values('detected_intent').annotate(count=Count('id')))
        
        books_purchased = list(
            OrderItem.objects.values('book__title')
            .annotate(count=Sum('quantity'))
            .order_by('-count')[:5]
        )
        book_mentions = [{'matched_book__title': item['book__title'], 'count': item['count']} for item in books_purchased]
        
        # Calculate KPIs
        total_revenue = Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0
        total_users = User.objects.count()
        total_books_sold = OrderItem.objects.aggregate(total=Sum('quantity'))['total'] or 0
        total_chats = ChatInteraction.objects.count()

        kpis = [
            {'title': 'Total Revenue', 'value': f'₹{total_revenue}', 'trend': '+12.5%', 'trendUp': True, 'subText': 'Total completed order value'},
            {'title': 'Total Customers', 'value': str(total_users), 'trend': '+5.2%', 'trendUp': True, 'subText': 'Registered accounts'},
            {'title': 'Books Sold', 'value': str(total_books_sold), 'trend': '+2.1%', 'trendUp': True, 'subText': 'Completed items purchased'},
            {'title': 'Chat Engagements', 'value': str(total_chats), 'trend': '+15.3%', 'trendUp': True, 'subText': 'Bot interactions'},
        ]

        # Timeseries data (dynamic days)
        cutoff_date = timezone.now() - datetime.timedelta(days=days)
        
        # Interactions timeseries
        interactions_qs = (
            ChatInteraction.objects.filter(created_at__gte=cutoff_date)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(interactions=Count('id'))
            .order_by('date')
        )
        interactions_map = {item['date'].strftime('%b %d'): item['interactions'] for item in interactions_qs if item['date']}

        # Volume (Revenue) timeseries based on Order created_at
        volume_qs = (
            Order.objects.filter(created_at__gte=cutoff_date)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(volume=Sum('total_amount'))
            .order_by('date')
        )
        volume_map = {item['date'].strftime('%b %d'): int(item['volume']) for item in volume_qs if item['date']}

        # Merge them
        timeseries = []
        for i in range(days, -1, -1):
            d = (timezone.now() - datetime.timedelta(days=i)).strftime('%b %d')
            timeseries.append({
                'date': d,
                'interactions': interactions_map.get(d, 0),
                'volume': volume_map.get(d, 0)
            })

        return Response({
            'chat_intents': chat_intents,
            'book_mentions': book_mentions,
            'kpis': kpis,
            'timeseries': timeseries
        })
