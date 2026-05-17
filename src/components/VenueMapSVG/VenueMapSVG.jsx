import React, { memo, useRef, useState, useCallback, useEffect } from 'react';

const SEAT_R = 9;

const SEAT_COLORS = {
  normal:     { base: '#2a2a2a', stroke: '#555',    hover: '#3f3f46', busy: '#450a0a', busyStroke: '#7f1d1d' },
  vip:        { base: '#1a1a2e', stroke: '#9333ea', hover: '#2e1065', busy: '#450a0a', busyStroke: '#7f1d1d' },
  accessible: { base: '#0f2027', stroke: '#06b6d4', hover: '#164e63', busy: '#450a0a', busyStroke: '#7f1d1d' },
};

const TYPE_ICON = { vip: '★', accessible: '♿' };
const ELEM_LABELS = { stage: '🎸 ESCENARIO', screen: '🖥 PANTALLA', aisle: 'PASILLO', ga: 'GENERAL' };

function SeatDot({ seat, isBusy, isSelected, isWinner, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const colors = SEAT_COLORS[seat.type] || SEAT_COLORS.normal;

  let fill = colors.base;
  let stroke = colors.stroke;
  let strokeW = 1;

  if (isBusy)      { fill = colors.busy; stroke = colors.busyStroke; }
  if (isSelected)  { fill = '#eab308'; stroke = '#fbbf24'; strokeW = 2; }
  if (isWinner)    { fill = '#22c55e'; stroke = '#4ade80'; strokeW = 2; }
  if (hovered && !isBusy && !isSelected) { fill = colors.hover; }

  return (
    <g>
      <circle
        cx={seat.x} cy={seat.y} r={SEAT_R}
        fill={fill} stroke={stroke} strokeWidth={strokeW}
        style={{ cursor: isBusy ? 'not-allowed' : 'pointer', transition: 'fill 0.12s' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => !isBusy && onToggle && onToggle(seat)}
      />
      {seat.type && seat.type !== 'normal' && (
        <text x={seat.x} y={seat.y + 3.5} textAnchor="middle" fontSize={6}
          fill={isSelected ? '#000' : stroke}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <tspan>{TYPE_ICON[seat.type] || ''}</tspan>
        </text>
      )}
      {/* Seat number label below */}
      {hovered && (
        <text x={seat.x} y={seat.y + SEAT_R + 9} textAnchor="middle"
          fontSize={7} fill="rgba(255,255,255,0.6)"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <tspan>{seat.rowLabel}{seat.number}</tspan>
        </text>
      )}
    </g>
  );
}

/**
 * VenueMapSVG — Generic viewer/selector for the seat map.
 * Used both in EventDetail (purchase flow) and admin live view.
 *
 * Props:
 *   mapData      — the layout_json.components array saved by AdminVenueMap
 *   busySeats    — array of seat frontend_ids that are occupied
 *   selectedSeats — array of seat ids selected by user
 *   onSeatToggle — (seat) => void
 *   readOnly     — boolean, disables interaction
 *   height       — container height string, default '100%'
 */
const VenueMapSVG = memo(({
  mapData = [],
  busySeats = [],
  selectedSeats = [],
  onSeatToggle,
  readOnly = false,
  height = '100%',
}) => {
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);

  // Auto-fit on mount
  useEffect(() => {
    if (!mapData.length || !svgRef.current) return;
    const allX = [], allY = [];
    mapData.forEach(c => {
      if (c.type === 'seats') {
        c.blocks?.forEach(b => b.seats.forEach(s => { allX.push(s.x); allY.push(s.y); }));
      } else {
        allX.push(c.x, c.x + c.width);
        allY.push(c.y, c.y + c.height);
      }
    });
    if (!allX.length) return;
    const minX = Math.min(...allX) - 40;
    const minY = Math.min(...allY) - 40;
    const maxX = Math.max(...allX) + 40;
    const maxY = Math.max(...allY) + 40;
    const mapW = maxX - minX;
    const mapH = maxY - minY;
    const rect = svgRef.current.getBoundingClientRect();
    const zoom = Math.min(rect.width / mapW, rect.height / mapH, 2);
    setViewBox({ x: minX - (rect.width / zoom - mapW) / 2, y: minY - (rect.height / zoom - mapH) / 2, zoom });
  }, [mapData]);

  const svgToCanvas = (clientX, clientY) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left) / viewBox.zoom + viewBox.x,
      y: (clientY - rect.top)  / viewBox.zoom + viewBox.y,
    };
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    const { x: cx, y: cy } = svgToCanvas(e.clientX, e.clientY);
    setViewBox(prev => {
      const newZoom = Math.max(0.3, Math.min(5, prev.zoom + delta));
      const scale = newZoom / prev.zoom;
      return { zoom: newZoom, x: cx - (cx - prev.x) * scale, y: cy - (cy - prev.y) * scale };
    });
  }, [viewBox]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { mx: e.clientX, my: e.clientY, vx: viewBox.x, vy: viewBox.y };
  };

  const handleMouseMove = (e) => {
    if (!isPanning || !panStart.current) return;
    const startX = panStart.current.vx;
    const startY = panStart.current.vy;
    const dx = (e.clientX - panStart.current.mx) / viewBox.zoom;
    const dy = (e.clientY - panStart.current.my) / viewBox.zoom;
    setViewBox(prev => ({ ...prev, x: startX - dx, y: startY - dy }));
  };

  const handleMouseUp = () => { 
    setIsPanning(false); 
    panStart.current = null; 
  };

  const busySet = new Set(busySeats);
  const selectedSet = new Set(selectedSeats);

  if (!mapData.length) {
    return (
      <div style={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
        Sin mapa configurado
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height, position: 'relative', background: '#080808', borderRadius: '8px', overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', cursor: isPanning ? 'grabbing' : 'grab', display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <style>{`@keyframes marchingAnts{from{stroke-dashoffset:8}to{stroke-dashoffset:0}}`}</style>
        </defs>
        <g transform={`scale(${viewBox.zoom}) translate(${-viewBox.x}, ${-viewBox.y})`}>
          {mapData.map(comp => {
            const cx = comp.x + (comp.width || 0) / 2;
            const cy = comp.y + (comp.height || 0) / 2;

            if (comp.type === 'seats') {
              return (
                <g key={comp.id} transform={`rotate(${comp.rotation || 0}, ${cx}, ${cy})`}>
                  {comp.blocks?.map(block => (
                    <g key={block.id}>
                      {/* Row label */}
                      {block.seats[0] && (
                        <text
                          x={block.seats[0].x - 16} y={block.seats[0].y + 4}
                          fontSize={8} fill="rgba(255,255,255,0.25)"
                          fontWeight={700} textAnchor="middle" fontFamily="monospace"
                          style={{ userSelect: 'none', pointerEvents: 'none' }}
                        >
                          <tspan>{block.rowLabel}</tspan>
                        </text>
                      )}
                      {block.seats.map(seat => (
                        <SeatDot
                          key={seat.id}
                          seat={seat}
                          isBusy={busySet.has(seat.id)}
                          isSelected={selectedSet.has(seat.id)}
                          isWinner={false}
                          onToggle={readOnly ? null : onSeatToggle}
                        />
                      ))}
                    </g>
                  ))}
                </g>
              );
            }

            // Non-seat element
            return (
              <g key={comp.id} transform={`rotate(${comp.rotation || 0}, ${cx}, ${cy})`}>
                <rect
                  x={comp.x} y={comp.y} width={comp.width || 120} height={comp.height || 40}
                  rx={6} fill={comp.color || '#334155'} stroke="rgba(255,255,255,0.08)" strokeWidth={1}
                />
                <text
                  x={cx} y={cy + 4}
                  textAnchor="middle" fontSize={10} fontWeight={800}
                  fill="rgba(255,255,255,0.6)" fontFamily="Inter,sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  <tspan>{ELEM_LABELS[comp.type] || comp.name}</tspan>
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 10, right: 10,
        display: 'flex', gap: 10, padding: '6px 10px',
        background: 'rgba(0,0,0,0.7)', borderRadius: 8,
        backdropFilter: 'blur(8px)', fontSize: '0.65rem',
      }}>
        {[
          { color: '#2a2a2a', stroke: '#555',    label: 'Disponible' },
          { color: '#eab308', stroke: '#fbbf24', label: 'Seleccionado' },
          { color: '#450a0a', stroke: '#7f1d1d', label: 'Ocupado' },
          { color: '#1a1a2e', stroke: '#9333ea', label: 'VIP' },
          { color: '#0f2027', stroke: '#06b6d4', label: '♿' },
        ].map(({ color, stroke, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.5)' }}>
            <svg width={12} height={12}>
              <circle cx={6} cy={6} r={5} fill={color} stroke={stroke} strokeWidth={1} />
            </svg>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
});

export default VenueMapSVG;
