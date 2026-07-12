import { apiClient } from './apiClient';

export const pagesAPI = {
  getBySlug: (slug) => apiClient.get(`/pages/${slug}`),
  getAll: (section = null) => apiClient.get('/pages', { section }),
};

export const adsAPI = {
  getPublic: () => apiClient.get('/ads/public'),
  getAll: () => apiClient.get('/ads/admin'),
  create: (adData) => apiClient.post('/ads', adData),
  update: (id, updates) => apiClient.put(`/ads/${id}`, updates),
  delete: (id) => apiClient.delete(`/ads/${id}`),
  upload: (fileUri) => apiClient.upload('/ads/upload', fileUri, 'ad.jpg'),
  registerClick: (id, userId = null) => apiClient.post(`/ads/${id}/click`, { user_id: userId }),
  getClicks: (id) => apiClient.get(`/ads/${id}/clicks`),
};

export const notificationAPI = {
  getMyNotifications: () => apiClient.get('/notifications/me'),
  markAsRead: (notificationId) => apiClient.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/mark-all-read'),
  delete: (notificationId) => apiClient.delete(`/notifications/${notificationId}`),
};

export default {
  pagesAPI,
  adsAPI,
  notificationAPI,
};
