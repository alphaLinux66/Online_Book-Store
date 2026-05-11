import React, { useEffect, useState } from 'react';
import { fetchBooks } from '../services/api';
import { ShoppingCart, Plus, Minus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const StarDisplay = ({ rating, size = 14 }) => {
  return (
    <div style={{ display: 'flex', gap: '2px', color: '#f59e0b', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= rating ? '#f59e0b' : 'transparent'} strokeWidth={i <= rating ? 0 : 2} />
      ))}
    </div>
  );
};

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchBooks()
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleIncrement = (bookId, cartItem, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    } else {
      addToCart(bookId, 1);
    }
  };

  const handleDecrement = (cartItem, e) => {
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity - 1);
    }
  };
  
  if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading Collection...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)' }}>New Arrivals</h2>
        <button onClick={() => navigate('/cart')} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          <ShoppingCart size={18} /> View Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {books.map(book => {
          const cartItem = cartItems.find(item => item.book.id === book.id);
          const qty = cartItem ? cartItem.quantity : 0;
          
          const averageRating = book.reviews?.length > 0 
            ? Math.round(book.reviews.reduce((acc, rev) => acc + rev.rating, 0) / book.reviews.length)
            : 0;

          return (
            <div 
              key={book.id} 
              className="glass-panel" 
              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            >
              <div 
                style={{ height: '280px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}
                onClick={() => navigate(`/book/${book.id}`)}
              >
                {book.image_url ? (
                  <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--color-bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontWeight: 'bold', fontFamily: 'var(--font-serif)' }}>
                      {book.title}
                  </div>
                )}
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 
                  onClick={() => navigate(`/book/${book.id}`)}
                  style={{ fontSize: '1.15rem', marginBottom: '0.25rem', cursor: 'pointer', fontFamily: 'var(--font-serif)' }}
                  className="hover-underline"
                >
                  {book.title}
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>by {book.author}</p>
                    {averageRating > 0 ? <StarDisplay rating={averageRating} /> : <span style={{fontSize: '0.8rem', color: 'var(--color-text-secondary)'}}>No Rating</span>}
                </div>

                
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {book.description}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>₹{parseFloat(book.price).toFixed(2)}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>({book.stock || 0} in stock)</span>
                  </div>
                  
                  {qty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-glass-border)', overflow: 'hidden' }}>
                      <button onClick={(e) => handleDecrement(cartItem, e)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', padding: '0.5rem', cursor: 'pointer' }}>
                        <Minus size={16} />
                      </button>
                      <span style={{ padding: '0 0.5rem', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>{qty}</span>
                      <button onClick={(e) => handleIncrement(book.id, cartItem, e)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', padding: '0.5rem', cursor: 'pointer' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => handleIncrement(book.id, null, e)} 
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      <Plus size={14}/> Add
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
