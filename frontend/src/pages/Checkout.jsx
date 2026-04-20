import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment API delay
    setTimeout(async () => {
      try {
        await clearCart();
        setProcessing(false);
        setSuccess(true);
      } catch (err) {
        console.error("Payment failed or cart clear failed", err);
        setProcessing(false);
      }
    }, 2500);
  };

  if (success) {
    return (
      <div className="container auth-page">
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <CheckCircle size={64} style={{ color: '#4ade80', marginBottom: '1.5rem', display: 'inline-block' }} className="animate-float" />
          <h2 className="text-gradient">Payment Successful!</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem', marginBottom: '2rem' }}>
            Thank you for your order. We are preparing it for shipment.
          </p>
          <button onClick={() => navigate('/catalog')} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard className="text-gradient" /> Secure Checkout
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
          <ShieldCheck size={16} /> Data is secured via end-to-end encryption mock.
        </p>

        <form onSubmit={handlePayment}>
          <div className="input-group">
            <label className="input-label">Cardholder Name</label>
            <input type="text" className="input-field" placeholder="John Doe" required />
          </div>

          <div className="input-group">
            <label className="input-label">Card Number</label>
            <input type="text" className="input-field" placeholder="0000 0000 0000 0000" required maxLength="19" />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Expiry Date</label>
              <input type="text" className="input-field" placeholder="MM/YY" required maxLength="5" />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">CVC</label>
              <input type="text" className="input-field" placeholder="123" required maxLength="3" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center' }} disabled={processing}>
            {processing ? 'Processing Payment...' : `Pay Securely`}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/cart" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Cancel and return to cart</Link>
        </div>
      </div>
    </div>
  );
}
