import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookstore.settings')
django.setup()

from api.models import Book

# Clear previous books to reset pricing/images properly
Book.objects.all().delete()

books = [
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "price": 899.00,
        "description": "A classic novel exploring themes of decadence, idealism, and resistance to change, creating a portrait of the Jazz Age.",
        "image_url": "https://covers.openlibrary.org/b/id/8378033-L.jpg"
    },
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "price": 750.00,
        "description": "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
        "image_url": "https://covers.openlibrary.org/b/id/11186714-L.jpg"
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "price": 1050.00,
        "description": "Among the seminal texts of the 20th century, 1984 is a rare work that grows more haunting as its futuristic purgatory becomes more real.",
        "image_url": "https://covers.openlibrary.org/b/id/153289-L.jpg"
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "price": 650.00,
        "description": "An 1813 romantic novel of manners following the character development of Elizabeth Bennet.",
        "image_url": "https://covers.openlibrary.org/b/id/8259461-L.jpg"
    },
    {
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "price": 1250.00,
        "description": "The enchanting prelude to The Lord of the Rings, starring the beloved Bilbo Baggins.",
        "image_url": "https://covers.openlibrary.org/b/id/8406786-L.jpg"
    },
    {
        "title": "Sapiens: A Brief History of Humankind",
        "author": "Yuval Noah Harari",
        "price": 1499.00,
        "description": "A groundbreaking narrative of humanity’s creation and evolution—a #1 international bestseller.",
        "image_url": "https://covers.openlibrary.org/b/id/14589252-L.jpg"
    },
    {
        "title": "Dune",
        "author": "Frank Herbert",
        "price": 1399.00,
        "description": "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world.",
        "image_url": "https://covers.openlibrary.org/b/id/8405562-L.jpg"
    },
    {
        "title": "Atomic Habits",
        "author": "James Clear",
        "price": 1150.00,
        "description": "No matter your goals, Atomic Habits offers a proven framework for improving--every day.",
        "image_url": "https://covers.openlibrary.org/b/id/14352157-L.jpg"
    },
    {
        "title": "Thinking, Fast and Slow",
        "author": "Daniel Kahneman",
        "price": 999.00,
        "description": "The phenomenal New York Times Bestseller by the renowned psychologist and winner of the Nobel Prize in Economics.",
        "image_url": "https://covers.openlibrary.org/b/id/7361734-L.jpg"
    },
    {
        "title": "Project Hail Mary",
        "author": "Andy Weir",
        "price": 1599.00,
        "description": "A lone astronaut must save the earth from disaster in this incredible new science-based thriller.",
        "image_url": "https://covers.openlibrary.org/b/id/12423985-L.jpg"
    }
]

for b in books:
    obj, created = Book.objects.get_or_create(title=b['title'], defaults=b)
    if created:
        print(f"Created/Updated: {b['title']}")

print("Seeding logic complete!")
