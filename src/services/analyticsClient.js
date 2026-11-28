import ApiClient, { API_BASE_URL } from './apiClient';

const ANALYTICS_BASE_URL = `${API_BASE_URL}/analytics`;

export const analyticsClient = new ApiClient(ANALYTICS_BASE_URL);
export default analyticsClient;
