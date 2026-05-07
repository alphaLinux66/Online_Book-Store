import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BookOpen, LogOut, ShoppingCart } from 'lucide-react';

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
        <Link to="/" className="nav-brand">
          <BookOpen className="text-gradient" size={28} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Papyrus <span className="text-gradient">Plaza</span></span>
        </Link>
        
        <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {!user?.isAdmin && (
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
                    Catalog
                  </Link>
                  <Link to="/cart" className="btn-icon" style={{ textDecoration: 'none', position: 'relative' }}>
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#ef4444',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem', paddingRight: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        {initial}
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#e4e4e7', fontWeight: '500' }}>
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
                      background: 'rgba(30, 30, 35, 0.95)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      minWidth: '150px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
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
                            color: 'white',
                            textDecoration: 'none',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
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
                        color: '#ef4444',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
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
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
