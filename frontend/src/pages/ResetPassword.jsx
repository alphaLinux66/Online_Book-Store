import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { Mail, Lock, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const [formData, setFormData] = useState({ username: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await resetPassword(formData.username, formData.newPassword);
      setSuccess('Password has been reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
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
          <h2 className="text-gradient">Reset Password</h2>
          <p>Create a new password for your account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}><CheckCircle size={18} /> {success}</div>}
        
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
            <label className="input-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                name="newPassword" 
                className="input-field" 
                placeholder="••••••••"
                style={{ paddingLeft: '2.5rem' }}
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '14px', color: 'var(--color-text-secondary)' }} />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || success}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Remembered your password? </span>
          <Link to="/login" style={{ color: 'var(--color-accent-primary)', fontWeight: '600' }}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
