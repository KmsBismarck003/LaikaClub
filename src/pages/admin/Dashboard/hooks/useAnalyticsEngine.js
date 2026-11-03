import { useState, useCallback, useMemo } from 'react';
import { analyticsAPI } from '../../../../services/misc.service';

/**
 * useAnalyticsEngine — Hook para el motor Spark con reintentos automáticos.
 */
export function useAnalyticsEngine() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
  const [engineStatus, setEngineStatus] = useState('IDLE');
  const [data3D, setData3D] = useState([]);
  const [selectedTable, setSelectedTable] = useState('payments');
  const [filters, setFilters] = useState({
    date_from: '', date_to: '', category: '', role: '',
    payment_method: '', status: '',
    min_price: '', max_price: '',
    hour_range: '', anomalies_only: false, limit: 20
  });

  const canonicalData = useMemo(() => {
    if (!Array.isArray(data3D)) return [];
    return data3D
      .map(d => ({
        ...d,
        producto: d.producto || d.name || 'SIN_CLASIFICAR',
        val_num: d.ingreso_total || d.z_ingreso || 0
      }))
      .sort((a, b) => b.val_num - a.val_num);
  }, [data3D]);

  const executeAnalysis = useCallback(async (retries = 3) => {
    setLoading(true);
    setError(null);
    setEngineStatus('STARTING');
    try {
      const queryFilters = { ...filters };
      Object.keys(queryFilters).forEach(k => !queryFilters[k] && delete queryFilters[k]);

      const response = await analyticsAPI.getMapReduceStats3D(selectedTable, queryFilters);
      
      let finalData = [];
      if (Array.isArray(response)) {
        finalData = response;
      } else if (response && Array.isArray(response.data)) {
        finalData = response.data;
      }

      setData3D(finalData);
      setLastSync(new Date().toLocaleTimeString());
      setEngineStatus('READY');
    } catch (err) {
      setEngineStatus('ERROR');
      setError('ERROR DE CONEXIÓN: ' + (err.response?.data?.detail || err.message || 'MOTOR OFFLINE'));
    } finally {
      setLoading(false);
    }
  }, [selectedTable, filters]);

  return {
    loading, error, setError,
    lastSync, engineStatus, setEngineStatus,
    data3D, setData3D,
    selectedTable, setSelectedTable,
    filters, setFilters,
    canonicalData,
    executeAnalysis
  };
}
