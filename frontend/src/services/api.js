import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('cfm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || 'Something went wrong';
    if (err.response?.status === 401) {
      localStorage.removeItem('cfm_token');
      localStorage.removeItem('cfm_user');
      window.location.href = '/login';
    } else if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
      // Backend not running — silently fail, components handle empty state
      console.warn('API unreachable — running in offline mode');
    } else if (err.response?.status !== 404) {
      toast.error(msg);
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const sendOtp       = (data) => api.post('/auth/send-otp', data);
export const verifyOtp     = (data) => api.post('/auth/verify-otp', data);
export const register      = (data) => api.post('/auth/register', data);
export const loginApi      = (data) => api.post('/auth/login', data);
export const getMe         = ()     => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);

// ── Products ──────────────────────────────────────────────────────────────
export const getProducts     = (params) => api.get('/products', { params });
export const getProduct      = (slug)   => api.get(`/products/${slug}`);
export const searchProducts  = (q)      => api.get('/products/search', { params: { q } });
export const addReview       = (id, data) => api.post(`/products/${id}/reviews`, data);
export const createProduct   = (data)   => api.post('/products', data);
export const updateProduct   = (id, d)  => api.put(`/products/${id}`, d);
export const deleteProduct   = (id)     => api.delete(`/products/${id}`);

// ── Categories ────────────────────────────────────────────────────────────
export const getCategories  = ()      => api.get('/categories');
export const getCategory    = (slug)  => api.get(`/categories/${slug}`);
export const createCategory = (data)  => api.post('/categories', data);
export const updateCategory = (id, d) => api.put(`/categories/${id}`, d);

// ── Cart ──────────────────────────────────────────────────────────────────
export const getCart           = ()       => api.get('/cart');
export const addToCart         = (data)   => api.post('/cart', data);
export const updateCart        = (id, d)  => api.put(`/cart/${id}`, d);
export const removeFromCart    = (id)     => api.delete(`/cart/${id}`);
export const clearCart         = ()       => api.delete('/cart');
export const validateCoupon    = (data)   => api.post('/cart/validate-coupon', data);

// ── Wishlist ──────────────────────────────────────────────────────────────
export const getWishlist       = ()           => api.get('/wishlist');
export const addToWishlist     = (product_id) => api.post('/wishlist', { product_id });
export const removeFromWishlist = (id)        => api.delete(`/wishlist/${id}`);

// ── Orders ────────────────────────────────────────────────────────────────
export const createOrder    = (data)  => api.post('/orders', data);
export const getOrders      = ()      => api.get('/orders');
export const getOrder       = (id)    => api.get(`/orders/${id}`);

// ── Payment ───────────────────────────────────────────────────────────────
export const createRazorpayOrder = (data) => api.post('/payment/create-order', data);
export const verifyPayment       = (data) => api.post('/payment/verify', data);

// ── Banners ───────────────────────────────────────────────────────────────
export const getBanners  = (position) => api.get('/banners', { params: position ? { position } : {} });

// ── Offers ────────────────────────────────────────────────────────────────
export const getOffers   = ()   => api.get('/offers');

// ── Blogs ─────────────────────────────────────────────────────────────────
export const getBlogs    = ()     => api.get('/blogs');
export const getBlog     = (slug) => api.get(`/blogs/${slug}`);

// ── Misc ──────────────────────────────────────────────────────────────────
export const uploadPhoto   = (data) => api.post('/misc/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const submitContact = (data) => api.post('/misc/contact', data);
export const subscribe     = (data) => api.post('/misc/subscribe', data);
export const aiRecommend   = (data) => api.post('/ai/recommend', data);

// ── Admin ─────────────────────────────────────────────────────────────────
export const getDashboard     = ()       => api.get('/admin/dashboard');
export const getAdminOrders   = (params) => api.get('/admin/orders', { params });
export const updateOrderStatus= (id, d)  => api.put(`/admin/orders/${id}`, d);
export const getAdminUsers    = (params) => api.get('/admin/users', { params });
export const updateUser       = (id, d)  => api.put(`/admin/users/${id}`, d);
export const getAdminBanners  = ()       => api.get('/admin/banners');
export const createBanner     = (data)   => api.post('/admin/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateBanner     = (id, d)  => api.put(`/admin/banners/${id}`, d);
export const deleteBanner     = (id)     => api.delete(`/admin/banners/${id}`);
export const getAdminCoupons  = ()       => api.get('/admin/coupons');
export const createCoupon     = (data)   => api.post('/admin/coupons', data);
export const deleteCoupon     = (id)     => api.delete(`/admin/coupons/${id}`);
export const getAdminReviews  = ()       => api.get('/admin/reviews');
export const approveReview    = (id)     => api.put(`/admin/reviews/${id}/approve`);
export const deleteReview     = (id)     => api.delete(`/admin/reviews/${id}`);
export const getSalesAnalytics= (p)      => api.get('/analytics/sales', { params: { period: p } });
export const getTopProducts   = ()       => api.get('/analytics/top-products');
export const getInventory     = ()       => api.get('/analytics/inventory');
export const getAdminOffers   = ()       => api.get('/admin/offers');
export const createOffer      = (data)   => api.post('/admin/offers', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getSubscribers   = ()       => api.get('/admin/subscribers');
export const getMessages      = ()       => api.get('/admin/messages');
export const markMessageRead  = (id)     => api.put(`/admin/messages/${id}/read`);

export default api;
