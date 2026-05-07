import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { fetchBooks, fetchUsers, getAdminAnalytics, createBook, updateBook, deleteBook, deleteUser, deleteReview, fetchSuppliers, fetchSupplierBooks, placeBulkCheckout } from '../services/api';
import { Edit2, Trash2, Plus, X, Users, BookOpen, MessageSquare, BarChart2, TrendingUp, TrendingDown, ShoppingBag } from 'lucide-react';

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [timeRange, setTimeRange] = useState(90);
  
  const [wholesaleBooks, setWholesaleBooks] = useState([]);
  const [b2bCart, setB2bCart] = useState({});
  
  const [formData, setFormData] = useState({
    title: '', author: '', price: '', description: '', image_url: '', stock: 0
  });

  const loadData = async () => {
    try {
      if (activeTab === 'books') {
        const b = await fetchBooks();
        setBooks(b);
      } else if (activeTab === 'users') {
        const u = await fetchUsers();
        setUsers(u);
      } else if (activeTab === 'analytics') {
        const a = await getAdminAnalytics(timeRange);
        setAnalytics(a);
      } else if (activeTab === 'wholesale') {
        const wb = await fetchSupplierBooks();
        setWholesaleBooks(wb);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, timeRange]);

  const handleOpenModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title, author: book.author, price: book.price, description: book.description, image_url: book.image_url, stock: book.stock || 0
      });
    } else {
      setEditingBook(null);
      setFormData({ title: '', author: '', price: '', description: '', image_url: '', stock: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await updateBook(editingBook.id, formData);
      } else {
        await createBook(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Error saving book');
    }
  };

  const handleDeleteBook = async (id) => {
    if(window.confirm('Are you sure you want to delete this book?')) {
      await deleteBook(id);
      loadData();
    }
  };

  const handleDeleteUser = async (id) => {
    if(window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
      loadData();
    }
  };

  const handleB2bAddToCart = (book) => {
    setB2bCart(prev => ({
      ...prev,
      [book.id]: { book, quantity: (prev[book.id]?.quantity || 0) + 1 }
    }));
  };

  const handleB2bCheckout = async (storeOwnerId) => {
    const itemsToBuy = Object.values(b2bCart).filter(item => item.book.owner === storeOwnerId).map(i => ({
      id: i.book.id,
      quantity: i.quantity,
      wholesale_price: i.book.wholesale_price
    }));
    
    if (itemsToBuy.length === 0) return;
    
    try {
        await placeBulkCheckout(storeOwnerId, itemsToBuy);
        alert("Bulk Order Placed Successfully! Suppliers will be notified.");
        
        // Remove bought items from cart UI
        const newCart = {...b2bCart};
        Object.keys(newCart).forEach(id => {
            if(newCart[id].book.owner === storeOwnerId) delete newCart[id];
        });
        setB2bCart(newCart);
        
        loadData();
    } catch (e) {
        alert("Checkout failed");
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 className="text-gradient">Admin Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('analytics')}>
          <BarChart2 size={16} /> Analytics
        </button>
        <button className={`btn ${activeTab === 'books' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('books')}>
          <BookOpen size={16} /> Manage Books
        </button>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('users')}>
          <Users size={16} /> Manage Users
        </button>
        <button className={`btn ${activeTab === 'wholesale' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('wholesale')}>
          <ShoppingBag size={16} /> Wholesale Desk
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {activeTab === 'analytics' && analytics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {analytics.kpis && analytics.kpis.map((kpi, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                  
                  {/* Top Row: Title + Trend Pill */}
                  <div style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {kpi.title}
                    <span style={{ color: '#e4e4e7', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', border: '1px solid #3f3f46', padding: '2px 8px', borderRadius: '16px' }}>
                      {kpi.trendUp ? <TrendingUp size={12}/> : <TrendingDown size={12}/>} {kpi.trend}
                    </span>
                  </div>

                  {/* Value Row */}
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', letterSpacing: '-0.05em' }}>
                    {kpi.value}
                  </div>

                  {/* Subtext Rows */}
                  <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#e4e4e7', marginBottom: '6px' }}>
                    {kpi.trendUp ? 'Trending up this month' : 'Down 20% this period'} 
                    {kpi.trendUp ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                  </div>
                  <div style={{ color: '#71717a', fontSize: '0.85rem' }}>
                    {kpi.subText}
                  </div>
                  
                </div>
              ))}
            </div>

            {/* Total Revenue Area Chart */}
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '1.1rem' }}>Activity Volumes</h3>
                  <span style={{ color: '#71717a', fontSize: '0.9rem' }}>Gross volume for the selected period</span>
                </div>
                <div style={{ display: 'flex', border: '1px solid #3f3f46', borderRadius: '6px', overflow: 'hidden' }}>
                    <button onClick={() => setTimeRange(90)} style={{ background: timeRange === 90 ? '#27272a' : 'transparent', color: 'white', border: 'none', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>Last 3 months</button>
                    <button onClick={() => setTimeRange(30)} style={{ background: timeRange === 30 ? '#27272a' : 'transparent', color: 'white', border: 'none', borderLeft: '1px solid #3f3f46', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>Last 30 days</button>
                    <button onClick={() => setTimeRange(7)} style={{ background: timeRange === 7 ? '#27272a' : 'transparent', color: 'white', border: 'none', borderLeft: '1px solid #3f3f46', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>Last 7 days</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.timeseries} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={20} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', color: '#fff', borderRadius: '8px' }} itemStyle={{ color: '#e4e4e7' }} />
                  <Area type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
                  <Area type="monotone" dataKey="interactions" stroke="#e879f9" strokeWidth={2} fillOpacity={1} fill="url(#colorSecondary)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Row Charts */}
            {(analytics.chat_intents?.length > 0 || analytics.book_mentions?.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                
                {analytics.book_mentions?.length > 0 && (
                  <>
                    <div className="glass-panel" style={{ padding: '1rem' }}>
                      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>Sales Distribution (Pie)</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={analytics.book_mentions} dataKey="count" nameKey="matched_book__title" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                            {analytics.book_mentions.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="glass-panel" style={{ padding: '1rem' }}>
                      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>Top Purchased Books (Histogram)</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.book_mentions}>
                          <XAxis dataKey="matched_book__title" tick={{fill: 'var(--color-text-secondary)'}} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}

              </div>
            )}
          </div>
        )}

        {activeTab === 'books' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Catalog</h2>
              <button className="btn btn-primary" onClick={() => handleOpenModal()}><Plus size={16} /> Add Book</button>
            </div>
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>Title</th>
                    <th style={{ padding: '1rem' }}>Author</th>
                    <th style={{ padding: '1rem' }}>Price</th>
                    <th style={{ padding: '1rem' }}>Stock</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>{b.title}</td>
                      <td style={{ padding: '1rem' }}>{b.author}</td>
                      <td style={{ padding: '1rem' }}>₹{b.price}</td>
                      <td style={{ padding: '1rem' }}>
                        {b.stock > 0 ? (
                            <span>{b.stock}</span>
                        ) : (
                            <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>0 <span style={{fontSize: '0.7rem', padding: '2px 4px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '4px'}}>Empty!</span></span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(b)} style={{ background: 'var(--color-bg-secondary)' }}><Edit2 size={16} /></button>
                        <button className="btn-icon" onClick={() => handleDeleteBook(b.id)} style={{ background: '#fee2e2', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2>Registered Users</h2>
            <div className="glass-panel" style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>Username</th>
                    <th style={{ padding: '1rem' }}>Email</th>
                    <th style={{ padding: '1rem' }}>Role</th>
                    <th style={{ padding: '1rem' }}>Joined</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>{u.username}</td>
                      <td style={{ padding: '1rem' }}>{u.email || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        {u.is_superuser ? <span style={{ color: 'var(--color-accent-primary)', fontWeight: 'bold' }}>Superadmin</span> : (u.is_staff ? 'Admin' : 'Customer')}
                      </td>
                      <td style={{ padding: '1rem' }}>{new Date(u.date_joined).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        {!u.is_superuser && (
                            <button className="btn-icon" onClick={() => handleDeleteUser(u.id)} style={{ background: '#fee2e2', color: '#ef4444' }}><Trash2 size={16} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'wholesale' && (
          <div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '2', minWidth: '400px' }}>
                <h2 style={{ marginBottom: '1rem' }}>Supplier Catalog</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {wholesaleBooks.length === 0 ? (
                       <p style={{ color: 'var(--color-text-secondary)' }}>No wholesalers are currently listing books.</p>
                    ) : wholesaleBooks.map(book => (
                        <div key={book.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{book.title}</h3>
                                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>By {book.author} | Supplier: <span style={{ color: 'white' }}>{book.store_name}</span></p>
                                <p style={{ margin: 0, fontWeight: 'bold', color: '#10b981' }}>Wholesale Price: ₹{book.wholesale_price} <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8.5rem', fontWeight: 'normal' }}>({book.stock_quantity} available in warehouse)</span></p>
                            </div>
                            <button className="btn-icon" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--color-accent-primary)', height: '40px', width: '40px' }} onClick={() => handleB2bAddToCart(book)}>
                                <Plus size={20} />
                            </button>
                        </div>
                    ))}
                </div>
              </div>
              
              <div style={{ flex: '1', minWidth: '300px' }}>
                  <div className="glass-panel sticky" style={{ top: '100px', padding: '1.5rem' }}>
                      <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>B2B Purchase Cart</h2>
                      
                      {Object.keys(b2bCart).length === 0 ? (
                          <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Cart is empty</div>
                      ) : (
                          <div>
                              {Object.entries(
                                  Object.values(b2bCart).reduce((acc, item) => {
                                      acc[item.book.owner] = acc[item.book.owner] || { store_name: item.book.store_name, items: [] };
                                      acc[item.book.owner].items.push(item);
                                      return acc;
                                  }, {})
                              ).map(([ownerId, group]) => (
                                  <div key={ownerId} style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                      <h4 style={{ margin: '0 0 1rem 0' }}>Ordering from: <span style={{ color: 'var(--color-accent-primary)' }}>{group.store_name}</span></h4>
                                      {group.items.map(item => (
                                          <div key={item.book.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                              <span>{item.quantity}x {item.book.title}</span>
                                              <span>₹{(item.book.wholesale_price * item.quantity).toFixed(2)}</span>
                                          </div>
                                      ))}
                                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1rem', paddingTop: '1rem', textAlign: 'right' }}>
                                          <strong>Total Invoice: ₹{group.items.reduce((sum, item) => sum + (item.book.wholesale_price * item.quantity), 0).toFixed(2)}</strong>
                                          <br/>
                                          <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => handleB2bCheckout(Number(ownerId))}>Dispatch Bulk Order</button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', backgroundColor: 'var(--color-bg-primary)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" className="form-input" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/>
              <input type="text" className="form-input" placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required/>
              <input type="number" step="0.01" className="form-input" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required/>
              <input type="number" className="form-input" placeholder="Stock Quantity" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} required/>
              <input type="url" className="form-input" placeholder="Image URL (Optional)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              <textarea className="form-input" placeholder="Description" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Save Details</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
