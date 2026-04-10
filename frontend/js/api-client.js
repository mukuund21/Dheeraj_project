const API_BASE = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const headers = {};
  const token = getToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };

  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== null) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const json = await response.json();

  if (!json.success) {
    const msg = json.message || 'An unexpected error occurred';
    const err = new Error(msg);
    err.details = json.details || null;
    throw err;
  }

  return json.data;
};

const loginUser = (email, password) =>
  apiCall('/auth/login', 'POST', { email, password });

const registerUser = (email, password) =>
  apiCall('/auth/register', 'POST', { email, password });

const uploadDXF = (formData) =>
  apiCall('/upload', 'POST', formData);

const getQuote = (fileId, material, thickness, quantity, bends, bendAngle, finish) =>
  apiCall('/quote', 'POST', { fileId, material, thickness, quantity, bends, bendAngle, finish });

const placeOrder = (fileId, quoteData, inputs) =>
  apiCall('/order', 'POST', { fileId, quoteData, inputs });

const getOrder = (id) =>
  apiCall(`/order/${id}`, 'GET');

const getMyOrders = () =>
  apiCall('/order/my', 'GET');

const getAllOrders = (status = '') => {
  const params = status ? `?status=${encodeURIComponent(status)}&limit=500` : '?limit=500';
  return apiCall(`/admin/orders${params}`, 'GET');
};

const updateOrderStatus = (id, status) =>
  apiCall(`/admin/orders/${id}/status`, 'PATCH', { status });

const getPricingConfig = () =>
  apiCall('/admin/config', 'GET');

const updatePricingConfig = (key, value) =>
  apiCall('/admin/config', 'PUT', { key, value });
