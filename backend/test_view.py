import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookstore.settings')
django.setup()

from django.test import RequestFactory
from api.models import User, Book, CartItem
from api.views import CheckoutView
from rest_framework.request import Request

def test_checkout_view():
    factory = RequestFactory()
    user = User.objects.first()
    
    # ensure cart has items
    book = Book.objects.first()
    CartItem.objects.get_or_create(user=user, book=book, defaults={'quantity': 1})
    
    django_request = factory.post('/api/checkout/')
    django_request.user = user
    # Wrap in DRF Request to provide standard REST framework request interface
    request = Request(django_request)
    
    view = CheckoutView()
    view.request = request
    view.format_kwarg = None
    
    try:
        response = view.post(request)
        print("RESPONSE STATUS:", response.status_code)
        print("RESPONSE DATA:", response.data)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_checkout_view()
