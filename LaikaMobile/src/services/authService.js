import { apiClient } from './apiClient';

export const authAPI = {
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  logout: () => {
    return apiClient.post('/auth/logout');
  },

  verifyToken: () => {
    return apiClient.get('/auth/verify');
  },

  refreshToken: () => {
    return apiClient.post('/auth/refresh');
  },

  forgotPassword: (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: (token, newPassword) => {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  uploadAvatar: (fileUri) => {
    return apiClient.upload('/auth/users/me/avatar', fileUri, 'avatar.jpg');
  },

  getAuditLogs: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString();
    return apiClient.get(`/auth/audit${qs ? `?${qs}` : ''}`);
  }
};

export default authAPI;
