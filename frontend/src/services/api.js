export const API_BASE_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
     const errorText = await response.text();
     throw new Error(`API Error: ${response.status} ${errorText}`);
  }
  if (response.status === 204) return null;
  return response.json();
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

export const checkoutOrder = async () => {
    return await fetchWithAuth('/checkout/', {
        method: 'POST'
    });
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

export const fetchMyOrders = async () => {
    return await fetchWithAuth('/my-orders/');
}

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

export const createReview = async (data) => {
  return await fetchWithAuth('/reviews/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const logChatInteraction = async (data) => {
  const response = await fetch(`${API_BASE_URL}/chat/log/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to log chat stat');
  return response.json();
};

export const getAdminAnalytics = async (days = 90) => {
    return await fetchWithAuth(`/admin/analytics/?days=${days}`);
};

// ==============================
// STORE OWNER & B2B MODULE APIs
// ==============================

// Suppliers listing books
export const fetchSupplierBooks = async () => {
    return await fetchWithAuth('/supplier-books/');
};

export const createSupplierBook = async (bookData) => {
    return await fetchWithAuth('/supplier-books/', {
        method: 'POST',
        body: JSON.stringify(bookData)
    });
};

export const updateSupplierBook = async (id, bookData) => {
    return await fetchWithAuth(`/supplier-books/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(bookData)
    });
};

export const fetchStoreOrders = async () => {
    return await fetchWithAuth('/bulk-orders/');
};

export const updateStoreOrderStatus = async (orderId, status) => {
    return await fetchWithAuth(`/bulk-orders/${orderId}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
};

// Admin browsing and B2B checkout
export const fetchSuppliers = async () => {
    return await fetchWithAuth('/suppliers/');
};

export const placeBulkCheckout = async (storeOwnerId, items) => {
    return await fetchWithAuth('/bulk-checkout/', {
        method: 'POST',
        body: JSON.stringify({ store_owner_id: storeOwnerId, items: items })
    });
};

// Admin Book Actions
export const createBook = async (data) => fetchWithAuth('/books/', { method: 'POST', body: JSON.stringify(data) });
export const updateBook = async (id, data) => fetchWithAuth(`/books/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBook = async (id) => fetchWithAuth(`/books/${id}/`, { method: 'DELETE' });

// Admin User Actions
export const fetchUsers = async () => fetchWithAuth('/users/');
export const deleteUser = async (id) => fetchWithAuth(`/users/${id}/`, { method: 'DELETE' });

// Admin Review Actions
export const deleteReview = async (id) => fetchWithAuth(`/reviews/${id}/`, { method: 'DELETE' });

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
