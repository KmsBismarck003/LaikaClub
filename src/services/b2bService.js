import axios from 'axios';

const ADMIN_URL = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:8005/api/admin';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const b2bClient = axios.create({
    baseURL: ADMIN_URL
});

b2bClient.interceptors.request.use((config) => {
    const headers = getAuthHeaders();
    if (headers.Authorization) {
        config.headers.Authorization = headers.Authorization;
    }
    return config;
});

const b2bAPI = {
    // Organizations
    getOrganizations: async () => {
        const response = await b2bClient.get(`/b2b/organizations`);
        return response.data;
    },
    createOrganization: async (data) => {
        const response = await b2bClient.post(`/b2b/organizations`, data);
        return response.data;
    },

    // Contracts
    getContracts: async () => {
        const response = await b2bClient.get(`/b2b/contracts`);
        return response.data;
    },
    getContractsByOrg: async (orgId) => {
        const response = await b2bClient.get(`/b2b/organizations/${orgId}/contracts`);
        return response.data;
    },
    createContract: async (data) => {
        const response = await b2bClient.post(`/b2b/contracts`, data);
        return response.data;
    },
    extendContract: async (contractId, data) => {
        const response = await b2bClient.patch(`/b2b/contracts/${contractId}/extend`, data);
        return response.data;
    }
};

export { b2bAPI };
