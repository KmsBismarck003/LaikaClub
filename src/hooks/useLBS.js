import { useEffect, useRef, useState } from 'react';
import { geolocationService } from '../services/geolocationService';
import { venueAPI } from '../services/managerService';
import { lbsAPI } from '../services/lbsService';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext exists

/**
 * Custom hook to manage Location Based Services
 * Loads active venues, tracks position, and triggers alerts when approaching a venue.
 */
export const useLBS = () => {
    const [venues, setVenues] = useState([]);
    const [trackingError, setTrackingError] = useState(null);
    const triggeredVenues = useRef(new Set()); // Keeps track of venues already triggered locally
    const { user } = useAuth() || { user: null }; // Only trigger if logged in
    
    // 1. Fetch Venues on mount
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                // Fetch active venues
                const response = await venueAPI.getAll({ status_filter: 'active' });
                // Assuming response returns an array or response.data
                const venueList = Array.isArray(response) ? response : (response?.data || []);
                // Filter venues that have coordinates
                const lbsVenues = venueList.filter(v => v.latitude && v.longitude);
                setVenues(lbsVenues);
            } catch (error) {
                console.error("Error loading venues for LBS:", error);
            }
        };
        fetchVenues();
    }, []);

    // 2. Start tracking position when venues are loaded
    useEffect(() => {
        if (!user || venues.length === 0) return;

        const handleLocationUpdate = async (coords) => {
            for (const venue of venues) {
                const distance = geolocationService.calculateDistance(
                    coords.latitude, 
                    coords.longitude, 
                    venue.latitude, 
                    venue.longitude
                );

                const radius = venue.geofence_radius || 500; // Default 500m

                // If inside geofence and haven't triggered yet
                if (distance <= radius && !triggeredVenues.current.has(venue.id)) {
                    // Mark as triggered locally to avoid spamming the backend
                    triggeredVenues.current.add(venue.id);
                    
                    try {
                        const response = await lbsAPI.triggerGeofence({
                            venueId: venue.id,
                            currentLatitude: coords.latitude,
                            currentLongitude: coords.longitude,
                            triggerType: "ENTER"
                        });

                        // If backend responded with a suggestion, display it natively
                        if (response.success && response.suggestion && response.suggestion !== "none") {
                            showNativeNotification(response.suggestion);
                        }
                    } catch (error) {
                        console.error("Error triggering LBS for venue", venue.id, error);
                    }
                } else if (distance > radius && triggeredVenues.current.has(venue.id)) {
                    // If user exited the geofence, we remove it from the set so it can be triggered again next time
                    triggeredVenues.current.delete(venue.id);
                }
            }
        };

        const handleError = (error) => {
            console.warn("LBS Tracking warning:", error.message);
            setTrackingError(error.message);
        };

        // Request notification permission if not granted
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        geolocationService.startTracking(handleLocationUpdate, handleError);

        return () => {
            geolocationService.stopTracking();
        };
    }, [venues, user]);

    // Show HTML5 Notification
    const showNativeNotification = (message) => {
        if (!('Notification' in window)) return;
        
        if (Notification.permission === 'granted') {
            new Notification('¡LaikaClub Sugiere!', {
                body: message,
                icon: '/logo192.png', // Assuming a react default icon, change if needed
                vibrate: [200, 100, 200]
            });
        }
    };

    return { trackingError };
};

export default useLBS;
