import React from 'react';
import VenueMapSVG from '../../../../components/VenueMapSVG';

/**
 * InteractiveVenueMap — Wrapper del mapa para EventDetail.
 * Ocupa el 100% del contenedor padre (venue-map-interactive-area).
 * Soporta el nuevo formato layout_json.components (builder v2)
 * y también el formato legacy de zones para retrocompatibilidad.
 */
const InteractiveVenueMap = ({
  // New format
  mapData,
  // Legacy props (backward compat) — ignorados si mapData existe
  synchronizedZones,
  selectedSection,
  sortedSections,
  setSelectedSection,
  isRouletteActive,
  // Seat interaction
  selectedSeats = [],
  onSeatToggle,
  busySeats = [],
  winnerSeatId = null,
  activeScannerZoneId,
  activeScannerSeatId,
  onRouletteComplete,
  // Map pan/zoom — pasados desde useVenueMap
  mapScale,
  mapPos,
  isDragging,
  dragStart,
  setMapPos,
  setIsDragging,
  setDragStart,
  handleZoom,
  resetMap,
  // Admin
  isAdminView = false,
}) => {
  // Determine what data to pass to VenueMapSVG
  const resolvedMapData = mapData || [];

  // Si no hay nuevo formato pero sí zonas legacy, convertirlas
  const legacyConverted = (!mapData || !mapData.length) && synchronizedZones?.length
    ? synchronizedZones.map(zone => ({
        id: zone.id || zone.frontend_id,
        type: 'seats',
        name: zone.name,
        color: zone.color || '#3f3f46',
        price: zone.price,
        rotation: 0,
        x: 0, y: 0, width: 0, height: 0,
        blocks: zone.blocks?.map(b => ({
          id: b.id || b.frontend_id,
          rowLabel: b.name || 'A',
          seats: b.seats?.map(s => ({
            id: s.id || s.frontend_id,
            rowLabel: s.row_label || 'A',
            number: s.seat_number || 1,
            type: s.seat_type || 'normal',
            x: s.x_pos || 0,
            y: s.y_pos || 0,
          })) || []
        })) || []
      }))
    : null;

  const finalMapData = resolvedMapData.length ? resolvedMapData : (legacyConverted || []);

  return (
    <VenueMapSVG
      mapData={finalMapData}
      busySeats={busySeats}
      selectedSeats={selectedSeats}
      onSeatToggle={onSeatToggle}
      readOnly={isAdminView}
      height="100%"
      width="100%"
      selectedSection={selectedSection}
    />
  );
};

export default InteractiveVenueMap;
