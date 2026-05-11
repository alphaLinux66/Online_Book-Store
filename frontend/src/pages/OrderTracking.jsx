import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Cog, Truck, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';

const STEPS = [
  { id: 0, label: 'Order Placed', desc: 'We have received your order.', icon: Package },
  { id: 1, label: 'Processing', desc: 'Your order is being prepared.', icon: Cog },
  { id: 2, label: 'Shipped', desc: 'Your package has been handed to the courier.', icon: Truck },
  { id: 3, label: 'Out for Delivery', desc: 'The courier is out to deliver your package.', icon: MapPin },
  { id: 4, label: 'Delivered', desc: 'Package arrived safely.', icon: CheckCircle }
];

export default function OrderTracking() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep >= STEPS.length - 1) return;
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/catalog')} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Collection
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-glass-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-accent-primary)', fontFamily: 'var(--font-serif)' }}>Track Your Order</h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Order ID: #{Math.floor(100000 + Math.random() * 900000)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'block' }}>Estimated Delivery</span>
            <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>Today</span>
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: '3rem' }}>
          <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '4px', background: '#E5E7EB', zIndex: 0, borderRadius: '2px' }}>
            <div style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, #0A2463, #1E3A8A)', 
              borderRadius: '2px',
              width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
              transition: 'width 1s ease-in-out'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px', textAlign: 'center' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? 'var(--color-accent-primary)' : 'white',
                    border: `2px solid ${isActive ? 'var(--color-accent-primary)' : '#D4D4D8'}`,
                    boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                    color: isActive ? 'white' : '#A1A1AA',
                    transition: 'all 0.5s ease-in-out',
                    marginBottom: '1rem'
                  }}>
                    <Icon size={24} />
                  </div>

                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', fontWeight: isActive ? 'bold' : 'normal', transition: 'color 0.5s' }}>
                    {step.label}
                  </h4>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)', opacity: isActive ? 1 : 0.5 }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '4rem', padding: '1.5rem', background: 'rgba(10, 36, 99, 0.04)', border: '1px solid rgba(10, 36, 99, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-primary)', margin: 0, fontSize: '0.9rem' }}>
            {currentStep === 4 ? 
              "Your order has been delivered! Enjoy your books." : 
              "We are processing your order and simulating its movement. Updates will appear every 5 seconds automatically."}
          </p>
        </div>
      </div>
    </div>
  );
}
