import { apiClient } from '../../services/apiClient'

export const matisExecutiveAPI = {
    getKpis: () => apiClient.get('/analytics/matis/executive/kpis'),
    getCategoryPerformance: () => apiClient.get('/analytics/matis/executive/category-performance'),
    getSalesTrend: () => apiClient.get('/analytics/matis/executive/sales-trend')
}

export const matisSalesAPI = {
    getSummary: () => apiClient.get('/analytics/matis/sales/summary'),
    getPaymentMethods: () => apiClient.get('/analytics/matis/sales/payment-methods'),
    getPriceRanges: () => apiClient.get('/analytics/matis/sales/price-ranges')
}

export const matisEventsAPI = {
    getOccupancy: () => apiClient.get('/analytics/matis/events/occupancy'),
    getTopRevenue: () => apiClient.get('/analytics/matis/events/top-revenue'),
    getTicketStatus: () => apiClient.get('/analytics/matis/events/ticket-status')
}

export const matisVenuesAPI = {
    getProspects: () => apiClient.get('/analytics/matis/venues/prospects')
}

export const matisCustomersAPI = {
    getSegments: () => apiClient.get('/analytics/matis/customers/segments'),
    getChurn: () => apiClient.get('/analytics/matis/customers/churn')
}

export const matisProductsAPI = {
    getSales: () => apiClient.get('/analytics/matis/products/sales'),
    getStockAlerts: () => apiClient.get('/analytics/matis/products/stock-alerts')
}

export const matisGeographyAPI = {
    getSalesByState: () => apiClient.get('/analytics/matis/geography/sales-by-state')
}

export const matisOperationalAPI = {
    getSystemTelemetry: () => apiClient.get('/analytics/matis/operational/system')
}

export const matisPredictiveAPI = {
    getRegression: (params = {}) => apiClient.get('/analytics/matis/predictive/regression', params),
    getDecisionTree: () => apiClient.get('/analytics/matis/predictive/decision-tree'),
    getSoldOutForecast: () => apiClient.get('/analytics/matis/predictive/sold-out'),
    getAnomalies: () => apiClient.get('/analytics/matis/predictive/anomalies')
}

export const matisQualityAPI = {
    getIntegrityScore: () => apiClient.get('/analytics/matis/quality/integrity-score'),
    cleanTable: (table) => apiClient.post(`/analytics/matis/quality/clean?table=${table}`)
}
