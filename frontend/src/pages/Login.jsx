import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await loginUser(formData);
      login(data);
      const payload = JSON.parse(atob(data.access.split('.')[1]));
      if (payload.is_writer) {
        navigate('/writer');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2 style={{ color: 'var(--color-accent-primary)', fontFamily: 'var(--font-serif)' }}>Welcome Back</h2>
          <p>Enter your credentials to access your account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                name="username" 
                className="input-field" 
                placeholder="Enter your username"
                style={{ paddingLeft: '2.5rem' }}
                value={formData.username}
                onChange={handleChange}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '14px', color: 'var(--color-text-secondary)' }} />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                name="password" 
                className="input-field" 
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem' }}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '14px', color: 'var(--color-text-secondary)' }} />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
          
          <div style={{ textAlign: 'right', marginTop: '0.75rem' }}>
            <Link to="/reset-password" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='var(--color-accent-primary)'} onMouseOut={e=>e.target.style.color='var(--color-text-secondary)'}>
              Forgot Password?
            </Link>
          </div>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--color-accent-primary)', fontWeight: '600' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}
