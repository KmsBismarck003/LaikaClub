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

  const fetchBusySeats = useCallback(async (eventId, functionId = null) => {
    try {
      const seatsRes = await api.ticket.getBusySeats(eventId, functionId);
      setBusySeats(seatsRes || []);
    } catch (e) {
      console.warn("Failed to fetch busy seats", e);
      setBusySeats([]);
    }
  }, [api]);

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

      // Cargar asientos ocupados iniciales
      const initialFunctionId = response.functions?.[0]?.id || null;
      await fetchBusySeats(id, initialFunctionId);
      
    } catch (err) {
      errorNotification("No se pudo cargar el detalle del evento.");
      console.error(err);
      // navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, api, errorNotification, navigate, fetchBusySeats]);

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

      const matched = sortedSections?.find(s => {
        if (!s) return false;
        const sNameLower = s.name ? String(s.name).toLowerCase() : '';
        const zNameLower = z.name ? String(z.name).toLowerCase() : '';
        return (
          (sNameLower && sNameLower === zNameLower) || 
          String(s.id) === String(z.id)
        );
      });
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
    fetchBusySeats,
    zones,
    dynamicMap,
    seatTypes,
    loadDynamicMap,
    getSynchronizedZones
  };
}
