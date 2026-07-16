import apiClient, { loadApiBaseUrl, saveApiBaseUrl, API_BASE_URL, getApiBaseUrl } from './apiClient';
import authAPI from './authService';
import eventAPI from './eventService';
import ticketService, { ticketAPI, paymentAPI, refundAPI } from './ticketService';
import contentService, { pagesAPI, adsAPI, notificationAPI } from './contentService';
import transferAPI from './transferService';
import achievementsAPI from './achievementsService';

export {
  apiClient,
  loadApiBaseUrl,
  saveApiBaseUrl,
  API_BASE_URL,
  getApiBaseUrl,
  authAPI,
  eventAPI,
  ticketService,
  ticketAPI,
  paymentAPI,
  refundAPI,
  contentService,
  pagesAPI,
  adsAPI,
  notificationAPI,
  transferAPI,
  achievementsAPI,
};

export default {
  apiClient,
  authAPI,
  eventAPI,
  ticketAPI,
  paymentAPI,
  refundAPI,
  pagesAPI,
  adsAPI,
  notificationAPI,
  transferAPI,
  achievementsAPI,
};
