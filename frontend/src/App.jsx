import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import BookDetail from './pages/BookDetail';
import OrderTracking from './pages/OrderTracking';

// Components
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

import AdminDashboard from './pages/AdminDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import UserProfile from './pages/UserProfile';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.isStoreOwner) return <Navigate to="/supplier" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || !user.isAdmin) return <Navigate to="/" replace />;
  return children;
};

const SupplierRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || !user.isStoreOwner) return <Navigate to="/" replace />;
  return children;
};

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hideChatbotPaths = ['/checkout', '/login', '/register', '/admin', '/supplier'];
  const showChatbot = !hideChatbotPaths.includes(location.pathname) && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/supplier') && !(user?.isAdmin) && !(user?.isStoreOwner);

  return (
    <div className="app-container">
      <div className="app-bg" />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
          <Route path="/book/:id" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          
          <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/supplier/*" element={<SupplierRoute><StoreOwnerDashboard /></SupplierRoute>} />
        </Routes>
      </main>
      {showChatbot && <Chatbot />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
