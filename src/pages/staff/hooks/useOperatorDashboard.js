import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

/**
 * useOperatorDashboard - Hook de lógica desacoplada para la consola Bento del operador.
 * Centraliza persistencia, cómputo de métricas en tiempo real y gestión de recintos.
 */
export const useOperatorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. Estado de Sesión y Acceso
  const [accessPoint, setAccessPointState] = useState(() => {
    return localStorage.getItem('staff_access_point') || 'Puerta Principal - Acceso 1';
  });

  const setAccessPoint = useCallback((point) => {
    setAccessPointState(point);
    localStorage.setItem('staff_access_point', point);
  }, []);

  // 2. Carga de Eventos Reales
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(() => {
    return localStorage.getItem('staff_selected_event_id') || '';
  });
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const data = await api.event.getAll({ status_filter: 'published' });
        if (isMounted) {
          const validEvents = Array.isArray(data) ? data : [];
          setEvents(validEvents);
          if (validEvents.length > 0 && !selectedEventId) {
            const firstId = String(validEvents[0].id);
            setSelectedEventId(firstId);
            localStorage.setItem('staff_selected_event_id', firstId);
          }
        }
      } catch (err) {
        console.error('Error al cargar eventos para operador:', err);
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, [selectedEventId]);

  const handleSelectEvent = useCallback((id) => {
    setSelectedEventId(id);
    localStorage.setItem('staff_selected_event_id', id);
  }, []);

  const activeEvent = useMemo(() => {
    return events.find((e) => String(e.id) === String(selectedEventId)) || null;
  }, [events, selectedEventId]);

  // 3. Historial y Métricas de Escaneo en Tiempo Real
  const [scanHistory, setScanHistory] = useState([]);

  const loadScanHistory = useCallback(() => {
    const saved = localStorage.getItem('staff_scan_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScanHistory(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Error al parsear staff_scan_history:', e);
      }
    }
  }, []);

  useEffect(() => {
    loadScanHistory();
    // Escuchar cambios de localStorage si el scanner se ejecuta en otra pestaña
    const onStorage = (e) => {
      if (e.key === 'staff_scan_history') {
        loadScanHistory();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadScanHistory]);

  // 4. Métricas Computadas
  const sessionStats = useMemo(() => {
    const total = scanHistory.length;
    const valids = scanHistory.filter(
      (h) => h.status === 'valid' || h.status === 'used' || (h.valid && !h.alreadyUsed)
    ).length;
    const invalids = scanHistory.filter(
      (h) => h.status === 'invalid' || (!h.valid && !h.alreadyUsed)
    ).length;
    const duplicates = scanHistory.filter(
      (h) => h.alreadyUsed || h.status === 'used' || h.statusCode === 'ALREADY_REDEEMED'
    ).length;

    const successRate = total > 0 ? Math.round((valids / total) * 100) : 100;

    return {
      total,
      valids,
      invalids,
      duplicates,
      successRate,
      hoursActive: 1 // Turno en curso
    };
  }, [scanHistory]);

  // 5. Feed de Actividad Reciente (últimos 5 accesos)
  const recentActivity = useMemo(() => {
    return scanHistory.slice(0, 5);
  }, [scanHistory]);

  // 6. Navegación Asistida a Herramientas
  const navigateTo = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  return {
    user,
    accessPoint,
    setAccessPoint,
    events,
    selectedEventId,
    setSelectedEventId: handleSelectEvent,
    activeEvent,
    loadingEvents,
    sessionStats,
    recentActivity,
    navigateTo,
    refreshHistory: loadScanHistory
  };
};

export default useOperatorDashboard;
