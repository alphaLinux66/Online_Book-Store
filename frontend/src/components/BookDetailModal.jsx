import React from 'react';
import { X, Plus, Minus, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function BookDetailModal({ book, onClose }) {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  if (!book) return null;

  const cartItem = cartItems.find(item => item.book.id === book.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, qty + 1);
    } else {
      addToCart(book.id, 1);
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, qty - 1);
    }
  };

  const handleBuyNow = async () => {
    if (!cartItem) {
      await addToCart(book.id, 1);
    }
    navigate('/checkout');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          className="btn-icon" 
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-glass-border)' }}
        >
          <X size={24} color="var(--color-text-primary)" />
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '500px' }}>
          
          <div style={{ flex: '1 1 350px', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
            {book.image_url ? (
              <img src={book.image_url} alt={book.title} style={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '4px', boxShadow: 'var(--shadow-lg)' }} />
            ) : (
              <div style={{ width: '250px', height: '350px', background: 'var(--color-bg-tertiary)', borderRadius: '4px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center', padding: '1.5rem', fontFamily: 'var(--font-serif)' }}>
                {book.title}
              </div>
            )}
          </div>

          <div style={{ flex: '1 1 400px', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', lineHeight: '1.1', fontFamily: 'var(--font-serif)' }}>{book.title}</h2>
            <p style={{ color: 'var(--color-accent-primary)', fontSize: '1.1rem', fontWeight: '500', marginBottom: '1.5rem' }}>
              by {book.author}
            </p>
            
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: '1.8', marginBottom: '2.5rem', flex: 1 }}>
              {book.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid var(--color-glass-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>
                  ₹{parseFloat(book.price).toFixed(2)}
                </span>
                
                {qty > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-glass-border)', overflow: 'hidden' }}>
                    <button onClick={handleDecrement} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', padding: '0.5rem 1rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.target.style.background='var(--color-bg-tertiary)'} onMouseOut={e=>e.target.style.background='transparent'}>
                      <Minus size={18} />
                    </button>
                    <span style={{ padding: '0 1rem', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>{qty}</span>
                    <button onClick={handleIncrement} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-primary)', padding: '0.5rem 1rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.target.style.background='var(--color-bg-tertiary)'} onMouseOut={e=>e.target.style.background='transparent'}>
                      <Plus size={18} />
                    </button>
                  </div>
                ) : (
                  <button onClick={handleIncrement} className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>
                    Add to Cart
                  </button>
                )}
              </div>

              <button onClick={handleBuyNow} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} /> Buy Now
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
