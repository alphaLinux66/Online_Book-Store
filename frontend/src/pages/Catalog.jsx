import React, { useEffect, useState } from 'react';
import { fetchBooks } from '../services/api';
import { ShoppingCart, Plus, Minus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const StarDisplay = ({ rating, size = 14 }) => {
  return (
    <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= rating ? '#fbbf24' : 'transparent'} strokeWidth={i <= rating ? 0 : 2} />
      ))}
    </div>
  );
};

export default function Catalog() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();

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
  
  if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading Collection...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h2>Our Collection</h2>
        <button onClick={() => navigate('/cart')} className="btn btn-secondary">
          <ShoppingCart size={20} /> View Cart
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
              style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            >
              <div 
                style={{ height: '280px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                onClick={() => navigate(`/book/${book.id}`)}
              >
                {book.image_url ? (
                  <img src={book.image_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', ':hover': { transform: 'scale(1.05)' } }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'var(--color-accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                      {book.title}
                  </div>
                )}
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 
                  onClick={() => navigate(`/book/${book.id}`)}
                  style={{ fontSize: '1.25rem', marginBottom: '0.25rem', cursor: 'pointer' }}
                  className="hover-underline"
                >
                  {book.title}
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>by {book.author}</p>
                    {averageRating > 0 ? <StarDisplay rating={averageRating} /> : <span style={{fontSize: '0.8rem', color: 'var(--color-text-secondary)'}}>No Rating</span>}
                </div>
                
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {book.description}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>₹{parseFloat(book.price).toFixed(2)}</span>
                  
                  {qty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-glass-border)', overflow: 'hidden' }}>
                      <button onClick={(e) => handleDecrement(cartItem, e)} style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.5rem', cursor: 'pointer' }}>
                        <Minus size={16} />
                      </button>
                      <span style={{ padding: '0 0.5rem', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>{qty}</span>
                      <button onClick={(e) => handleIncrement(book.id, cartItem, e)} style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.5rem', cursor: 'pointer' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => handleIncrement(book.id, null, e)} 
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <Plus size={16}/> Add
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
