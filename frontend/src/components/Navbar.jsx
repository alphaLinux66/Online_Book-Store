import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { LogOut, ShoppingCart, Search, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="nav-brand" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-primary)' }}>PAPYRUS PLAZA</span>
        </Link>
        
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {!user?.isAdmin && !user?.isStoreOwner && !user?.isWriter && (
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>
          )}
          {user?.isAdmin && (
            <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
              Admin Panel
            </Link>
          )}
          
          {user?.isStoreOwner && (
            <Link to="/supplier" className={`nav-link ${location.pathname.startsWith('/supplier') ? 'active' : ''}`}>
              Supplier Portal
            </Link>
          )}
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {!user.isAdmin && !user.isStoreOwner && !user.isWriter && (
                <>
                  <Link to="/catalog" className={`nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}>
                    Browse
                  </Link>
                  <Link to="/cart" style={{ textDecoration: 'none', position: 'relative', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--color-glass-border)', transition: 'all 0.2s' }}>
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#dc2626',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              {user.isWriter && (
                <Link to="/writer" className={`nav-link ${location.pathname === '/writer' ? 'active' : ''}`}>
                  Writer Journal
                </Link>
              )}

              {/* Profile Badge Dropdown Area */}
              <div ref={profileRef} style={{ position: 'relative', cursor: 'pointer', marginLeft: '0.5rem' }} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                {(() => {
                  const displayName = user.username || 'User';
                  const initial = displayName.charAt(0).toUpperCase();
                  const fullName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                  
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem', paddingRight: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '30px', border: '1px solid var(--color-glass-border)' }}>
                      <div style={{ background: 'var(--color-accent-primary)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {initial}
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                        {fullName}
                      </span>
                    </div>
                  );
                })()}

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: '100%', 
                      right: 0, 
                      marginTop: '0.5rem', 
                      background: 'white', 
                      border: '1px solid var(--color-glass-border)', 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      minWidth: '150px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      zIndex: 50,
                    }}>
                      {!user.isAdmin && !user.isStoreOwner && (
                        <Link 
                          to="/profile"
                          style={{ 
                            width: '100%', 
                            padding: '0.8rem 1rem', 
                            fontSize: '0.9rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none',
                            borderBottom: '1px solid var(--color-glass-border)',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Profile
                        </Link>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          logout();
                        }}
                        style={{
                          width: '100%', 
                          padding: '0.8rem 1rem', 
                          fontSize: '0.9rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                        gap: '0.5rem', 
                        background: 'transparent',
                        color: '#dc2626',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                 </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
