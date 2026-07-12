import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { managerAPI } from '../../services/managerService';

export const useManagerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await managerAPI.getMyEvents();
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching manager events:', err);
      setError('No se pudieron cargar tus eventos.');
      if (err?.status === 401) {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTogglePublish = async (event) => {
    const isPublished = event.status === 'published';
    setLoading(true);
    try {
      if (isPublished) {
        await managerAPI.unpublishEvent(event.id);
        Alert.alert('Despublicado', 'El espectáculo se ha movido a Borrador.');
      } else {
        await managerAPI.publishEvent(event.id);
        Alert.alert('Publicado', 'El espectáculo ya está visible al público.');
      }
      await fetchMyEvents();
    } catch (err) {
      console.error('Error toggling publish:', err);
      Alert.alert('Error', 'No se pudo cambiar el estado de publicación.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (event) => {
    Alert.prompt(
      'Cancelar Espectáculo',
      'Ingresa el motivo de la cancelación. Esto se notificará a los compradores y desactivará la venta.',
      async (reason) => {
        if (!reason || !reason.trim()) {
          Alert.alert('Alerta', 'Debes ingresar un motivo de cancelación.');
          return;
        }
        setLoading(true);
        try {
          await managerAPI.cancelEvent(event.id, reason.trim());
          Alert.alert('Cancelado', 'El espectáculo ha sido cancelado con éxito.');
          await fetchMyEvents();
        } catch (err) {
          console.error('Error cancelling event:', err);
          Alert.alert('Error', 'No se pudo cancelar el espectáculo.');
        } finally {
          setLoading(false);
        }
      },
      'plain-text',
      ''
    );
  };

  const handleDelete = (event) => {
    Alert.alert(
      'Eliminar Evento',
      `¿Estás seguro de que quieres eliminar definitivamente "${event.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await managerAPI.deleteEvent(event.id);
              Alert.alert('Eliminado', 'El evento ha sido eliminado.');
              await fetchMyEvents();
            } catch (err) {
              console.error('Error deleting event:', err);
              Alert.alert('Error', 'No se pudo eliminar el evento.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return {
    events,
    loading,
    error,
    fetchMyEvents,
    handleTogglePublish,
    handleCancel,
    handleDelete,
  };
};

export default useManagerEvents;
