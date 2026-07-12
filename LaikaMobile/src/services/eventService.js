import { apiClient } from './apiClient';

export const eventAPI = {
  getPublic: (params = {}) => {
    return apiClient.get('/events/public', params);
  },

  getAll: (params = {}) => {
    return apiClient.get('/events/all', params);
  },

  getById: (eventId) => {
    return apiClient.get(`/events/${eventId}`);
  },

  create: (eventData) => {
    return apiClient.post('/events', eventData);
  },

  update: (eventId, updates) => {
    return apiClient.put(`/events/${eventId}`, updates);
  },

  delete: (eventId) => {
    return apiClient.delete(`/events/${eventId}`);
  },

  publish: (eventId) => {
    return apiClient.patch(`/events/${eventId}/publish`);
  },

  unpublish: (eventId) => {
    return apiClient.patch(`/events/${eventId}/unpublish`);
  },

  getMyEvents: () => {
    return apiClient.get('/events/my-events');
  },

  uploadImage: (eventId, fileUri) => {
    return apiClient.upload(`/events/${eventId}/image`, fileUri, `event_${eventId}.jpg`);
  },

  search: (query) => {
    return apiClient.get('/events/search', { q: query });
  }
};

export default eventAPI;
