import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Skip auth endpoints - let components handle their own errors
    const isAuthEndpoint = originalRequest.url?.includes('/auth/')

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = useAuthStore.getState().getRefreshToken()

        // No refresh token available - logout immediately
        if (!refreshToken) {
          useAuthStore.getState().logout()
          window.location.href = '/dang-nhap'
          return Promise.reject(error)
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            'X-Refresh-Token': refreshToken,
          },
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        const { user } = useAuthStore.getState()
        useAuthStore.getState().setAuth(user, accessToken, newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        window.location.href = '/dang-nhap'
        return Promise.reject(refreshError)
      }
    }

    // Handle errors - skip toast for auth endpoints
    if (!isAuthEndpoint) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetToken: (token) => api.get('/auth/verify-reset-token', { params: { token } }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  mergeCart: (sessionId) => api.post('/auth/merge-cart', null, { params: { sessionId } }),
}

// Product API
export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getBestSellers: () => api.get('/products/best-sellers'),
  getRelated: (id) => api.get(`/products/${id}/related`),
}

// Category API
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
}

// Brand API
export const brandApi = {
  getAll: (categoryId) => api.get('/brands', { params: categoryId ? { categoryId } : {} }),
  getBySlug: (slug) => api.get(`/brands/${slug}`),
}

// Cart API
export const cartApi = {
  get: () => api.get('/carts'),
  addItem: (data) => api.post('/carts/items', data),
  updateItem: (itemId, data) => api.put(`/carts/items/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/carts/items/${itemId}`),
  clear: () => api.delete('/carts'),
  merge: (guestCartId) => api.post('/carts/merge', { guestCartId }),
}

// Order API
export const orderApi = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getByOrderNumber: (orderNumber) => api.get(`/orders/${orderNumber}`),
  cancel: (orderNumber) => api.post(`/orders/${orderNumber}/cancel`),
}

// Payment API
export const paymentApi = {
  createPayment: (orderNumber) => api.get(`/payments/create/${orderNumber}`),
  checkStatus: (orderNumber) => api.get(`/payments/status/${orderNumber}`),
}

// Wishlist API
export const wishlistApi = {
  getAll: () => api.get('/wishlists'),
  getCount: () => api.get('/wishlists/count'),
  add: (data) => api.post('/wishlists', data),
  remove: (productId) => api.delete(`/wishlists/${productId}`),
  check: (productId) => api.get('/wishlists/check', { params: { productId } }),
}

// Review API
export const reviewApi = {
  getByProduct: (productId, page = 0, size = 10) =>
    api.get(`/products/${productId}/reviews`, { params: { page, size } }),
  getStats: (productId) => api.get(`/products/${productId}/reviews/stats`),
  create: (productId, data) => api.post(`/products/${productId}/reviews`, data),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
}

// Search API
export const searchApi = {
  search: (q, page = 0, size = 20) =>
    api.get('/products/search', { params: { q, page, size } }),
}

// Notification API
export const notificationApi = {
  getAll: (page = 0, size = 20) =>
    api.get('/notifications', { params: { page, size } }),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
}

// Admin API
export const adminApi = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRecentOrders: (limit = 10) => api.get('/admin/dashboard/recent-orders', { params: { limit } }),
  getTopProducts: (limit = 10) => api.get('/admin/dashboard/top-products', { params: { limit } }),

  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  toggleProductStatus: (id, active) => api.patch(`/admin/products/${id}/status?active=${active}`),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.patch(`/admin/users/${id}/status?status=${status}`),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role?role=${role}`),

  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (orderNumber) => api.get(`/admin/orders/${orderNumber}`),
  updateOrderStatus: (orderNumber, status, note) =>
    api.patch(`/admin/orders/${orderNumber}/status?status=${status}`, { note }),
}

export default api
