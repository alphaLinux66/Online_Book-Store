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
    ReviewSerializer, CustomTokenObtainPairSerializer, ChatInteractionSerializer, OrderSerializer
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
            # Drain inventory stock
            if hasattr(item.book, 'stock') and item.book.stock >= item.quantity:
                item.book.stock -= item.quantity
            else:
                item.book.stock = 0
            item.book.save()
            
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
        total_users = User.objects.filter(is_staff=False, store_owner_profile__isnull=True).count()
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

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')


# ==========================================
# STORE OWNER / SUPPLIER MODULE
# ==========================================

from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import StoreOwnerProfile, SupplierBook, BulkOrder, BulkOrderItem
from .serializers import StoreOwnerProfileSerializer, SupplierBookSerializer, BulkOrderSerializer

class RegisterSupplierView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # Register core user
        user_data = request.data
        store_name = request.data.get('store_name', 'Store-' + user_data.get('username'))
        serializer = self.get_serializer(data=user_data)
        if serializer.is_valid():
            user = serializer.save()
            # Assign store profile
            StoreOwnerProfile.objects.create(user=user, store_name=store_name, contact_email=user.email)
            return Response({"user": serializer.data, "message": "Store Owner created successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StoreOwnerProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StoreOwnerProfile.objects.all()
    serializer_class = StoreOwnerProfileSerializer
    permission_classes = [IsAuthenticated]


class SupplierBookViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierBookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'store_owner_profile'):
            return SupplierBook.objects.filter(owner=user.store_owner_profile)
        # Admin can view catalog of all suppliers
        if user.is_staff or user.is_superuser:
            return SupplierBook.objects.all()
        return SupplierBook.objects.none()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'store_owner_profile'):
            serializer.save(owner=self.request.user.store_owner_profile)


class BulkOrderViewSet(viewsets.ModelViewSet):
    serializer_class = BulkOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'store_owner_profile'):
            return BulkOrder.objects.filter(store_owner=user.store_owner_profile).order_by('-created_at')
        if user.is_staff or user.is_superuser:
            return BulkOrder.objects.filter(admin=user).order_by('-created_at')
        return BulkOrder.objects.none()

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            order.save()
            
            # INVENTORY SYNC: Add to Retail Catalog natively upon supplier shipping delivery
            if new_status == 'Delivered' and hasattr(request.user, 'store_owner_profile'):
                for item in order.items.all():
                    # Deduct supplier internal
                    if item.supplier_book.stock_quantity >= item.quantity:
                        item.supplier_book.stock_quantity -= item.quantity
                        item.supplier_book.save()
                    
                    # Merge immediately into retail catalog (Book)
                    retail_book, created = Book.objects.get_or_create(
                        title=item.supplier_book.title,
                        author=item.supplier_book.author,
                        defaults={
                            # Mark up retail price by 50%
                            'price': float(item.price_at_purchase) * 1.5,
                            'description': item.supplier_book.description,
                            'image_url': item.supplier_book.image_url,
                            'stock': 0
                        }
                    )
                    retail_book.stock += item.quantity
                    retail_book.save()
                    
            return Response(self.get_serializer(order).data)
        return Response({'error': 'No status provided'}, status=status.HTTP_400_BAD_REQUEST)


class BulkCheckoutView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def post(self, request):
        items_data = request.data.get('items', [])
        store_owner_id = request.data.get('store_owner_id')
        
        if not items_data or not store_owner_id:
            return Response({'error': 'Missing items or store owner id.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            store_owner = StoreOwnerProfile.objects.get(id=store_owner_id)
        except StoreOwnerProfile.DoesNotExist:
            return Response({'error': 'Invalid store supplier.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate B2B invoice total strictly
        total_amount = sum(float(item['wholesale_price']) * int(item['quantity']) for item in items_data)
        
        order = BulkOrder.objects.create(
            admin=request.user,
            store_owner=store_owner,
            total_amount=total_amount,
            status='Pending'
        )
        
        for item_data in items_data:
            try:
                sb = SupplierBook.objects.get(id=item_data['id'])
                BulkOrderItem.objects.create(
                    bulk_order=order,
                    supplier_book=sb,
                    quantity=item_data['quantity'],
                    price_at_purchase=sb.wholesale_price
                )
            except SupplierBook.DoesNotExist:
                continue
            
        return Response({"message": "Successfully dispatched bulk order.", "order_id": order.id}, status=status.HTTP_201_CREATED)
