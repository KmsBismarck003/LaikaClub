import { ApiClient } from './apiClient';

const ANALYTICS_BASE_URL =
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8007/api/analytics'
        : `http://${window.location.hostname}:8007/api/analytics`);

export const analyticsClient = new ApiClient(ANALYTICS_BASE_URL);
export default analyticsClient;
