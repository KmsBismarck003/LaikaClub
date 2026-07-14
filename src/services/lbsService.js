/**
 * LbsService - Sends Geofence Triggers to Backend
 */
import { apiClient } from './apiClient'

export const lbsAPI = {
    /**
     * Send geofence trigger to backend
     * @param {Object} triggerData - { venueId, currentLatitude, currentLongitude, triggerType }
     * @returns {Promise<{success: boolean, suggestion: string}>}
     */
    triggerGeofence: async (triggerData) => {
        // We ensure we only call this when user is logged in because it's targeted.
        // apiClient will attach Authorization header implicitly if token exists.
        return apiClient.post('/lbs/geofence/trigger', triggerData)
    }
}

export default lbsAPI
