import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookstore.settings')
django.setup()

from django.test import Client
from api.models import User, Book, CartItem

def test_checkout():
    client = Client()
    
    # 1. Provide an admin user
    user = User.objects.first()
    if not user:
        user = User.objects.create_superuser('test', 'test@test.com', 'test')
        
    client.force_login(user)
    
    # Test Empty Cart
    response = client.post('/api/checkout/')
    print("EMPTY CART RESPONSE:", response.status_code, response.content)
    
    # Test Full Cart
    book = Book.objects.first()
    if not book:
        book = Book.objects.create(title='T', author='A', price=100.50)
    
    CartItem.objects.create(user=user, book=book, quantity=2)
    response2 = client.post('/api/checkout/')
    print("FULL CART RESPONSE:", response2.status_code, response2.content)

if __name__ == '__main__':
    test_checkout()
