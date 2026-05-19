import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSeatLock - Hook aislado para gestionar el bloqueo temporal (pessimistic lock) de asientos seleccionados.
 */
export function useSeatLock(selectedSeats, setSelectedSeats, errorNotification) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos de reserva temporal (300s)
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (selectedSeats && selectedSeats.length > 0) {
      if (!isActive) {
        setIsActive(true);
        setTimeLeft(300); // Reiniciar a 5 minutos
      }
    } else {
      setIsActive(false);
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [selectedSeats, isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setSelectedSeats([]); // Liberar asientos seleccionados
            setIsActive(false);
            errorNotification("Tu reserva temporal de asientos ha expirado. Por favor, selecciónalos de nuevo.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, setSelectedSeats, errorNotification]);

  const resetLock = useCallback(() => {
    setIsActive(false);
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatTimeLeft = useCallback(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return {
    timeLeft,
    isActive,
    formatTimeLeft,
    resetLock
  };
}
