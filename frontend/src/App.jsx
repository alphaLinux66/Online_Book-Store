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
import ResetPassword from './pages/ResetPassword';

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
  if (user.isWriter) return <Navigate to="/writer" replace />;
  return children;
};

import WriterJournal from './pages/WriterJournal';

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

const WriterRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || !user.isWriter) return <Navigate to="/" replace />;
  return children;
};

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hideChatbotPaths = ['/checkout', '/login', '/register', '/admin', '/supplier', '/writer', '/reset-password'];
  const showChatbot = user && !hideChatbotPaths.includes(location.pathname) && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/supplier') && !(user?.isAdmin) && !(user?.isStoreOwner) && !(user?.isWriter);

  return (
    <div className="app-container">
      <div className="app-bg" />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/writer" element={<WriterRoute><WriterJournal /></WriterRoute>} />
          
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
