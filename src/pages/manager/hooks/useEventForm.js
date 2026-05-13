import { useState, useEffect, useCallback } from 'react';
import api, { venueAPI } from '../../../services/api';

export function useEventForm(event = null, showNotification, onSuccess) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [venues, setVenues] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'concert',
    event_date: '',
    event_time: '',
    location: '',
    venue: '',
    venue_id: '',
    total_tickets: 100,
    price: 0,
    image_url: '',
    map_url: '',
    seat_map_url: ''
  });

  const [functions, setFunctions] = useState([]);
  const [newFunction, setNewFunction] = useState({ date: '', time: '', venue_id: '' });

  const formatTime = (time) => {
    if (!time) return '';
    const str = String(time);
    if (str.includes(':')) return str.substring(0, 5);
    return '';
  };

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const data = await venueAPI.getAll('active');
        setVenues(data);
      } catch (err) { console.error(err); }
    };
    loadVenues();
  }, []);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        category: event.category || 'concert',
        event_date: event.event_date?.split('T')[0] || '',
        event_time: event.event_time ? formatTime(event.event_time) : '',
        location: event.location || '',
        venue: event.venue || '',
        venue_id: event.venue_id || '',
        total_tickets: event.total_tickets || 100,
        price: event.price || 0,
        image_url: event.image_url || '',
        map_url: event.map_url || '',
        seat_map_url: event.seat_map_url || ''
      });

      if (event.functions && Array.isArray(event.functions)) {
        setFunctions(event.functions.map(f => ({
          date: f.date.split('T')[0],
          time: formatTime(f.time),
          venue_id: f.venue_id
        })));
      }
    }
  }, [event]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleVenueChange = useCallback((venueId) => {
    const selected = venues.find(v => String(v.id) === String(venueId));
    if (selected) {
      setFormData(prev => ({ ...prev, venue_id: venueId, venue: selected.name, location: selected.city }));
      setNewFunction(prev => ({ ...prev, venue_id: venueId }));
    }
  }, [venues]);

  const handleAddFunction = useCallback(() => {
    if (!newFunction.date || !newFunction.time || !newFunction.venue_id) {
      if (showNotification) showNotification('Error', 'Completa los campos de la función', 'warning');
      return;
    }
    setFunctions(prev => [...prev, { ...newFunction, tempId: Date.now() }]);
    setNewFunction(prev => ({ ...prev, date: '', time: '' }));
  }, [newFunction, showNotification]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.manager.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: res.url }));
      if (showNotification) showNotification('Imagen subida', '', 'success');
    } catch (err) {
      if (showNotification) showNotification('Error al subir imagen', '', 'error');
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (functions.length > 0) {
        const sorted = [...functions].sort((a, b) => new Date(a.date+'T'+a.time) - new Date(b.date+'T'+b.time));
        payload.functions = sorted.map(f => ({ ...f, venue_id: parseInt(f.venue_id) }));
        payload.event_date = sorted[0].date;
        payload.event_time = sorted[0].time;
      }

      if (event) await api.manager.updateEvent(event.id, payload);
      else await api.manager.createEvent(payload);

      if (showNotification) showNotification('Éxito', 'Evento guardado', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      if (showNotification) showNotification('Error al guardar', '', 'error');
    } finally { setLoading(false); }
  };

  return {
    formData, setFormData, handleChange, handleVenueChange,
    functions, setFunctions, handleAddFunction,
    newFunction, setNewFunction,
    venues, loading, uploading, handleImageUpload, handleSubmit
  };
}
