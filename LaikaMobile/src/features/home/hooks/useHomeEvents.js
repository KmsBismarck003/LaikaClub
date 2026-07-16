import { useState, useEffect, useCallback } from 'react';
import { eventAPI } from '../../../services';
import useLocation from '../../location/useLocation';

export const useHomeEvents = () => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { location } = useLocation();

  const loadData = useCallback(async (isRefresh = false, userLocation = null) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const queryParams = { limit: 50 };
      if (userLocation) {
        queryParams.lat = userLocation.latitude;
        queryParams.lng = userLocation.longitude;
      }
      const eventsRes = await eventAPI.getPublic(queryParams);
      setEvents(eventsRes || []);
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError('No se pudieron cargar los eventos. Verifica tu conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (location) loadData(false, location);
  }, [location, loadData]);

  // Initial load if no location is available immediately
  useEffect(() => {
    if (!location) loadData();
  }, [loadData, location]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true, location);
  };

  const filteredEvents = events.filter((e) => {
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.venue && e.venue.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch && e.status === 'published';
  });

  const featuredEvents = events.filter(e => e.status === 'published').slice(0, 5); // Max 5 for Hero Carousel
  const listEvents = filteredEvents; // All filtered events for the grid

  return {
    events,
    filteredEvents,
    featuredEvents,
    listEvents,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    loading,
    refreshing,
    error,
    onRefresh,
    loadData,
  };
};

export default useHomeEvents;
