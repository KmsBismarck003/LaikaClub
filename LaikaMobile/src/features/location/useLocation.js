import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permiso de ubicación denegado. No podremos sugerirte eventos cercanos.');
          setLoading(false);
          return;
        }

        let locationResult = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
        });

        // Background permissions needed for real geofencing
        const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
        if (bgStatus === 'granted') {
          // Prepared for future Geofencing regions
          // Location.startGeofencingAsync('LAIKA_VENUES_TASK', [...regions])
        }
      } catch (error) {
        // En emuladores sin ubicación o fallas de red
        setErrorMsg('No se pudo obtener la ubicación.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, errorMsg, loading };
};

export default useLocation;
