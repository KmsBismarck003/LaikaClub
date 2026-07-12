import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Helper to auto-detect computer's IP address from Expo bundler URL
const getAutoDetectedHost = () => {
  try {
    // 1. Try Expo Constants hostUri (e.g. "192.168.1.15:8081" or similar)
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return host;
      }
    }
  } catch (e) {
    console.log('[LaikaMobile] Constants hostUri detection failed, trying NativeModules...');
  }

  try {
    // 2. Try NativeModules SourceCode scriptURL
    const { SourceCode } = NativeModules;
    const scriptURL = SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^:/]+)(:\d+)?/);
      if (match && match[1]) {
        // Return host IP/domain if valid (e.g. 192.168.1.15)
        return match[1];
      }
    }
  } catch (error) {
    console.warn('[LaikaMobile] Error auto-detecting server IP:', error);
  }
  return null;
};

// Function to construct the default API URL
export const getDefaultApiUrl = () => {
  const autoHost = getAutoDetectedHost();
  if (autoHost && autoHost !== 'localhost' && autoHost !== '127.0.0.1') {
    const autoUrl = `http://${autoHost}:8000/api`;
    console.log(`[LaikaMobile] Auto-detected backend URL: ${autoUrl}`);
    return autoUrl;
  }
  const defaultUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';
  console.log(`[LaikaMobile] Fallback backend URL: ${defaultUrl}`);
  return defaultUrl;
};

// Default API URL
export let API_BASE_URL = getDefaultApiUrl();

// Getter function for API_BASE_URL to avoid binding issues in some environments
export const getApiBaseUrl = () => API_BASE_URL;

// Function to load the saved API URL from storage
export const loadApiBaseUrl = async () => {
  try {
    const savedUrl = await AsyncStorage.getItem('custom_api_url');
    if (savedUrl) {
      API_BASE_URL = savedUrl;
    } else {
      API_BASE_URL = getDefaultApiUrl();
    }
  } catch (error) {
    console.error('[LaikaMobile] Error loading custom API URL:', error);
  }
  return API_BASE_URL;
};

// Function to set and save a custom API URL
export const saveApiBaseUrl = async (url) => {
  try {
    await AsyncStorage.setItem('custom_api_url', url);
    API_BASE_URL = url;
    return true;
  } catch (error) {
    console.error('[LaikaMobile] Error saving custom API URL:', error);
    return false;
  }
};

// Function to reset the API URL to default automatic detection
export const resetApiBaseUrl = async () => {
  try {
    await AsyncStorage.removeItem('custom_api_url');
    API_BASE_URL = getDefaultApiUrl();
    return API_BASE_URL;
  } catch (error) {
    console.error('[LaikaMobile] Error resetting API URL:', error);
    return null;
  }
};

class ApiClient {
  async getHeaders() {
    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle unauthorized
      if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
      
      let errorMessage = 'Error en la petición';
      if (data) {
        if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail
            .map((err) => {
              const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : '';
              return field ? `${field}: ${err.msg}` : err.msg;
            })
            .join(', ');
        } else if (data.detail && typeof data.detail === 'object') {
          errorMessage = data.detail.message || JSON.stringify(data.detail);
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }

      throw {
        status: response.status,
        message: errorMessage,
        data,
      };
    }
    return data;
  }

  async get(endpoint, params = {}) {
    await loadApiBaseUrl(); // Sync the latest base URL before call
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    const headers = await this.getHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async post(endpoint, data = {}) {
    await loadApiBaseUrl();
    const headers = await this.getHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async put(endpoint, data = {}) {
    await loadApiBaseUrl();
    const headers = await this.getHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async patch(endpoint, data = {}) {
    await loadApiBaseUrl();
    const headers = await this.getHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint) {
    await loadApiBaseUrl();
    const headers = await this.getHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse(response);
  }

  // Upload method for multipart forms (e.g. photos/banners)
  async upload(endpoint, fileUri, fileName = 'file.jpg') {
    await loadApiBaseUrl();
    const token = await AsyncStorage.getItem('token');
    
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'image/jpeg',
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
