import { apiClient as api } from './apiClient';

const MERCH_URL = '/merchandise';

export const merchService = {
  // --- Merchandise CRUD ---
  getAllMerchandise: async (managerId = null, status = null, eventId = null, adminStatus = null) => {
    try {
      const params = new URLSearchParams();
      if (managerId) params.append('manager_id', managerId);
      if (status) params.append('status', status);
      if (eventId) params.append('event_id', eventId);
      if (adminStatus) params.append('admin_status', adminStatus);
      
      const queryString = params.toString();
      const url = queryString ? `${MERCH_URL}?${queryString}` : MERCH_URL;
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      throw error;
    }
  },

  getMerchandiseById: async (id) => {
    try {
      const response = await api.get(`${MERCH_URL}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching merchandise detail:', error);
      throw error;
    }
  },

  createMerchandise: async (merchData) => {
    try {
      const response = await api.post(MERCH_URL, merchData);
      return response;
    } catch (error) {
      console.error('Error creating merchandise:', error);
      throw error;
    }
  },

  updateMerchandise: async (id, merchData) => {
    try {
      const response = await api.put(`${MERCH_URL}/${id}`, merchData);
      return response;
    } catch (error) {
      console.error('Error updating merchandise:', error);
      throw error;
    }
  },

  deleteMerchandise: async (id) => {
    try {
      const response = await api.delete(`${MERCH_URL}/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting merchandise:', error);
      throw error;
    }
  },

  updateAdminStatus: async (id, adminStatus) => {
    try {
      const response = await api.put(`${MERCH_URL}/${id}/admin_status`, { admin_status: adminStatus });
      return response;
    } catch (error) {
      console.error('Error updating merchandise admin status:', error);
      throw error;
    }
  },

  // --- Manager Settings ---
  getSettings: async (managerId) => {
    try {
      const response = await api.get(`${MERCH_URL}/settings/${managerId}`);
      return response;
    } catch (error) {
      console.error('Error fetching merch settings:', error);
      throw error;
    }
  },

  updateSettings: async (managerId, settingsData) => {
    try {
      const response = await api.put(`${MERCH_URL}/settings/${managerId}`, settingsData);
      return response;
    } catch (error) {
      console.error('Error updating merch settings:', error);
      throw error;
    }
  },

  // --- Orders ---
  createOrder: async (orderData) => {
    try {
      const response = await api.post(`${MERCH_URL}/orders/`, orderData);
      return response;
    } catch (error) {
      console.error('Error creating merch order:', error);
      throw error;
    }
  },

  // --- Reviews ---
  createReview: async (reviewData) => {
    try {
      const response = await api.post(`${MERCH_URL}/reviews/`, reviewData);
      return response;
    } catch (error) {
      console.error('Error creating product review:', error);
      throw error;
    }
  },

  checkPurchased: async (itemId) => {
    try {
      const response = await api.get(`${MERCH_URL}/${itemId}/purchased`);
      return response;
    } catch (error) {
      console.error('Error checking product purchase status:', error);
      throw error;
    }
  }
};

export default merchService;
