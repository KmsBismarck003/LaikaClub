import { apiClient } from './apiClient';

export const databaseAPI = {
  createBackup: (type, options = {}) => apiClient.post('/database/backup', { type, ...options }),
  listBackups: () => apiClient.get('/database/backups'),
  restore: (backupId) => apiClient.post('/database/restore', { backup_id: backupId }),
  deleteBackup: (backupId) => apiClient.delete(`/database/backups/${backupId}`),
  listTables: () => apiClient.get('/database/tables'),
  getStats: () => apiClient.get('/database/stats'),
  clearCache: () => apiClient.post('/database/clear-cache'),
  optimize: () => apiClient.post('/database/optimize'),
};

export const monitoringAPI = {
  getSystemStatus: () => apiClient.get('/monitoring/status'),
  getLogs: (params = {}) => apiClient.get('/monitoring/logs', params),
  getMetrics: () => apiClient.get('/monitoring/metrics'),
  getActiveUsers: () => apiClient.get('/monitoring/active-users'),
};

export const logsAPI = {
  getAuditLogs: (params = {}) => apiClient.get('/logs/audit', params),
  getRequestLogs: (params = {}) => apiClient.get('/logs/requests', params),
};

export const adminUsersAPI = {
  getAll: (params = {}) => apiClient.get('/admin/users', params),
  create: (userData) => apiClient.post('/admin/users', userData),
  getById: (userId) => apiClient.get(`/admin/users/${userId}`),
  resetPassword: (userId, newPassword) =>
    apiClient.patch(`/admin/users/${userId}/password`, { new_password: newPassword }),
  changeStatus: (userId, status) =>
    apiClient.patch(`/admin/users/${userId}/status`, { status }),
  unlock: (userId) => apiClient.patch(`/admin/users/${userId}/unlock`),
  uploadPhoto: (userId, fileUri) => apiClient.upload(`/admin/users/${userId}/avatar`, fileUri, `user_${userId}.jpg`),
};

export const configAPI = {
  getConfig: () => apiClient.get('/config'),
  updateConfig: (config) => apiClient.put('/config', config),
  getParameter: (key) => apiClient.get(`/config/${key}`),
  updateParameter: (key, value) => apiClient.post(`/config/${key}`, { value }),
};

export default {
  databaseAPI,
  monitoringAPI,
  logsAPI,
  adminUsersAPI,
  configAPI,
};
