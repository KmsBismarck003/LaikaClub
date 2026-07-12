import { useState, useEffect, useCallback } from 'react';
import { achievementsAPI } from '../services/achievementsService';

export function useAchievements() {
  const [data, setData] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAchievementsData = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    setError(null);
    try {
      const [ach, coup] = await Promise.all([
        achievementsAPI.getAll(),
        achievementsAPI.getCoupons(),
      ]);
      setData(ach);
      setCoupons(Array.isArray(coup) ? coup : []);
    } catch (err) {
      console.warn('Error loading achievements in hook:', err);
      setError(err?.message || 'Error al obtener los logros');
    } finally {
      setLoading(false);
    }
  }, []);

  const runIncentivesCheck = useCallback(async () => {
    try {
      await achievementsAPI.check();
      await fetchAchievementsData(true);
      return { success: true };
    } catch (err) {
      console.warn('Error running achievements check:', err);
      return { success: false, error: err?.message };
    }
  }, [fetchAchievementsData]);

  useEffect(() => {
    fetchAchievementsData();
  }, [fetchAchievementsData]);

  return {
    data,
    coupons,
    loading,
    error,
    refresh: () => fetchAchievementsData(true),
    runCheck: runIncentivesCheck,
  };
}
