import { useState, useCallback, useEffect } from 'react';
import api from '../../../../services/api';

/**
 * useRestoreEvents — Hook para gestionar el historial de restauraciones y filtrado.
 */
export function useRestoreEvents(initialFilters = {}) {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    start_date: '', end_date: '', environment: '', severity: '', is_confirmed: '',
    ...initialFilters
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.environment) params.environment = filters.environment;
      if (filters.severity) params.severity = filters.severity;
      if (filters.is_confirmed !== '') params.is_confirmed = filters.is_confirmed === 'true';

      const data = await api.restoreAudit.getEvents(params);
      setEvents(data.events || []);
    } catch (err) {
      setError('Error al cargar eventos: ' + (err.message || 'Fallo desconocido'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleExport = async (successCallback) => {
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.environment) params.environment = filters.environment;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/restore-audit/export?${new URLSearchParams(params)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `restore_audit_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 250);
      if (successCallback) successCallback('Archivo CSV exportado exitosamente');
    } catch (err) {
      setError('Error al exportar: ' + (err.message || 'Fallo desconocido'));
    }
  };

  return { events, filters, setFilters, loading, error, setError, fetchEvents, handleExport };
}
