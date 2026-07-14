/**
 * GeolocationService - Wrapper for native browser geolocation
 */

class GeolocationService {
    constructor() {
        this.watchId = null;
    }

    /**
     * Request permissions and start tracking location
     * @param {Function} onLocationUpdate - callback(coords)
     * @param {Function} onError - callback(error)
     */
    startTracking(onLocationUpdate, onError) {
        if (!('geolocation' in navigator)) {
            if (onError) onError(new Error("La geolocalización no está soportada por tu navegador."));
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                onLocationUpdate({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                if (onError) onError(error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 5000,
            }
        );
    }

    /**
     * Stop tracking location
     */
    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    /**
     * Calculate distance between two coordinates in meters (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const rad = Math.PI / 180;
        const phi1 = lat1 * rad;
        const phi2 = lat2 * rad;
        const deltaPhi = (lat2 - lat1) * rad;
        const deltaLambda = (lon2 - lon1) * rad;

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in meters
    }
}

export const geolocationService = new GeolocationService();
export default geolocationService;
