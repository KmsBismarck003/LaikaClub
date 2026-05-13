import { useState, useCallback } from 'react';

/**
 * useVenueMap — Hook para gestionar la interactividad del mapa de asientos.
 * Maneja el estado de zoom (scale), posición (pan) y el rastro de arrastre.
 */
export function useVenueMap(initialScale = 0.6) {
  const [mapScale, setMapScale] = useState(initialScale);
  const [mapPos, setMapPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoom = useCallback((delta) => {
    setMapScale((prev) => {
      const newScale = prev + delta;
      return Math.min(Math.max(newScale, 0.4), 2.5); // Límites de zoom industriales
    });
  }, []);

  const resetMap = useCallback(() => {
    setMapScale(initialScale);
    setMapPos({ x: 0, y: 0 });
  }, [initialScale]);

  return {
    // Estado
    mapScale,
    mapPos,
    isDragging,
    dragStart,
    
    // Setters (para compatibilidad con componentes actuales)
    setMapPos,
    setIsDragging,
    setDragStart,
    setMapScale,

    // Handlers de conveniencia
    handleZoom,
    resetMap
  };
}
