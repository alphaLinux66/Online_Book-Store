import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchBook, submitReview } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Minus, CreditCard, Star } from 'lucide-react';
import { StarDisplay } from './Catalog';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { user } = useAuth();

  // Review status
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadBook = () => {
    fetchBook(id)
      .then(data => {
        setBook(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading Details...</div>;
  if (!book) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Book Not Found</div>;

  const cartItem = cartItems.find(item => item.book.id === book.id);
  const qty = cartItem ? cartItem.quantity : 0;
  
  const averageRating = book.reviews?.length > 0 
    ? Math.round(book.reviews.reduce((acc, rev) => acc + rev.rating, 0) / book.reviews.length)
    : 0;

  const handleIncrement = () => {
    if (cartItem) updateQuantity(cartItem.id, qty + 1);
    else addToCart(book.id, 1);
  };

  const handleDecrement = () => {
    if (cartItem) updateQuantity(cartItem.id, qty - 1);
  };

  const handleBuyNow = async () => {
    if (!cartItem) await addToCart(book.id, 1);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    
    setSubmittingReview(true);
    try {
      await submitReview(book.id, reviewRating, reviewText);
      setReviewText("");
      setReviewRating(5);
      loadBook();
    } catch (err) {
      console.error(err);
      alert("Failed to submit review. Ensure you are logged in and the backend is running correctly.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', maxWidth: '1200px' }}>
      <Link to="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', textDecoration: 'none', marginBottom: '2rem', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='var(--color-text-secondary)'}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden', padding: 0 }}>
        {/* Left Col: Image */}
        <div style={{ flex: '1 1 400px', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
          {book.image_url ? (
            <img src={book.image_url} alt={book.title} style={{ width: '100%', maxWidth: '350px', height: 'auto', borderRadius: '4px', boxShadow: 'var(--shadow-lg)' }} />
          ) : (
            <div style={{ width: '300px', height: '400px', background: 'var(--color-accent-gradient)', borderRadius: '4px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center', padding: '1.5rem' }}>
              {book.title}
            </div>
          )}
        </div>

        {/* Right Col: Details */}
        <div style={{ flex: '1 1 500px', padding: '3rem', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', lineHeight: '1.2' }}>{book.title}</h1>
          <p style={{ color: 'var(--color-accent-primary)', fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem' }}>by {book.author}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            {averageRating > 0 ? <StarDisplay rating={averageRating} size={18} /> : <span style={{ color: 'var(--color-text-secondary)' }}>No ratings yet</span>}
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>| {book.reviews?.length || 0} customer reviews</span>
          </div>
          
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-glass-border)', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-text-primary)', display: 'block', marginBottom: '1rem' }}>
                ₹{parseFloat(book.price).toFixed(2)}
            </span>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Inclusive of all taxes.</p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {qty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-glass-border)', overflow: 'hidden' }}>
                      <button onClick={handleDecrement} style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.75rem 1.2rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.target.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.target.style.background='transparent'}>
                        <Minus size={18} />
                      </button>
                      <span style={{ padding: '0 1rem', fontWeight: '600', minWidth: '40px', textAlign: 'center', fontSize: '1.2rem' }}>{qty}</span>
                      <button onClick={handleIncrement} style={{ background: 'transparent', border: 'none', color: 'white', padding: '0.75rem 1.2rem', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.target.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.target.style.background='transparent'}>
                        <Plus size={18} />
                      </button>
                    </div>
                ) : (
                    <button onClick={handleIncrement} className="btn btn-secondary" style={{ padding: '0.75rem 2rem', flex: 1, minWidth: '200px' }}>
                    Add to Cart
                    </button>
                )}
                <button onClick={handleBuyNow} className="btn btn-primary" style={{ padding: '0.75rem 2rem', flex: 1, minWidth: '200px', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <CreditCard size={20} /> Buy Now
                </button>
            </div>
          </div>

          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>About the book</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '2rem' }}>
            {book.description}
          </p>

        </div>
      </div>

      {/* Reviews Section */}
      <h3 style={{ fontSize: '1.8rem', marginTop: '4rem', marginBottom: '2rem' }}>Customer Reviews</h3>
      
      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
            {user ? (
                <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderTop: '4px solid var(--color-accent-primary)' }}>
                    <h4 style={{ marginBottom: '2rem', fontSize: '1.4rem' }}>Write a Review</h4>
                    <form onSubmit={handleReviewSubmit}>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Overall Rating</label>
                            <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  size={32} 
                                  fill={star <= reviewRating ? '#fbbf24' : 'transparent'} 
                                  strokeWidth={star <= reviewRating ? 0 : 1.5}
                                  color={star <= reviewRating ? '#fbbf24' : 'var(--color-text-secondary)'}
                                  style={{ transition: 'all 0.2s', transform: star <= reviewRating ? 'scale(1.1)' : 'scale(1)' }}
                                  onMouseEnter={(e) => {
                                    // simple hover effect without complex state
                                    const stars = e.currentTarget.parentElement.children;
                                    for(let i=0; i<stars.length; i++) {
                                      if(i < star) stars[i].style.fill = '#fcd34d';
                                      else stars[i].style.fill = 'transparent';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    const stars = e.currentTarget.parentElement.children;
                                    for(let i=0; i<stars.length; i++) {
                                      if(i < reviewRating) stars[i].style.fill = '#fbbf24';
                                      else stars[i].style.fill = 'transparent';
                                    }
                                  }}
                                  onClick={() => setReviewRating(star)}
                                />
                              ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Your Review</label>
                            <textarea 
                                placeholder="What did you like or dislike? What should other shoppers know before buying?" 
                                required
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                                style={{ 
                                  width: '100%', 
                                  minHeight: '150px', 
                                  background: 'rgba(0,0,0,0.2)', 
                                  border: '1px solid rgba(255,255,255,0.1)', 
                                  borderRadius: '8px', 
                                  color: 'white', 
                                  padding: '1.25rem', 
                                  resize: 'vertical',
                                  fontSize: '1rem',
                                  lineHeight: '1.5',
                                  transition: 'border-color 0.3s'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--color-accent-primary)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>
                        <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>
                            {submittingReview ? 'Submitting...' : 'Post Review'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Review this product</h4>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>Share your thoughts with other customers and help them make an informed decision.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }}>Sign in to review</button>
                </div>
            )}
        </div>

        <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {book.reviews && book.reviews.length > 0 ? (
                book.reviews.map(rev => (
                    <div key={rev.id} className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {rev.username.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: '600' }}>{rev.username}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <StarDisplay rating={rev.rating} />
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                                Verified Purchase
                            </span>
                        </div>
                        <p style={{ lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
                            {rev.comment}
                        </p>
                    </div>
                ))
            ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
                    No reviews yet. Be the first to share your thoughts!
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
