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
    hasPremiumTicket: () => apiClient.get('/achievements/has-premium-ticket'),
    runIncentives: (testMode = false) => apiClient.post(`/achievements/run-incentives?test_mode=${testMode}`)
}

const ANALYTICS_URL = 'http://127.0.0.1:8000/api/analytics';
const BIGDATA_URL = 'http://127.0.0.1:8009/api/analytics';

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
    getMapReduceStats3D: async (table, filters = {}) => {
        const params = typeof filters === 'string' ? { table, focus_filter: filters } : { table, ...filters };
        const response = await axios.get(`${ANALYTICS_URL}/3d`, { params });
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
    getDescriptiveStats: async (table, managerId = null, eventId = null) => {
        const params = { table };
        if (managerId) params.manager_id = managerId;
        if (eventId) params.event_id = eventId;
        const response = await axios.get(`${ANALYTICS_URL}/stats/descriptive`, { params });
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
    getRegressionML: async (managerId = null, extraParams = {}) => {
        const params = { ...extraParams };
        if (managerId) params.manager_id = managerId;
        const response = await axios.get(`${ANALYTICS_URL}/ml/regression`, { params });
        return response.data;
    },
    getDecisionTreeML: async (managerId = null, extraParams = {}) => {
        const params = { ...extraParams };
        if (managerId) params.manager_id = managerId;
        const response = await axios.get(`${ANALYTICS_URL}/ml/decision-tree`, { params });
        return response.data;
    },
    getProspectingML: async () => {
        const response = await axios.get(`${ANALYTICS_URL}/ml/prospecting`);
        return response.data;
    },
    addProspectingLead: async (leadData) => {
        const response = await axios.post(`${ANALYTICS_URL}/ml/prospecting/lead`, leadData);
        return response.data;
    },
    getUserBehaviorML: async (managerId = null) => {
        const params = {};
        if (managerId) params.manager_id = managerId;
        const response = await axios.get(`${ANALYTICS_URL}/ml/user-behavior`, { params });
        return response.data;
    },
    getDemandPredictionML: async (managerId = null) => {
        const params = {};
        if (managerId) params.manager_id = managerId;
        const response = await axios.get(`${ANALYTICS_URL}/ml/demand-prediction`, { params });
        return response.data;
    },
    getMerchSalesInsights: async (dateFrom = null, dateTo = null) => {
        const params = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        const response = await axios.get(`${ANALYTICS_URL}/merch/sales-insights`, { params });
        return response.data;
    },
    grantRetentionCoupon: async (userId, discountValue = 15.0) => {
        const response = await axios.post(`${ANALYTICS_URL}/ml/user-behavior/grant-coupon`, {
            user_id: userId,
            discount_value: discountValue
        });
        return response.data;
    },
    getPCAML: async (k = 3) => {
        const response = await axios.get(`${BIGDATA_URL}/ml/pca`, { params: { k } });
        return response.data;
    },
    getElbowML: async (max_k = 8) => {
        const response = await axios.get(`${BIGDATA_URL}/ml/elbow`, { params: { max_k } });
        return response.data;
    },
    getAnomalyML: async (managerId = null) => {
        const params = {};
        if (managerId) params.manager_id = managerId;
        const response = await axios.get(`${BIGDATA_URL}/ml/anomaly`, { params });
        return response.data;
    }
}
