import { useState, useCallback } from 'react';
import { managerAPI, venueAPI } from '../../services/managerService';

export const useManagerStats = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    totalSold: 0,
    totalRevenue: 0,
  });
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch dashboard analytical metrics
      let analyticalStats = { totalEvents: 0, publishedEvents: 0, totalSold: 0, totalRevenue: 0 };
      try {
        const analyticalData = await managerAPI.getAnalytics();
        if (analyticalData) {
          analyticalStats = {
            totalEvents: analyticalData.total_events || 0,
            publishedEvents: analyticalData.published_events || 0,
            totalSold: analyticalData.total_sold || 0,
            totalRevenue: analyticalData.total_revenue || 0,
          };
        }
      } catch (analyticsErr) {
        console.warn('Dashboard stats fallback due to error:', analyticsErr);
        if (analyticsErr?.status === 401) {
          throw analyticsErr;
        }
        // Fallback: derive from getMyEvents
        const events = await managerAPI.getMyEvents();
        const totalSold = events.reduce((acc, curr) => acc + (parseInt(curr.tickets_sold) || 0), 0);
        const totalRevenue = events.reduce((acc, curr) => acc + (parseFloat(curr.revenue) || 0), 0);
        analyticalStats = {
          totalEvents: events.length,
          publishedEvents: events.filter(e => e.status === 'published').length,
          totalSold,
          totalRevenue,
        };
      }

      setStats(analyticalStats);

      // 2. Fetch venues assigned to manager
      try {
        const params = { status_filter: 'active' };
        if (userId) {
          params.manager_id = userId;
        }
        const venuesData = await venueAPI.getAll(params);
        setVenues(venuesData || []);
      } catch (venuesErr) {
        console.warn('Failed to load manager venues:', venuesErr);
        setVenues([]);
      }

    } catch (err) {
      console.error('Error fetching manager dashboard data:', err);
      setError('No se pudo cargar el resumen de administración.');
      if (err?.status === 401) {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    venues,
    loading,
    error,
    fetchDashboardData,
  };
};

export default useManagerStats;
