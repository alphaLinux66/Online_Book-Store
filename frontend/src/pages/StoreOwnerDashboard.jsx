import React, { useState, useEffect } from 'react';
import { fetchSupplierBooks, createSupplierBook, updateSupplierBook, fetchStoreOrders, updateStoreOrderStatus } from '../services/api';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function StoreOwnerDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '', author: '', wholesale_price: '', stock_quantity: '', description: '', image_url: ''
  });

  const loadData = async () => {
    try {
      if (activeTab === 'inventory') {
        const b = await fetchSupplierBooks();
        setBooks(b);
      } else {
        const o = await fetchStoreOrders();
        setOrders(o);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleOpenForm = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData(book);
    } else {
      setEditingBook(null);
      setFormData({ title: '', author: '', wholesale_price: '', stock_quantity: '', description: '', image_url: '' });
    }
    setShowBookForm(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await updateSupplierBook(editingBook.id, formData);
      } else {
        await createSupplierBook(formData);
      }
      setShowBookForm(false);
      loadData();
    } catch (err) {
      alert("Failed to save wholesale listing.");
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
      try {
          await updateStoreOrderStatus(orderId, status);
          loadData();
      } catch (err) {
          alert("Failed to update status.");
      }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ color: 'var(--color-accent-primary)', fontFamily: 'var(--font-serif)' }}>Supplier B2B Portal</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Manage your wholesale inventory and fulfill bulk orders for retail distributors.</p>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '1rem' }}>
        <button className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('inventory')}>
          Wholesale Inventory
        </button>
        <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('orders')}>
          Active Orders
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)' }}>Your Listed Titles</h2>
              <button className="btn btn-primary" onClick={() => handleOpenForm()}>List New Book</button>
            </div>
            
            {showBookForm && (
              <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                 <h3 style={{ fontFamily: 'var(--font-serif)' }}>{editingBook ? 'Edit Book' : 'List Book for B2B Purchasing'}</h3>
                 <form onSubmit={handleSaveBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="text" className="input-field" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{flex: 1}}/>
                      <input type="text" className="input-field" placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} required style={{flex: 1}}/>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input type="number" step="0.01" className="input-field" placeholder="Wholesale Price (₹)" value={formData.wholesale_price} onChange={e => setFormData({...formData, wholesale_price: e.target.value})} required style={{flex: 1}}/>
                      <input type="number" className="input-field" placeholder="Stock Quantity available" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} required style={{flex: 1}}/>
                    </div>
                    <input type="url" className="input-field" placeholder="Image URL (Optional)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                    <textarea className="input-field" placeholder="Book synopsis/description" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowBookForm(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Listing</button>
                    </div>
                 </form>
              </div>
            )}

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-glass-border)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                    <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wholesale Price</th>
                    <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Available Stock</th>
                    <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                      <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No wholesale listings yet.</td></tr>
                  ) : books.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-glass-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{b.title} <br/><span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{b.author}</span></td>
                      <td style={{ padding: '1rem', color: '#16a34a', fontWeight: 'bold' }}>₹{b.wholesale_price}</td>
                      <td style={{ padding: '1rem' }}>{b.stock_quantity} units</td>
                      <td style={{ padding: '1rem' }}>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleOpenForm(b)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Fulfillment Queue</h2>
            {orders.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>No B2B orders pending.</div>
            ) : orders.map(order => (
                <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem', borderLeft: order.status === 'Pending' ? '4px solid #f59e0b' : (order.status === 'Shipped' ? '4px solid #3b82f6' : '4px solid #16a34a') }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                       <div>
                           <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-serif)' }}>
                               Order #{order.id} 
                               <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'var(--color-bg-secondary)' }}>{order.status}</span>
                           </h3>
                           <p style={{ margin: '0.5rem 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Placed by Retail Admin: <strong style={{ color: 'var(--color-text-primary)' }}>{order.admin_name}</strong></p>
                           <p style={{ margin: '0', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Invoice Total: <span style={{ color: '#16a34a', fontWeight: 'bold' }}>₹{order.total_amount}</span></p>
                       </div>
                       
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                           {order.status === 'Pending' && (
                               <button className="btn btn-primary" onClick={() => handleUpdateStatus(order.id, 'Shipped')}><Truck size={16}/> Mark Shipped</button>
                           )}
                           {order.status === 'Shipped' && (
                               <button className="btn" style={{ background: '#16a34a', color: 'white' }} onClick={() => handleUpdateStatus(order.id, 'Delivered')}><CheckCircle size={16}/> Confirm Delivery to Retailer</button>
                           )}
                       </div>
                   </div>

                   <div style={{ background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                       <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Items Ordered:</h4>
                       {order.items.map(item => (
                           <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-glass-border)' }}>
                               <span>{item.quantity}x {item.supplier_book_details?.title}</span>
                               <span style={{ color: 'var(--color-text-secondary)' }}>@ ₹{item.price_at_purchase}/unit</span>
                           </div>
                       ))}
                   </div>
                </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
