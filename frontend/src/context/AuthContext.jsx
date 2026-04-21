import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ isLoggedIn: true, isAdmin: payload.is_admin || false, isStoreOwner: payload.is_store_owner || false, ...payload });
      } catch (e) {
        setUser({ isLoggedIn: true, isAdmin: false, isStoreOwner: false });
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (data) => {
    localStorage.setItem('accessToken', data.access);
    if (data.refresh) {
      localStorage.setItem('refreshToken', data.refresh);
    }
    setToken(data.access);
    try {
        const payload = JSON.parse(atob(data.access.split('.')[1]));
        setUser({ isLoggedIn: true, isAdmin: payload.is_admin || false, isStoreOwner: payload.is_store_owner || false, ...payload });
    } catch (e) {
        setUser({ isLoggedIn: true, isAdmin: false, isStoreOwner: false });
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
