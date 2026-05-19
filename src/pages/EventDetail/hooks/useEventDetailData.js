import { useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_ZONES, STADIUM_ZONES, SUMMER_EDITION_PRESET } from '../constants/mockData';
import { cleanPrice } from '../utils/helpers';

/**
 * useEventDetailData — Hook para gestionar la carga de datos del evento, mapas dinámicos y sincronización de zonas.
 */
export function useEventDetailData(id, api, venueAPI, errorNotification, navigate) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busySeats, setBusySeats] = useState([]);
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [dynamicMap, setDynamicMap] = useState(null);
  const [seatTypes, setSeatTypes] = useState([]);

  const fetchEventDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.event.getById(id);
      setEvent(response);
      
      // Si el evento tiene un recinto con mapa, cargamos las zonas
      if (response.venue?.zones) {
          setZones(response.venue.zones);
      } else if (response.venue_type === 'stadium') {
          setZones(STADIUM_ZONES);
      } else if (response.venue_type === 'summer') {
          setZones(SUMMER_EDITION_PRESET);
      }

      // Cargar asientos ocupados
      try {
        const seatsRes = await api.ticket.getBusySeats(id);
        setBusySeats(seatsRes || []);
      } catch (e) {
        console.warn("Failed to fetch busy seats, using empty array");
        setBusySeats([]);
      }
      
    } catch (err) {
      errorNotification("No se pudo cargar el detalle del evento.");
      console.error(err);
      // navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, api, errorNotification, navigate]);

  const loadDynamicMap = useCallback(async (selectedFunction) => {
    if (!selectedFunction?.room_id) return;
    try {
      const mapData = await venueAPI.getRoomMap(selectedFunction.room_id);
      setDynamicMap(mapData);
      if (mapData.seatTypes) setSeatTypes(mapData.seatTypes);
    } catch (e) {
      console.warn("No dynamic map found for this room", e);
      setDynamicMap(null);
    }
  }, [venueAPI]);

  const getSynchronizedZones = useCallback((sortedSections) => {
    // If no custom sections/tiers are defined, override every seating zone's price to the base event price!
    const hasCustomSections = event?.sections && event.sections.length > 0;

    return zones.map(z => {
      if (!hasCustomSections && z.type === 'seating') {
        return {
          ...z,
          price: event?.price || 0
        };
      }

      const matched = sortedSections?.find(s => 
        s.name.toLowerCase() === z.name.toLowerCase() || 
        s.id === z.id
      );
      if (matched) {
        return {
          ...z,
          price: matched.price,
          available: matched.available,
          total: matched.total,
          originalSection: matched
        };
      }
      return z;
    });
  }, [zones, event]);

  const addBusySeats = useCallback((seats) => {
    if (Array.isArray(seats)) {
      setBusySeats(prev => [...new Set([...prev, ...seats])]);
    }
  }, []);

  return {
    event,
    loading,
    busySeats,
    addBusySeats,
    fetchEventDetail,
    zones,
    dynamicMap,
    seatTypes,
    loadDynamicMap,
    getSynchronizedZones
  };
}
