import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function useRecommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchRecommendations = useCallback(async (extDateFrom, extDateTo) => {
    setLoading(true);
    setError(null);
    try {
      const dFrom = extDateFrom !== undefined ? extDateFrom : dateFrom;
      const dTo = extDateTo !== undefined ? extDateTo : dateTo;

      const params = new URLSearchParams();
      if (dFrom) params.append('date_from', dFrom);
      if (dTo)   params.append('date_to',   dTo);

      const url = `${API_BASE}/analytics/recommendations${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  return { loading, error, data, dateFrom, setDateFrom, dateTo, setDateTo, fetchRecommendations };
}
