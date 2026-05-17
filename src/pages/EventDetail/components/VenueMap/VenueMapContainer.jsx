import React from 'react';
import InteractiveVenueMap from './InteractiveVenueMap';
import SeatMapLegend from './SeatMapLegend';

/**
 * VenueMapContainer — Contenedor principal del mapa de asientos para el usuario final.
 * Soporta el nuevo formato del builder v2 (layout_json.components) y el formato legacy.
 */
export default function VenueMapContainer({
  event,
  synchronizedZones,
  sortedSections,
  selectedSection,
  setSelectedSection,
  selectedSeats,
  toggleSeat,
  busySeats,
  seatTypes,
  isRouletteActive,
  winningSeatId,
  activeScannerZoneId,
  activeScannerSeatId,
  showCrownTransition,
  handleRouletteComplete,
  mapScale,
  mapPos,
  isDragging,
  dragStart,
  setMapPos,
  setIsDragging,
  setDragStart,
  handleZoom,
  resetMap,
}) {
  // New builder format: layout_json.components from the room's saved map
  const newMapData =
    event?.room?.layout_json?.components ||
    event?.seating_map?.layout_json?.components ||
    null;

  // Guard: nothing to show
  if (event?.use_seating_map === false) return null;
  const hasNewMap = newMapData && newMapData.length > 0;
  const hasLegacyZones = synchronizedZones && synchronizedZones.length > 0;
  if (!hasNewMap && !hasLegacyZones) return null;

  const hasWheelchair = hasNewMap
    ? newMapData.some(c => c.blocks?.some(b => b.seats?.some(s => s.type === 'accessible')))
    : synchronizedZones?.some(z => z.type === 'wheelchair');

  const hasVip = hasNewMap
    ? newMapData.some(c => c.blocks?.some(b => b.seats?.some(s => s.type === 'vip')))
    : synchronizedZones?.some(z =>
        z.name?.toLowerCase().includes('vip') || z.name?.toLowerCase().includes('platino')
      );

  return (
    <div className="event-map venue-map-container-wrapper">
      <SeatMapLegend showVip={hasVip} showWheelchair={hasWheelchair} />

      <InteractiveVenueMap
        mapData={newMapData}
        synchronizedZones={synchronizedZones}
        selectedSection={selectedSection}
        isRouletteActive={isRouletteActive}
        sortedSections={sortedSections}
        setSelectedSection={setSelectedSection}
        activeScannerZoneId={activeScannerZoneId}
        selectedSeats={selectedSeats}
        onSeatToggle={toggleSeat}
        busySeats={busySeats}
        winnerSeatId={winningSeatId}
        activeScannerSeatId={activeScannerSeatId}
        onRouletteComplete={handleRouletteComplete}
        mapScale={mapScale}
        mapPos={mapPos}
        isDragging={isDragging}
        dragStart={dragStart}
        setMapPos={setMapPos}
        setIsDragging={setIsDragging}
        setDragStart={setDragStart}
        handleZoom={handleZoom}
        resetMap={resetMap}
      />

      {selectedSeats && selectedSeats.length > 0 && (
        <div className="venue-map-selection-summary">
          <span className="selection-count-badge">{selectedSeats.length}</span>
          <span>
            asiento{selectedSeats.length !== 1 ? 's' : ''}{' '}
            seleccionado{selectedSeats.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
