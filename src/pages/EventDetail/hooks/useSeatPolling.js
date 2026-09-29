import { useEffect, useRef } from 'react';

/**
 * useSeatPolling - Hook aislado y modular para mantener sincronizado
 * el mapa de asientos con la base de datos en tiempo real mediante polling.
 * También verifica si los asientos actualmente en el "carrito" del usuario
 * han sido comprados por alguien más durante su estancia.
 */
export function useSeatPolling(
  eventId,
  functionId,
  fetchBusySeats,
  selectedSeats,
  setSelectedSeats,
  busySeats,
  errorNotification
) {
  const isMounted = useRef(true);

  // Controlar desmontaje para evitar updates de estado en componentes destruidos
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Polling: Consultar al backend los asientos ocupados
  useEffect(() => {
    if (!eventId) return;

    const poll = async () => {
      if (isMounted.current && fetchBusySeats) {
        await fetchBusySeats(eventId, functionId);
      }
    };

    // Polling cada 7 segundos para frescura sin abrumar la red
    const intervalId = setInterval(poll, 7000);

    return () => clearInterval(intervalId);
  }, [eventId, functionId, fetchBusySeats]);

  // Validación de Colisión (Condición de Carrera Frontend)
  // Si el polling arroja un busySeat que yo tengo localmente "seleccionado", me lo quita
  useEffect(() => {
    if (selectedSeats && selectedSeats.length > 0 && busySeats && busySeats.length > 0) {
      // Cruzar datos: ¿Mis asientos seleccionados están en la lista oficial de ocupados?
      const stolenSeats = selectedSeats.filter(seatId => busySeats.includes(seatId));
      
      if (stolenSeats.length > 0) {
        // Remover de la selección local inmediatamente
        const remainingSeats = selectedSeats.filter(seatId => !busySeats.includes(seatId));
        setSelectedSeats(remainingSeats);
        
        // Informar al usuario para evitar confusiones
        errorNotification(
          `¡Atención! Un asiento que habías seleccionado acaba de ser reservado/vendido por otro usuario. Por favor selecciona otro.`
        );
      }
    }
  }, [busySeats, selectedSeats, setSelectedSeats, errorNotification]);
}
