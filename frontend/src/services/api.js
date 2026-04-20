export const API_BASE_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Registration failed');
  }
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed - Invalid credentials');
  }
  return response.json();
};

export const fetchBooks = async () => {
  const response = await fetch(`${API_BASE_URL}/books/`);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
};

export const fetchBook = async (id) => {
  const response = await fetch(`${API_BASE_URL}/books/${id}/`);
  if (!response.ok) throw new Error('Failed to fetch book');
  return response.json();
};

export const fetchCart = async () => {
  const response = await fetch(`${API_BASE_URL}/cart/`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch cart');
  return response.json();
};

export const addToCart = async (bookId, quantity = 1) => {
  const response = await fetch(`${API_BASE_URL}/cart/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ book_id: bookId, quantity }),
  });
  if (!response.ok) throw new Error('Failed to add to cart');
  return response.json();
};

export const removeFromCart = async (cartItemId) => {
  const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to remove from cart');
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}/`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error('Failed to update quantity');
  return response.json();
};

export const clearCart = async () => {
  const response = await fetch(`${API_BASE_URL}/cart/clear/`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to clear cart');
};

export const submitReview = async (bookId, rating, comment) => {
  const response = await fetch(`${API_BASE_URL}/reviews/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ book: bookId, rating, comment }),
  });
  if (!response.ok) throw new Error('Failed to submit review');
  return response.json();
};
