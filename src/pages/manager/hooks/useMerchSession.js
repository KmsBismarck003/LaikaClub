import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { merchInventory } from '../../../services/merchInventory';

/**
 * useMerchSession — Hook para gestionar la sesión de inventario, eventos y sincronización.
 */
export function useMerchSession(showNotification) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [items, setItems] = useState([]);

  const loadItems = useCallback(() => {
    try {
      const data = merchInventory.getAll();
      setItems(data || []);
    } catch (error) {
      if (showNotification) showNotification('Error', 'Falla en sincronización de inventario', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    const init = async () => {
      try {
        let evs = await api.event.getPublic({ limit: 50 });
        evs = evs?.filter(e => e.status === 'published') || [];
        
        setEvents(evs || []);
        if (evs && evs.length > 0 && !selectedEventId) {
          setSelectedEventId(evs[0].id);
        }
      } catch (e) {
        console.error('Error loading events:', e);
        setEvents([]);
      }
      loadItems();
    };
    
    init();
    window.addEventListener('merch_update', loadItems);
    return () => window.removeEventListener('merch_update', loadItems);
  }, [selectedEventId, loadItems]);

  const toggleItemStatus = (id) => {
    merchInventory.toggleStatus(id);
    loadItems();
  };

  const deleteItem = (id) => {
    merchInventory.deleteItem(id);
    loadItems();
  };

  const filteredItems = selectedEventId 
    ? items.filter(i => i.eventId === selectedEventId) 
    : [];

  const activeEvent = events.find(e => e.id === selectedEventId);

  return {
    loading, events, selectedEventId, setSelectedEventId,
    items, filteredItems, activeEvent,
    loadItems, toggleItemStatus, deleteItem
  };
}
