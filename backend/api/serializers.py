from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import Book, CartItem, Review, ChatInteraction, StoreOwnerProfile, SupplierBook, BulkOrder, BulkOrderItem, Order, OrderItem

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['is_admin'] = user.is_staff or user.is_superuser
        token['username'] = user.username
        token['is_store_owner'] = hasattr(user, 'store_owner_profile')
        return token


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_staff', 'is_superuser', 'date_joined')
        read_only_fields = ('date_joined',)

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'username', 'book', 'rating', 'comment', 'created_at')
        read_only_fields = ('user',)

class BookSerializer(serializers.ModelSerializer):
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all(), source='book', write_only=True
    )

    class Meta:
        model = CartItem
        fields = ('id', 'book', 'book_id', 'quantity')
        read_only_fields = ('id',)

class ChatInteractionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatInteraction
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ('id', 'book', 'quantity', 'price_at_purchase')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ('id', 'total_amount', 'status', 'created_at', 'items')

class StoreOwnerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreOwnerProfile
        fields = '__all__'

class SupplierBookSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='owner.store_name', read_only=True)
    
    class Meta:
        model = SupplierBook
        fields = '__all__'
        read_only_fields = ('owner',)

class BulkOrderItemSerializer(serializers.ModelSerializer):
    supplier_book_details = SupplierBookSerializer(source='supplier_book', read_only=True)
    
    class Meta:
        model = BulkOrderItem
        fields = '__all__'
        read_only_fields = ('bulk_order',)

class BulkOrderSerializer(serializers.ModelSerializer):
    items = BulkOrderItemSerializer(many=True, read_only=True)
    store_name = serializers.CharField(source='store_owner.store_name', read_only=True)
    admin_name = serializers.CharField(source='admin.username', read_only=True)

    class Meta:
        model = BulkOrder
        fields = '__all__'
        read_only_fields = ('admin', 'created_at', 'total_amount')
