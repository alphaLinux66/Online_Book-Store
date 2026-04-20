import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart, updateCartItemQuantity } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  }, [user]);

  const refreshCart = async () => {
    try {
      const data = await fetchCart();
      setCartItems(data);
      setCartCount(data.reduce((total, item) => total + item.quantity, 0));
    } catch (e) {
      console.error('Failed to load cart', e);
    }
  };

  const addToCart = async (bookId, quantity = 1) => {
    await apiAddToCart(bookId, quantity);
    await refreshCart();
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
        await removeFromCart(cartItemId);
    } else {
        await updateCartItemQuantity(cartItemId, newQuantity);
        await refreshCart();
    }
  };

  const removeFromCart = async (cartItemId) => {
    await apiRemoveFromCart(cartItemId);
    await refreshCart();
  };

  const clearCart = async () => {
    await apiClearCart();
    setCartItems([]);
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
