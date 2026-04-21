import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSupplier, setIsSupplier] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSupplier) {
          // Custom fetch for supplier
          const response = await fetch('http://localhost:8000/api/auth/register-supplier/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({...formData, store_name: formData.storeName || undefined })
          });
          if (!response.ok) throw new Error("Failed to register as Supplier");
      } else {
          await registerUser(formData);
      }
      
      // Auto login after registration
      const data = await loginUser({ username: formData.username, password: formData.password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-card glass-panel" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <h2 className="text-gradient">Create Account</h2>
          <p>Join Nyeras Book Store today</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Username</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  name="username" 
                  className="input-field" 
                  placeholder="Username"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '14px', color: 'var(--color-text-secondary)' }} />
              </div>
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Email</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  name="email" 
                  className="input-field" 
                  placeholder="Email address"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '14px', color: 'var(--color-text-secondary)' }} />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">First Name</label>
              <input 
                type="text" 
                name="firstName" 
                className="input-field" 
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Last Name</label>
              <input 
                type="text" 
                name="lastName" 
                className="input-field" 
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                name="password" 
                className="input-field" 
                placeholder="Create a strong password"
                style={{ paddingLeft: '2.5rem' }}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '14px', color: 'var(--color-text-secondary)' }} />
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1rem' }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#e4e4e7', fontSize: '0.9rem' }}>
               <input type="checkbox" checked={isSupplier} onChange={() => setIsSupplier(!isSupplier)} />
               I want to register as a Wholesale Supplier
             </label>
             {isSupplier && (
                <div className="input-group" style={{ marginTop: '1rem', animation: 'fadeIn 0.3s' }}>
                  <label className="input-label">Store / Company Name</label>
                  <input 
                    type="text" 
                    name="storeName" 
                    className="input-field" 
                    placeholder="Enter your registered business name"
                    value={formData.storeName || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
             )}
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--color-accent-primary)', fontWeight: '600' }}>Sign In here</Link>
        </div>
      </div>
    </div>
  );
}
