import api from './apiClient';

const MERCH_URL = '/merchandise';

export const merchService = {
  // --- Merchandise CRUD ---
  getAllMerchandise: async (managerId = null, status = null) => {
    try {
      const params = new URLSearchParams();
      if (managerId) params.append('manager_id', managerId);
      if (status) params.append('status', status);
      
      const queryString = params.toString();
      const url = queryString ? `${MERCH_URL}?${queryString}` : MERCH_URL;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      throw error;
    }
  },

  getMerchandiseById: async (id) => {
    try {
      const response = await api.get(`${MERCH_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching merchandise detail:', error);
      throw error;
    }
  },

  createMerchandise: async (merchData) => {
    try {
      const response = await api.post(MERCH_URL, merchData);
      return response.data;
    } catch (error) {
      console.error('Error creating merchandise:', error);
      throw error;
    }
  },

  updateMerchandise: async (id, merchData) => {
    try {
      const response = await api.put(`${MERCH_URL}/${id}`, merchData);
      return response.data;
    } catch (error) {
      console.error('Error updating merchandise:', error);
      throw error;
    }
  },

  // --- Manager Settings ---
  getSettings: async (managerId) => {
    try {
      const response = await api.get(`${MERCH_URL}/settings/${managerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching merch settings:', error);
      throw error;
    }
  },

  updateSettings: async (managerId, settingsData) => {
    try {
      const response = await api.put(`${MERCH_URL}/settings/${managerId}`, settingsData);
      return response.data;
    } catch (error) {
      console.error('Error updating merch settings:', error);
      throw error;
    }
  },

  // --- Orders ---
  createOrder: async (orderData) => {
    try {
      const response = await api.post(`${MERCH_URL}/orders/`, orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating merch order:', error);
      throw error;
    }
  }
};

export default merchService;
