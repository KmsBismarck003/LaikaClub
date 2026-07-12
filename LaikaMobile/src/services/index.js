import apiClient, { loadApiBaseUrl, saveApiBaseUrl, API_BASE_URL, getApiBaseUrl } from './apiClient';
import authAPI from './authService';
import eventAPI from './eventService';
import adminService, { databaseAPI, monitoringAPI, logsAPI, adminUsersAPI, configAPI } from './adminService';
import ticketService, { ticketAPI, paymentAPI, refundAPI } from './ticketService';
import contentService, { pagesAPI, adsAPI, notificationAPI } from './contentService';
import managerService, { managerAPI, venueAPI } from './managerService';
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
  adminService,
  databaseAPI,
  monitoringAPI,
  logsAPI,
  adminUsersAPI,
  configAPI,
  ticketService,
  ticketAPI,
  paymentAPI,
  refundAPI,
  contentService,
  pagesAPI,
  adsAPI,
  notificationAPI,
  managerService,
  managerAPI,
  venueAPI,
  transferAPI,
  achievementsAPI,
};

export default {
  apiClient,
  authAPI,
  eventAPI,
  databaseAPI,
  monitoringAPI,
  logsAPI,
  adminUsersAPI,
  configAPI,
  ticketAPI,
  paymentAPI,
  refundAPI,
  pagesAPI,
  adsAPI,
  notificationAPI,
  managerAPI,
  venueAPI,
  transferAPI,
  achievementsAPI,
};
