import { useState, useCallback } from 'react';
import api from '../../../../services/api';

/**
 * useAuditDetail — Hook para gestionar la carga del detalle de una auditoría específica.
 */
export function useAuditDetail() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEventDetail = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.restoreAudit.getEvent(id);
      setSelectedEvent(data);
    } catch (err) {
      setError('Error al cargar detalle: ' + (err.message || 'Fallo desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { selectedEvent, setSelectedEvent, loading, error, fetchEventDetail };
}
