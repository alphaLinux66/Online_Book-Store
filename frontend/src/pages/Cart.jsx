import React from 'react';
import { Trash2, ArrowRight, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);
    } catch (e) {
      console.error(e);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.book.price) * item.quantity), 0).toFixed(2);

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/catalog" className="btn-icon" style={{ textDecoration: 'none' }}><ArrowLeft size={20} /></Link>
        <h2>Your Shopping Cart</h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Looks like you haven't added any books yet.</p>
          <Link to="/catalog" className="btn btn-primary">Browse Collection</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map(item => (
              <div key={item.id} className="glass-panel" style={{ display: 'flex', padding: '1.5rem', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '80px', background: 'var(--color-accent-gradient)', borderRadius: '4px', flexShrink: 0, overflow: 'hidden' }}>
                    {item.book.image_url && <img src={item.book.image_url} alt={item.book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h4>{item.book.title}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{item.book.author}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-glass-border)', overflow: 'hidden', width: 'fit-content' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.25rem 0.75rem', cursor: 'pointer' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '0 0.5rem', fontWeight: '600', minWidth: '30px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.25rem 0.75rem', cursor: 'pointer' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>₹{(item.book.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.id)} className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'transparent' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel" style={{ flex: '1 1 300px', padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Shipping</span>
              <span style={{ color: '#4ade80' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-glass-border)', paddingTop: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Total</span>
              <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>₹{subtotal}</span>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
