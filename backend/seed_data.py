import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookstore.settings')
django.setup()

from api.models import ChatInteraction, CartItem, Book, User
from django.db import transaction

@transaction.atomic
def seed():
    user = User.objects.filter(is_superuser=True).first() or User.objects.first()
    if not user:
        user = User.objects.create_user('dummy', 'dummy@example.com', 'pass')

    books = list(Book.objects.all())
    if not books:
        books = [Book.objects.create(title='Sample Book', author='Author', price=150.00)]

    now = timezone.now()
    intents = ['search_book', 'fallback', 'recommendations', 'shipping']
    
    # Let's create an organic looking trend
    trend = 30
    
    for day_offset in range(90, -1, -1):
        day = now - timedelta(days=day_offset)
        
        # Modify trend
        trend += random.uniform(-5, 5)
        if trend < 5: trend = 5
        
        num_interactions = int(trend * random.uniform(0.8, 1.2))
        interactions_to_create = []
        for _ in range(num_interactions):
            interaction = ChatInteraction(
                user_query='Dummy query',
                detected_intent=random.choice(intents),
                matched_book=random.choice(books) if random.random() > 0.5 else None,
            )
            interactions_to_create.append(interaction)
            
        ChatInteraction.objects.bulk_create(interactions_to_create)
        # bulk_create sets auto_now_add to current date. Need to update it.
        ChatInteraction.objects.filter(created_at__gte=now - timedelta(minutes=1)).update(created_at=day)

        num_items = int(trend * 0.4 * random.uniform(0.8, 1.2))
        for _ in range(num_items):
            item = CartItem.objects.create(
                user=user,
                book=random.choice(books),
                quantity=random.randint(1, 3)
            )
            CartItem.objects.filter(id=item.id).update(created_at=day)
            
    print("Database seeded with 90 days of historic analytics data!")

if __name__ == '__main__':
    seed()
