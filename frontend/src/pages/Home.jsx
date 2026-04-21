import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="container animate-fade-in">
      <div className="hero-section">
        <div className="hero-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', color: 'var(--color-accent-primary)', fontWeight: '600', marginBottom: '1.5rem' }}>
            <Star size={16} fill="currentColor" />
            <span>{user?.isStoreOwner ? 'Supplier Partner Network' : 'Premium Reading Experience'}</span>
          </div>
          
          <h1 className="hero-title">
            {user?.isStoreOwner ? (
                <>Manage Your Wholesale <br /><span className="text-gradient">Business Pipeline</span></>
            ) : (
                <>Discover Your Next <br /><span className="text-gradient">Favorite Story</span></>
            )}
          </h1>
          
          <p className="hero-subtitle">
            {user?.isStoreOwner 
              ? "Track active bulk invoices, update your warehouse inventory stock, and dispatch seamless B2B shipments directly to the retail district."
              : "Immerse yourself in our curated collection of bestselling novels, rare finds, and inspiring non-fiction. Your literary journey begins here."}
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  Start Reading <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  Sign In
                </Link>
              </>
            ) : user.isAdmin ? (
              <Link to="/admin" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Admin Dashboard <ArrowRight size={20} />
              </Link>
            ) : user.isStoreOwner ? (
              <Link to="/supplier" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Supplier Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <Link to="/catalog" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Browse Catalog <BookOpen size={20} />
              </Link>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '3rem', marginTop: '4rem', color: 'var(--color-text-secondary)' }}>
            <div>
              <h3 style={{ color: 'var(--color-text-primary)' }}>{user?.isStoreOwner ? '100+' : '10k+'}</h3>
              <p>{user?.isStoreOwner ? 'Retail Partners' : 'Books Available'}</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--color-text-primary)' }}>{user?.isStoreOwner ? 'Express' : '50k+'}</h3>
              <p>{user?.isStoreOwner ? 'Fulfillment' : 'Active Readers'}</p>
            </div>
            <div>
              <h3 style={{ color: 'var(--color-text-primary)' }}>{user?.isStoreOwner ? 'B2B' : '4.9/5'}</h3>
              <p>{user?.isStoreOwner ? 'Wholesale Scale' : 'User Ratings'}</p>
            </div>
          </div>
        </div>
        
        <div className="hero-image-container animate-float">
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%' }}>
            
            <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.5))' }}>
              <circle cx="200" cy="200" r="160" fill="url(#main_grad)" opacity="0.15" />
              <path d="M110 250L150 170L250 210L210 290L110 250Z" fill="url(#book_base)" />
              <path d="M190 140L230 90L330 130L290 210L190 140Z" fill="url(#book_top)" opacity="0.9" />
              <path d="M150 170L250 210L330 130L230 90L150 170Z" fill="rgba(255,255,255,0.15)" />
              
              <defs>
                <linearGradient id="main_grad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="book_base" x1="110" y1="170" x2="250" y2="290" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="book_top" x1="190" y1="90" x2="330" y2="210" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>

            <div className="glass-panel" style={{ position: 'absolute', bottom: '20px', left: '10%', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 10 }}>
              <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '50%', color: 'var(--color-accent-primary)' }}>
                <BookOpen size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 'bold', fontSize: '1rem', color: 'white' }}>Endless Magic</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Curated Bestsellers</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
