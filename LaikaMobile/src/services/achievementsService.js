import { apiClient } from './apiClient';

export const achievementsAPI = {
  getAll: () => apiClient.get('/achievements'),
  getMy: () => apiClient.get('/achievements/my'),
  getCoupons: () => apiClient.get('/achievements/coupons'),
  check: () => apiClient.post('/achievements/check'),
  validateCoupon: (couponCode, subtotal, feePercent = 10) =>
    apiClient.post('/achievements/coupons/validate', {
      coupon_code: couponCode,
      subtotal,
      service_fee_percent: feePercent,
    }),
  consumeCoupon: (couponCode, subtotal, feePercent = 10) =>
    apiClient.post('/achievements/coupons/consume', {
      coupon_code: couponCode,
      subtotal,
      service_fee_percent: feePercent,
    }),
  hasPremiumTicket: () => apiClient.get('/achievements/has-premium-ticket'),
  runIncentives: (testMode = false) => apiClient.post(`/achievements/run-incentives?test_mode=${testMode}`),
};

export default achievementsAPI;
