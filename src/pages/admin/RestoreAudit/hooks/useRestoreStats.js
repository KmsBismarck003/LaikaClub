import { useState, useCallback, useEffect } from 'react';
import api from '../../../../services/api';

/**
 * useRestoreStats — Hook para gestionar estadísticas y métricas generales del módulo.
 */
export function useRestoreStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.restoreAudit.getStats();
      setStats(data.stats || null);
    } catch (err) {
      setError('Error al cargar estadísticas: ' + (err.message || 'Fallo desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchStats };
}
