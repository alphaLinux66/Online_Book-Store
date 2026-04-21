import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookstore.settings')
django.setup()

from api.models import ChatInteraction, CartItem, Order, OrderItem

def wipe():
    num_chats, _ = ChatInteraction.objects.all().delete()
    num_cart, _ = CartItem.objects.all().delete()
    num_orders, _ = Order.objects.all().delete()
    num_order_items, _ = OrderItem.objects.all().delete()
    
    print(f"Deleted:")
    print(f" - {num_chats} Chat Interactions")
    print(f" - {num_cart} Cart Items")
    print(f" - {num_orders} Orders")
    print(f" - {num_order_items} Order Items")

if __name__ == '__main__':
    wipe()
