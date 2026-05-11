import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NewWriterSpotlight from '../components/NewWriterSpotlight';

export default function Home() {
  const { user } = useAuth();
  const [featuredBook, setFeaturedBook] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/books/')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Pick a random book with an image for the hero
          const booksWithImages = data.filter(b => b.image_url);
          if (booksWithImages.length > 0) {
            setFeaturedBook(booksWithImages[Math.floor(Math.random() * booksWithImages.length)]);
          } else {
            setFeaturedBook(data[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="container animate-fade-in">
      <div className="hero-section">
        <div className="hero-content">
          <div style={{ display: 'inline-block', background: 'var(--color-accent-primary)', padding: '0.4rem 1rem', color: 'white', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)' }}>
            {user?.isStoreOwner ? 'Wholesale Partner Network' : user?.isWriter ? 'Digital Publishing Platform' : 'Automotive Precision in Literature'}
          </div>
          
          <h1 className="hero-title">
            {user?.isStoreOwner ? (
                <>The Art of the Page. <br /><span style={{ color: 'var(--color-accent-primary)' }}>Precision-Curated</span> Supply.</>
            ) : user?.isWriter ? (
                <>The Art of the Page. <br /><span style={{ color: 'var(--color-accent-primary)' }}>Precision-Curated</span> Publishing.</>
            ) : (
                <>The Art of the Page. <br /><span style={{ color: 'var(--color-accent-primary)' }}>Precision-Curated</span> Literature.</>
            )}
          </h1>
          
          <p className="hero-subtitle">
            {user?.isStoreOwner 
              ? "Track active bulk invoices, update your warehouse inventory stock, and dispatch seamless B2B shipments directly to the retail district."
              : user?.isWriter 
              ? "Upload manuscripts, track real-time reader engagement, and manage your digital publishing portfolio all in one place."
              : "Experience the world's most exquisite editions through the lens of engineering excellence. Our collection is curated for the discerning mind."}
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '0.85rem' }}>
                  Explore Vault <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '0.85rem' }}>
                  Rare Guarantee
                </Link>
              </>
            ) : user.isAdmin ? (
              <Link to="/admin" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '0.85rem' }}>
                Admin Dashboard <ArrowRight size={18} />
              </Link>
            ) : user.isStoreOwner ? (
              <Link to="/supplier" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '0.85rem' }}>
                Supplier Dashboard <ArrowRight size={18} />
              </Link>
            ) : user.isWriter ? (
              <Link to="/writer" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '0.85rem' }}>
                Writer Journal <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/catalog" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '0.85rem' }}>
                Browse Collection <ArrowRight size={18} />
              </Link>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '3rem', marginTop: '4rem', color: 'var(--color-text-secondary)' }}>
            <div>
              <h3 style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>{user?.isStoreOwner ? '100+' : user?.isWriter ? 'Global' : '10k+'}</h3>
              <p style={{ fontSize: '0.85rem' }}>{user?.isStoreOwner ? 'Retail Partners' : user?.isWriter ? 'Reach' : 'Books Available'}</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>{user?.isStoreOwner ? 'Express' : user?.isWriter ? 'Direct' : '50k+'}</h3>
              <p style={{ fontSize: '0.85rem' }}>{user?.isStoreOwner ? 'Fulfillment' : user?.isWriter ? 'Royalties' : 'Active Readers'}</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>{user?.isStoreOwner ? 'B2B' : user?.isWriter ? 'Full' : '4.9/5'}</h3>
              <p style={{ fontSize: '0.85rem' }}>{user?.isStoreOwner ? 'Wholesale Scale' : user?.isWriter ? 'Ownership' : 'User Ratings'}</p>
            </div>
          </div>
        </div>
        
        <div className="hero-image-container">
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%' }}>
            {/* Dynamic catalog book image */}
            <div style={{ 
              width: '360px', 
              height: '480px', 
              borderRadius: '4px', 
              overflow: 'hidden', 
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2)',
              filter: 'grayscale(40%)',
              background: 'var(--color-bg-tertiary)'
            }}>
              {featuredBook?.image_url ? (
                <img 
                  src={featuredBook.image_url} 
                  alt={featuredBook.title || 'Featured Book'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>
                  Loading...
                </div>
              )}
            </div>

            {/* Spotlight label overlay */}
            {featuredBook && (
              <div style={{ 
                position: 'absolute', 
                bottom: '30px', 
                left: '10%', 
                background: 'var(--color-accent-primary)', 
                color: 'white',
                padding: '0.75rem 1.25rem', 
                zIndex: 10,
                maxWidth: '260px'
              }}>
                <p style={{ fontSize: '0.65rem', fontWeight: '600', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 0.2rem 0', opacity: 0.85 }}>
                  Spotlight: Featured Edition
                </p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', fontFamily: 'var(--font-serif)' }}>
                  {featuredBook.title}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {user && !user.isStoreOwner && <NewWriterSpotlight />}
    </div>
  );
}
