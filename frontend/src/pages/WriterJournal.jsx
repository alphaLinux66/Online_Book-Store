import React, { useState, useEffect } from 'react';
import { PenTool, TrendingUp, Users, BookOpen, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getWriterAnalytics } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WriterJournal() {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [demoFile, setDemoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchBooks(), fetchAnalytics()]);
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    try {
      const data = await getWriterAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/writer-books/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('price', formData.price);
    // we need to pass a default author since it's required by Book model, although writer takes precedence
    submitData.append('author', 'Writer'); 
    if (formData.image_url) submitData.append('image_url', formData.image_url);
    if (pdfFile) submitData.append('pdf_file', pdfFile);
    if (demoFile) submitData.append('demo_file', demoFile);

    try {
      const res = await fetch('http://localhost:8000/api/writer-books/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type; let browser set boundary for multipart/form-data
        },
        body: submitData
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ title: '', description: '', price: '', image_url: '' });
        setPdfFile(null);
        setDemoFile(null);
        fetchBooks();
      } else {
        const err = await res.json();
        console.error("Upload failed", err);
        alert("Upload failed. Please check the form data.");
      }
    } catch (e) {
      console.error(e);
      alert("Error uploading book.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Writer Journal</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Manage your manuscripts, track earnings, and connect with readers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Publish New Book
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--color-accent-primary)' }}>
            <BookOpen size={24} />
            <h3 style={{ margin: 0, color: 'white' }}>Published Works</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{books.length}</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#10b981' }}>
            <TrendingUp size={24} />
            <h3 style={{ margin: 0, color: 'white' }}>Total Purchases</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics?.total_reads || 0}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#8b5cf6' }}>
            <Users size={24} />
            <h3 style={{ margin: 0, color: 'white' }}>Unique Readers</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics?.subscribers || 0}</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: '#f59e0b' }}>
            <span style={{ fontSize: '24px' }}>⭐</span>
            <h3 style={{ margin: 0, color: 'white' }}>Avg. Rating</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics?.avg_rating || '0.0'}<span style={{fontSize: '1rem', color: 'var(--color-text-secondary)'}}>/5</span></p>
        </div>
      </div>
      
      {analytics && analytics.book_stats && analytics.book_stats.length > 0 && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Sales Performance by Book</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.book_stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="title" stroke="#888" tick={{fill: '#888'}} />
                <YAxis stroke="#888" tick={{fill: '#888'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="sales" fill="var(--color-accent-primary)" radius={[4, 4, 0, 0]} name="Copies Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Your Catalog</h2>
        {loading ? (
          <p>Loading catalog...</p>
        ) : books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <PenTool size={48} style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '1rem' }}>Your Journey Begins Here</h3>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
              You haven't published any books yet. Start writing your first masterpiece and share your unique voice with the world!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {books.map(book => (
              <div 
                key={book.id} 
                onClick={() => navigate('/book/' + book.id)}
                style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img 
                  src={book.image_url || 'https://via.placeholder.com/200x300?text=No+Cover'} 
                  alt={book.title} 
                  style={{ width: '100%', height: '280px', objectFit: 'cover' }} 
                />
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{book.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    <span>₹{book.price}</span>
                    {book.is_digital && <span style={{ background: 'var(--color-accent-primary)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>DIGITAL</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ background: 'var(--color-bg-primary)', padding: '1.5rem 2rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
              <h2 style={{ margin: 0, color: 'var(--color-accent-primary)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={24} /> Publish Digital Book
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: '#f3f4f6', border: 'none', color: '#4b5563', cursor: 'pointer', borderRadius: '50%', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#1f2937' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>Book Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', fontSize: '1rem', color: '#111827', outline: 'none', transition: 'border-color 0.2s' }} 
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>Synopsis / Description <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea name="description" rows="4" required value={formData.description} onChange={handleInputChange} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', fontSize: '1rem', color: '#111827', outline: 'none', transition: 'border-color 0.2s', resize: 'vertical' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                ></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>Retail Price (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', fontSize: '1rem', color: '#111827', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.95rem' }}>Cover Image URL</label>
                  <input type="url" name="image_url" placeholder="https://..." value={formData.image_url} onChange={handleInputChange} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', fontSize: '1rem', color: '#111827', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '12px', border: '1px dashed #9ca3af', marginTop: '0.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '1.1rem' }}>Digital Assets (PDF Upload)</h4>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#4b5563' }}>Full Book PDF (Paid Access) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="file" accept=".pdf" required onChange={(e) => handleFileChange(e, setPdfFile)} 
                    style={{ width: '100%', padding: '0.75rem', background: 'white', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} 
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.9rem', color: '#4b5563' }}>Free Demo / Sample PDF <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="file" accept=".pdf" required onChange={(e) => handleFileChange(e, setDemoFile)} 
                    style={{ width: '100%', padding: '0.75rem', background: 'white', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={uploading}>
                  {uploading ? 'Publishing...' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
