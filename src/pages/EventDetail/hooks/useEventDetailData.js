import { useState, useEffect, useCallback } from 'react';

/**
 * useEventDetailData — Hook para gestionar la carga de datos del evento y metadatos.
 */
export function useEventDetailData(id, showError, navigate) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busySeats, setBusySeats] = useState([]);

  const fetchEventDetail = useCallback(async (api, background = false) => {
    if (!background) setLoading(true);
    try {
      const [response, busy] = await Promise.all([
        api.event.getById(id),
        api.ticket.getBusySeats(id).catch(() => [])
      ]);
      setEvent(response);
      setBusySeats(busy || []);
      return response;
    } catch (error) {
      if (!background) {
        showError("Evento no encontrado o no disponible");
        navigate("/");
      }
    } finally {
      if (!background) setLoading(false);
    }
  }, [id, showError, navigate]);

  // Recently Viewed Logic
  useEffect(() => {
    if (event) {
      const recentlyViewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]");
      const newItem = {
        id: event.id,
        name: event.name,
        image: event.image_url || event.image,
        venue: event.venue || event.location,
      };
      const updated = [newItem, ...recentlyViewed.filter((item) => item.id !== event.id)].slice(0, 5);
      localStorage.setItem("recently_viewed", JSON.stringify(updated));
      window.dispatchEvent(new Event("recentlyViewedUpdated"));
    }
  }, [event]);

  return { event, setEvent, loading, setLoading, busySeats, fetchEventDetail };
}
