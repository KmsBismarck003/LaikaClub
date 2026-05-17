import React, { useState, useRef } from 'react';
import { Icon } from '../../../../components';
import VenueMapSVG from '../../../../components/VenueMapSVG';

/**
 * InteractiveVenueMap — Wrapper del mapa para EventDetail.
 * Soporta el nuevo formato layout_json.components (builder v2)
 * y también el formato legacy de zones para retrocompatibilidad.
 */
const InteractiveVenueMap = ({
  // New format
  mapData,
  // Legacy props (backward compat) — ignored if mapData is provided
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
  // Admin
  isAdminView = false,
}) => {
  const [showZoomPill, setShowZoomPill] = useState(false);
  const wrapperRef = useRef(null);

  // Determine what data to pass to VenueMapSVG
  // mapData = layout_json.components from new builder
  const resolvedMapData = mapData || [];

  // If no new mapData but we have legacy zones, convert them
  // (This handles events whose maps were built with the old system)
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
    <div className="map-container" ref={wrapperRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <VenueMapSVG
        mapData={finalMapData}
        busySeats={busySeats}
        selectedSeats={selectedSeats}
        onSeatToggle={onSeatToggle}
        readOnly={isAdminView}
        height="100%"
      />

      {/* Zoom controls overlay */}
      <div className="map-controls" style={{ position: 'absolute', bottom: 50, right: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button type="button" className="control-btn-premium" title="Acercar" style={{ opacity: 0 }}>
          <Icon name="plus" size={16} />
        </button>
      </div>
    </div>
  );
};

export default InteractiveVenueMap;
