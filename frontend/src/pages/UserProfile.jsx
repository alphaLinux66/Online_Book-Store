import React, { useState, useEffect } from 'react';
import { fetchMyOrders } from '../services/api';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
         <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>
             {user?.username?.charAt(0).toUpperCase()}
         </div>
         <div>
             <h1 className="text-gradient" style={{ margin: 0 }}>My Profile</h1>
             <p style={{ color: 'var(--color-text-secondary)', margin: '0.2rem 0 0 0' }}>{user?.email} | Customer Account</p>
         </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={24} /> Order History
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>Loading history...</div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>You haven't placed any orders yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Browse Catalog</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: order.status.toLowerCase() === 'delivered' ? '4px solid #10b981' : '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                 <div>
                     <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         Order #{order.id}
                         <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: order.status.toLowerCase() === 'delivered' ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                             {order.status.toLowerCase() === 'delivered' ? <CheckCircle size={12}/> : <Clock size={12}/>} {order.status}
                         </span>
                     </h3>
                     <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                     <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Total Amount</p>
                     <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>₹{order.total_amount}</p>
                 </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                          <span style={{ fontSize: '0.9rem' }}>
                              <span style={{ color: 'var(--color-text-secondary)' }}>{item.quantity}x</span> {item.book.title}
                          </span>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>₹{item.price_at_purchase}</span>
                      </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
