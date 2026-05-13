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
        
        if (evs.length === 0) {
          evs = [
            { id: 'event-1', name: 'Concierto Laika 2026', image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', event_date: '2026-05-20', venue: 'Estadio Laika', category: 'Concierto', tickets_sold: 4500, total_tickets: 5000 },
            { id: 'event-2', name: 'Spring Festival MX', image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', event_date: '2026-04-15', venue: 'Centro Citibanamex', category: 'Festival', tickets_sold: 1200, total_tickets: 2000 },
            { id: 'event-3', name: 'Rave Techno Night', image_url: 'https://images.unsplash.com/photo-1514525253361-b83f859b73c0?w=800', event_date: '2026-06-02', venue: 'Warehouse 7', category: 'Club', tickets_sold: 800, total_tickets: 1000 }
          ];
        }
        setEvents(evs);
        if (evs.length > 0 && !selectedEventId) {
          setSelectedEventId(evs[0].id);
        }
      } catch (e) {
        console.error('Error loading events:', e);
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
