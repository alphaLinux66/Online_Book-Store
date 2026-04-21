from django.db import models
from django.contrib.auth.models import User

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=10) # default retail stock
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return self.title

class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.quantity} x {self.book.title} for {self.user.username}"

class Review(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.book.title} by {self.user.username}"

class ChatInteraction(models.Model):
    user_query = models.TextField()
    detected_intent = models.CharField(max_length=50)
    matched_book = models.ForeignKey(Book, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat [{self.detected_intent}]: {self.user_query[:30]}"
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='Placed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.book.title} in Order #{self.order.id}"

class StoreOwnerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='store_owner_profile')
    store_name = models.CharField(max_length=255)
    contact_email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.store_name


class SupplierBook(models.Model):
    owner = models.ForeignKey(StoreOwnerProfile, on_delete=models.CASCADE, related_name='supplied_books')
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    wholesale_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"{self.title} supplied by {self.owner.store_name}"


class BulkOrder(models.Model):
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bulk_orders_placed')
    store_owner = models.ForeignKey(StoreOwnerProfile, on_delete=models.CASCADE, related_name='bulk_orders_received')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=50, default='Pending') # Pending, Shipped, Delivered
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bulk Order #{self.id} for {self.store_owner.store_name}"


class BulkOrderItem(models.Model):
    bulk_order = models.ForeignKey(BulkOrder, on_delete=models.CASCADE, related_name='items')
    supplier_book = models.ForeignKey(SupplierBook, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.supplier_book.title} in BulkOrder #{self.bulk_order.id}"
