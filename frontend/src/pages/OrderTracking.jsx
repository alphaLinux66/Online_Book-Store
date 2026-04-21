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

  // Simulate tracking progression every 5 seconds
  useEffect(() => {
    if (currentStep >= STEPS.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <button onClick={() => navigate('/catalog')} style={{ background: 'transparent', border: 'none', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h2 className="text-gradient" style={{ margin: 0 }}>Track Your Order</h2>
            <p style={{ color: '#a1a1aa', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Order ID: #{Math.floor(100000 + Math.random() * 900000)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'block' }}>Estimated Delivery</span>
            <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>Today</span>
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: '3rem' }}>
          {/* Tracking Pipeline line */}
          <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', zIndex: 0, borderRadius: '2px' }}>
            <div style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, #8b5cf6, #c084fc)', 
              borderRadius: '2px',
              width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
              transition: 'width 1s ease-in-out'
            }} />
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px', textAlign: 'center' }}>
                  
                  {/* Icon Circle */}
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: isActive ? 'linear-gradient(135deg, #8b5cf6, #c084fc)' : '#18181b', // Using dark grey for inactive to fit the glass
                    border: `2px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
                    boxShadow: isActive ? '0 0 15px rgba(139, 92, 246, 0.5)' : 'none',
                    color: isActive ? 'white' : '#71717a',
                    transition: 'all 0.5s ease-in-out',
                    marginBottom: '1rem'
                  }}>
                    <Icon size={24} className={isCurrent ? "pulse-anim" : ""} />
                  </div>

                  {/* Text Details */}
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '0.9rem', 
                    color: isActive ? 'white' : '#a1a1aa',
                    fontWeight: isActive ? 'bold' : 'normal',
                    transition: 'color 0.5s'
                  }}>
                    {step.label}
                  </h4>
                  <p style={{ 
                    margin: '0.5rem 0 0 0', 
                    fontSize: '0.75rem', 
                    color: '#71717a',
                    opacity: isActive ? 1 : 0.5
                  }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '4rem', padding: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ color: '#e4e4e7', margin: 0, fontSize: '0.9rem' }}>
            {currentStep === 4 ? 
              "Your order has been delivered! Enjoy your books." : 
              "We are processing your order and simulating its movement. Updates will appear every 5 seconds automatically."}
          </p>
        </div>

      </div>
    </div>
  );
}
