import os
import google.generativeai as genai
from django.conf import settings
from .models import Book
from django.db.models import Q

def generate_rag_response(user_query):
    # Configure Gemini API
    api_key = getattr(settings, 'GEMINI_API_KEY', os.environ.get('GEMINI_API_KEY', ''))
    if not api_key:
        return "System Error: GEMINI_API_KEY is not configured in your environment."
    
    genai.configure(api_key=api_key)
    
    # 1. Retrieval
    # Search for books that might match the query using basic keyword matching
    keywords = user_query.split()
    query = Q()
    for word in keywords:
        # ignore short words that might be stop words
        if len(word) > 2:
            query |= Q(title__icontains=word) | Q(description__icontains=word) | Q(author__icontains=word)
            
    matched_books = Book.objects.filter(query).distinct()[:5]
    
    context = ""
    if matched_books.exists():
        context = "Current Inventory Data:\n"
        for book in matched_books:
            context += f"- Title: {book.title}, Author: {book.author}, Price: ₹{book.price}, Stock: {book.stock}\n"
            if book.description:
                context += f"  Description: {book.description[:200]}...\n"
    else:
        context = "No specific books matched the query in the current inventory. Our general catalog contains many other books."

    # 2. Augmentation (Prompt Engineering)
    prompt = f"""
    You are the friendly and helpful virtual assistant for Papyrus Plaza, an online bookstore.
    Answer the user's question accurately based ONLY on the following real-time inventory data.
    If the answer isn't in the inventory data, politely say you don't have that information or ask them to browse the catalog.
    Keep your response concise (1-3 sentences), polite, and conversational. Do not use markdown formatting like bolding or lists, keep it plain text.
    
    {context}
    
    User Question: {user_query}
    """
    
    # 3. Generation
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        error_msg = f"Sorry, I encountered an error while thinking: {str(e)}\n\n"
        try:
            available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            error_msg += f"Available models for your API key: {', '.join(available_models)}"
        except Exception as e2:
            error_msg += f"Could not fetch available models."
            
        return error_msg
