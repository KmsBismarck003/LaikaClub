/**
 * StatsService & Achievements - Manejo de datos y logros
 */
import { apiClient } from './apiClient'
import axios from 'axios'

export const statsAPI = {
    getAdminDashboard: () => apiClient.get('/stats/admin/dashboard'),
    getManagerStats: () => apiClient.get('/stats/manager/dashboard'),
    getStaffStats: () => apiClient.get('/stats/staff/dashboard'),
    getEventStats: eventId => apiClient.get(`/stats/events/${eventId}`),
    getSalesReport: (params = {}) => apiClient.get('/stats/sales/report', params),
    getSalesByEvent: () => apiClient.get('/stats/admin/sales')
}

export const achievementsAPI = {
    getAll: () => apiClient.get('/achievements'),
    getMy: () => apiClient.get('/achievements/my'),
    getCoupons: () => apiClient.get('/achievements/coupons'),
    check: () => apiClient.post('/achievements/check'),
    validateCoupon: (couponCode, subtotal, feePercent = 10) =>
        apiClient.post('/achievements/coupons/validate', {
            coupon_code: couponCode,
            subtotal,
            service_fee_percent: feePercent
        }),
    consumeCoupon: (couponCode, subtotal, feePercent = 10) =>
        apiClient.post('/achievements/coupons/consume', {
            coupon_code: couponCode,
            subtotal,
            service_fee_percent: feePercent
        }),
    hasPremiumTicket: () => apiClient.get('/achievements/has-premium-ticket')
}

const ANALYTICS_URL = 'http://127.0.0.1:8007/api/analytics';

export const analyticsAPI = {
    getAnalyticsTables: async () => {
        const response = await fetch(`${ANALYTICS_URL}/tables`);
        return response.json();
    },
    getArtistSuggestions: async () => {
        const response = await fetch(`${ANALYTICS_URL}/suggestions`);
        return response.json();
    },
    getMapReduceStats: async (table = 'tickets', filter = '') => {
        const response = await fetch(`${ANALYTICS_URL}/mapreduce?table=${table}&focus_filter=${filter}`);
        return response.json();
    },
    getFullAnalysis: async () => {
        const response = await fetch(`${ANALYTICS_URL}/full`);
        return response.json();
    },
    getIncrementalAnalysis: async (lastDate) => {
        const response = await fetch(`${ANALYTICS_URL}/incremental?last_date=${lastDate}`);
        return response.json();
    },
    getMapReduceStats3D: async (table, filter = {}) => {
        const response = await axios.get(`${ANALYTICS_URL}/3d`, { 
            params: { table, ...filter } 
        });
        return response.data;
    },
    runPredictAction: async () => {
        const response = await axios.post(`${ANALYTICS_URL}/predict`);
        return response.data;
    },
    runAnomaliesAction: async () => {
        const response = await axios.post(`${ANALYTICS_URL}/anomalies`);
        return response.data;
    },
    runCleanAction: async (table) => {
        const response = await axios.post(`${ANALYTICS_URL}/clean`, null, { params: { table } });
        return response.data;
    },
    syncNoSqlVault: async (params = {}) => {
        const response = await axios.post(`${ANALYTICS_URL}/vault/sync`, params);
        return response.data;
    },
    downloadNoSqlSnapshotUrl: (snapshotId) => {
        return `${ANALYTICS_URL}/vault/download/${snapshotId}`;
    },
    getNoSqlVaultStatus: async () => {
        const response = await axios.get(`${ANALYTICS_URL}/vault/status`);
        return response.data;
    },
    listNoSqlVault: async () => {
        const response = await axios.get(`${ANALYTICS_URL}/vault/list`);
        return response.data;
    },
    deleteNoSqlSnapshot: async (snapshotId) => {
        const response = await axios.delete(`${ANALYTICS_URL}/vault/delete/${snapshotId}`);
        return response.data;
    },
    restoreNoSqlSnapshot: async (snapshotId) => {
        const response = await axios.post(`${ANALYTICS_URL}/vault/restore/${snapshotId}`);
        return response.data;
    },
    getRegressionML: async (algorithm = null) => {
        const response = await axios.get(`${ANALYTICS_URL}/ml/regression`, { params: { algorithm } });
        return response.data;
    },
    getDecisionTreeML: async (max_depth = 5) => {
        const response = await axios.get(`${ANALYTICS_URL}/ml/decision-tree`, { params: { max_depth } });
        return response.data;
    },
    getPCAML: async (k = 3) => {
        const response = await axios.get(`${ANALYTICS_URL}/ml/pca`, { params: { k } });
        return response.data;
    },
    getNeuralNetworkML: async (epochs = 50) => {
        const response = await axios.get(`${ANALYTICS_URL}/ml/neural-network`, { params: { epochs } });
        return response.data;
    },
    scrapeFootballData: async (league = "SP1") => {
        const response = await axios.get(`${ANALYTICS_URL}/scrape/football`, { params: { league } });
        return response.data;
    },
    scrapeCustomURL: async (url) => {
        const response = await axios.get(`${ANALYTICS_URL}/scrape/custom`, { params: { url } });
        return response.data;
    }
}
