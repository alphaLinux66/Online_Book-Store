import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import { checkoutOrder } from '../services/api';

export default function Checkout() {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    if (user) {
      const displayName = user.username || 'User';
      setCardName(displayName.charAt(0).toUpperCase() + displayName.slice(1));
    }
  }, [user]);

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (e) => {
    if (e.target.value.length < expiry.length && expiry.endsWith('/')) {
      setExpiry(e.target.value.replace('/', ''));
      return;
    }
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setExpiry(val.substring(0, 5));
  };

  const [errorMessage, setErrorMessage] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMessage('');
    try {
      await checkoutOrder();
      await clearCart();
      setProcessing(false);
      setSuccess(true);
    } catch (err) {
      console.error("Payment failed", err);
      setErrorMessage('Transaction declined! Please make sure you have books in your cart before processing a payment.');
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="container auth-page">
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <CheckCircle size={64} style={{ color: '#16a34a', marginBottom: '1.5rem', display: 'inline-block' }} className="animate-float" />
          <h2 style={{ color: 'var(--color-accent-primary)', fontFamily: 'var(--font-serif)' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem', marginBottom: '2rem' }}>
            Thank you for your order. We are preparing it for shipment.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/catalog')} className="btn btn-secondary">
              Continue Shopping
            </button>
            <button onClick={() => navigate('/tracking')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Track Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-serif)' }}>
          <CreditCard style={{ color: 'var(--color-accent-primary)' }} /> Secure Checkout
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
          <ShieldCheck size={16} /> Data is secured via end-to-end encryption mock.
        </p>

        <form onSubmit={handlePayment}>
          {errorMessage && (
            <div style={{ background: 'rgba(220, 38, 38, 0.06)', color: '#dc2626', border: '1px solid rgba(220, 38, 38, 0.15)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
              {errorMessage}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Cardholder Name</label>
            <input type="text" className="input-field" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">Card Number</label>
            <input type="text" className="input-field" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={handleCardNumberChange} required />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Expiry Date</label>
              <input type="text" className="input-field" placeholder="MM/YY" value={expiry} onChange={handleExpiryChange} required />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">CVC</label>
              <input type="text" className="input-field" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))} required />
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
