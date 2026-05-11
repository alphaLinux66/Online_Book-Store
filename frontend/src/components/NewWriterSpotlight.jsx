import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const MOCK_BOOKS = [
  { id: 'm1', title: 'The Alchemist: 25th Anniversary', author: 'Paulo Coelho', price: '145.00', category: 'FICTION / CONTEMPORARY', image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600&h=800' },
  { id: 'm2', title: 'Meditations', author: 'Marcus Aurelius', price: '85.00', category: 'PHILOSOPHY', image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'm3', title: 'Bauhaus Vision', author: 'Walter Gropius', price: '120.00', category: 'ART & DESIGN', image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 'm4', title: 'The Odyssey: Collector\'s Box', author: 'Homer', description: 'Hand-bound in goatskin leather with bespoke typography.', price: '450.00', category: 'CLASSICS', image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200&h=200' },
];

export default function NewWriterSpotlight() {
  const [books, setBooks] = useState(MOCK_BOOKS);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    // Attempt to fetch real data
    fetch('http://127.0.0.1:8000/api/books/')
      .then(res => res.json())
      .then(data => {
        if (data && data.length >= 4) {
          // Take the last 4 books to simulate "new"
          const sorted = data.sort((a, b) => b.id - a.id).slice(0, 4);
          // Decorate with category if missing
          const enriched = sorted.map((b, i) => ({
            ...b,
            category: i === 0 ? 'FICTION / CONTEMPORARY' : i === 1 ? 'PHILOSOPHY' : i === 2 ? 'ART & DESIGN' : 'CLASSICS',
            description: i === 3 ? 'Hand-bound in goatskin leather with bespoke typography.' : b.description
          }));
          setBooks(enriched);
        }
      })
      .catch(err => console.error("Failed to fetch books, using mock data.", err));
  }, []);

  const handleNav = (book) => {
    if (String(book.id).startsWith('m')) {
      navigate('/catalog');
    } else {
      navigate(`/book/${book.id}`);
    }
  };

  const handleAdd = (e, book) => {
    e.stopPropagation();
    if (String(book.id).startsWith('m')) {
      navigate('/catalog');
    } else {
      addToCart(book.id, 1);
    }
  };

  if (books.length < 4) return null;

  const mainBook = books[0];
  const subBook1 = books[1];
  const subBook2 = books[2];
  const exclusiveBook = books[3];

  return (
    <div style={{ padding: '4rem 0 6rem 0', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
            NEW ARRIVALS
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            The latest acquisitions to our digital showroom.
          </p>
        </div>
        <Link to="/catalog" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-accent-secondary)', textDecoration: 'none', borderBottom: '1px solid var(--color-accent-secondary)', paddingBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          VIEW FULL INVENTORY
        </Link>
      </div>

      {/* Bento Grid Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Left Column (Main Card) */}
        <div 
          onClick={() => handleNav(mainBook)}
          style={{ background: 'white', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'box-shadow 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
        >
          <div style={{ padding: '1.5rem 1.5rem 0 1.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={mainBook.image_url || 'https://via.placeholder.com/600x400?text=No+Cover'} alt={mainBook.title} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ color: 'var(--color-accent-secondary)', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              {mainBook.category}
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>{mainBook.title}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '2rem' }}>{mainBook.author}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-accent-primary)' }}>${parseFloat(mainBook.price).toFixed(2)}</span>
              <button onClick={(e) => handleAdd(e, mainBook)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Row (Two Cards) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1 }}>
            
            {/* Card 1 */}
            <div 
              onClick={() => handleNav(subBook1)}
              style={{ background: 'white', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'box-shadow 0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={subBook1.image_url || 'https://via.placeholder.com/300x300?text=No+Cover'} alt={subBook1.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.7rem', fontWeight: '600', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                  {subBook1.category}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>{subBook1.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '1rem' }}>{subBook1.author}</p>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-accent-primary)' }}>${parseFloat(subBook1.price).toFixed(2)}</span>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              onClick={() => handleNav(subBook2)}
              style={{ background: 'white', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'box-shadow 0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={subBook2.image_url || 'https://via.placeholder.com/300x300?text=No+Cover'} alt={subBook2.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.7rem', fontWeight: '600', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                  {subBook2.category}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>{subBook2.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '1rem' }}>{subBook2.author}</p>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-accent-primary)' }}>${parseFloat(subBook2.price).toFixed(2)}</span>
              </div>
            </div>

          </div>

          {/* Bottom Row (Exclusive Dark Card) */}
          <div 
            onClick={() => handleNav(exclusiveBook)}
            style={{ background: '#1A1D20', color: 'white', display: 'flex', padding: '2rem', cursor: 'pointer', transition: 'background 0.3s', flex: 1 }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#111315'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1A1D20'}
          >
            <div style={{ flex: '0 0 120px', marginRight: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={exclusiveBook.image_url || 'https://via.placeholder.com/200x200?text=No+Cover'} alt={exclusiveBook.title} style={{ width: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
              <div style={{ display: 'inline-block', background: 'var(--color-accent-secondary)', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', marginBottom: '1rem', width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                MEMBER EXCLUSIVE
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>{exclusiveBook.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                {exclusiveBook.description}
              </p>
              <div style={{ fontSize: '0.85rem', borderBottom: '1px solid white', width: 'fit-content', paddingBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                DETAILS
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
