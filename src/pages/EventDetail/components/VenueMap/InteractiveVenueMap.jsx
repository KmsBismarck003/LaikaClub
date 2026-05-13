import React, { useState, useEffect, useRef } from 'react';
import { Icon } from "../../../../components";
import VenueMapSVG from "../../../../components/VenueMapSVG";

const InteractiveVenueMap = ({
  isDragging,
  mapScale,
  mapPos,
  setMapPos,
  setIsDragging,
  dragStart,
  setDragStart,
  synchronizedZones,
  selectedSection,
  isRouletteActive,
  sortedSections,
  setSelectedSection,
  activeScannerZoneId,
  handleZoom,
  resetMap,
  isAdminView = false, // Añadido para el Radar Admin
  // Props faltantes para interactividad de asientos:
  selectedSeats = [],
  onSeatToggle,
  busySeats = [],
  winnerSeatId = null,
  activeScannerSeatId = null,
  onRouletteComplete
}) => {
  const [showZoomPill, setShowZoomPill] = useState(false);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const zoomTimerRef = useRef(null);
  const mapWrapperRef = useRef(null); // Ref definida

  // Mostrar el pill de zoom
  useEffect(() => {
    setShowZoomPill(true);
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    zoomTimerRef.current = setTimeout(() => {
      setShowZoomPill(false);
    }, 2000);
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
    };
  }, [mapScale]);

  return (
    <div className="map-container" style={{ position: 'relative' }}>
      <header className="map-header-premium">
        <h3 className="section-title-industrial">
          <Icon name="map" size={16} /> MAPA DEL RECINTO (ZOOMABLE)
        </h3>
        <div className="header-line"></div>
      </header>
      
      <div
        ref={mapWrapperRef} /* Ref asignada */
        className={`seat-map-wrapper ${isDragging ? "dragging" : ""}`}
        onMouseDown={(e) => {
          // No iniciar drag si el clic es en un asiento (.seat-rect)
          if (e.target.closest('.seat-rect')) return;
          
          setIsDragging(true);
          setDragStart({
            x: e.clientX,
            y: e.clientY,
            initialPos: { ...mapPos }
          });
        }}
        onMouseMove={(e) => {
          if (!isDragging || !dragStart) return;
          const dx = e.clientX - (dragStart.x || 0);
          const dy = e.clientY - (dragStart.y || 0);
          setMapPos({
            x: (dragStart.initialPos?.x || 0) + dx,
            y: (dragStart.initialPos?.y || 0) + dy,
          });
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          className="seat-map-content"
          style={{
            transform: `translate(-50%, -50%) translate(${(mapPos?.x || 0)}px, ${(mapPos?.y || 0)}px) scale(${mapScale || 1})`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <VenueMapSVG
            zones={synchronizedZones}
            selectedZoneId={isRouletteActive ? null : selectedSection?.id}
            mapView={{ zoom: 1, pan: { x: 0, y: 0 } }}
            onZoneSelect={(zoneId) => {
              if (!zoneId) {
                // Solo deseleccionar si no hay drag
                setSelectedSection(null);
                return;
              }
              let actualSec = sortedSections.find(
                (s) => s.id?.toString() === zoneId?.toString()
              );
              if (!actualSec) {
                const zone = synchronizedZones.find(z => z.id === zoneId);
                if (zone) {
                  actualSec = { id: zone.id, name: zone.name, price: 0, available: 0 };
                }
              }
              if (actualSec) setSelectedSection?.(actualSec);
            }}
            // Pasar props de interacción de asientos
            selectedSeats={selectedSeats}
            onSeatToggle={(seat) => onSeatToggle?.(seat)}
            busySeats={busySeats}
            rouletteActive={isRouletteActive}
            winnerSeatId={winnerSeatId}
            activeScannerZoneId={activeScannerZoneId}
            activeScannerSeatId={activeScannerSeatId}
            onRouletteComplete={() => onRouletteComplete?.()}
            // Prop para actualizar hover
            setHoveredSeat={setHoveredSeat}
          />
        </div>

        {/* TECNICAL BUBBLE "NUEVECITA" */}
        {/* TECNICAL BUBBLE "NUEVECITA" */}
        {hoveredSeat && (
          <div 
            className="seat-hover-hud-glass bubble-mode"
            style={{
              position: 'absolute',
              top: hoveredSeat.rect.top - (mapWrapperRef.current?.getBoundingClientRect().top || 0),
              left: (hoveredSeat.rect.left + hoveredSeat.rect.width / 2) - (mapWrapperRef.current?.getBoundingClientRect().left || 0),
              transform: 'translate(-50%, calc(-100% - 14px))',
              zIndex: 999999,
              WebkitBackdropFilter: 'blur(12px)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'stretch',
              pointerEvents: 'none'
            }}
          >
            <div className="hud-content-industrial-main" style={{ padding: '8px 24px 8px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className={`hud-status-tag status-${String(hoveredSeat.status).toLowerCase()}`} style={{ 
                fontSize: '7px', 
                fontWeight: '900', 
                letterSpacing: '1px'
              }}>
                [{hoveredSeat.status}]
              </span>
              <span className="hud-zone-name" style={{ fontSize: '10px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>
                {hoveredSeat.zoneName}
              </span>
              <span className="hud-seat-id-minimal" style={{ fontSize: '8px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                {hoveredSeat.id}
              </span>
            </div>

            <div className="hud-v-divider-premium" style={{ width: '1px', background: 'rgba(255,255,255,0.15)', margin: '8px 0' }}></div>

            <div className="hud-content-industrial-price" style={{ padding: '8px 24px 8px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '80px' }}>
              <span className="hud-price-label-tech" style={{ fontSize: '7px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>VALOR</span>
              <span className="hud-price-value-tech" style={{ fontSize: '12px', fontWeight: '950', color: '#fff' }}>
                ${hoveredSeat.price}
              </span>
            </div>

            {/* Pico del globo industrial */}
            <div className="bubble-tail"></div>
          </div>
        )}

        <div className="map-controls">
          <div className={`zoom-indicator-pill ${showZoomPill ? 'visible' : ''}`}>
            {Math.round(mapScale * 100)}%
          </div>
          <button type="button" className="control-btn-premium" onClick={() => handleZoom(0.1)} title="Aumentar">
            <Icon name="plus" size={18} />
          </button>
          <button type="button" className="control-btn-premium" onClick={() => handleZoom(-0.1)} title="Reducir">
            <Icon name="minus" size={18} />
          </button>
          <button type="button" className="control-btn-premium" onClick={resetMap} title="Restablecer Vista">
            <Icon name="refreshCcw" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveVenueMap;
