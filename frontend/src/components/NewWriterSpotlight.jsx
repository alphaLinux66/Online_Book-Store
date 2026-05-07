import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MOCK_BOOKS = [
  { id: 'm1', title: 'Echoes of the Forgotten', author: 'Elena Rostova', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=450' },
  { id: 'm2', title: 'The Quantum Paradox', author: 'Dr. James Holden', image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300&h=450' },
  { id: 'm3', title: 'Whispers in the Code', author: 'Sarah Jenkins', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=450' },
  { id: 'm4', title: 'Silent Horizons', author: 'Marcus Vane', image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300&h=450' },
  { id: 'm5', title: 'A Dance with Shadows', author: 'Lila Croft', image_url: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=300&h=450' },
];

export default function NewWriterSpotlight() {
  const [books, setBooks] = useState(MOCK_BOOKS);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt to fetch real data
    fetch('http://127.0.0.1:8000/api/books/')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Take the last 5 books to simulate "new"
          const sorted = data.sort((a, b) => b.id - a.id).slice(0, 5);
          setBooks(sorted.length >= 3 ? sorted : MOCK_BOOKS); // Fallback to mock if not enough real data
        }
      })
      .catch(err => console.error("Failed to fetch books, using mock data.", err));
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="spotlight-section">
      <div className="spotlight-header">
        <div>
          <h2 className="spotlight-title">🌟 New Writer Spotlight</h2>
          <p className="spotlight-subtitle">Discover fresh voices and newly launched books</p>
        </div>
        <div className="spotlight-controls">
          <button onClick={() => scroll('left')} className="spotlight-arrow" aria-label="Scroll left"><ChevronLeft size={20} /></button>
          <button onClick={() => scroll('right')} className="spotlight-arrow" aria-label="Scroll right"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="spotlight-scroll-container" ref={scrollRef}>
        {books.map((book, idx) => (
          <div 
            key={book.id || idx} 
            className="spotlight-item" 
            onClick={() => {
              if (String(book.id).startsWith('m')) {
                navigate('/catalog');
              } else {
                navigate(`/book/${book.id}`);
              }
            }}
          >
            <div className="spotlight-image-container">
              {idx < 2 && <span className="spotlight-badge">New</span>}
              <img src={book.image_url || 'https://via.placeholder.com/200x300?text=No+Cover'} alt={book.title} className="spotlight-image" loading="lazy" />
            </div>
            <h3 className="spotlight-book-title" title={book.title}>{book.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
