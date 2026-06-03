import React, { memo, useRef, useState, useCallback, useEffect } from 'react';

const SEAT_R = 10.5; // Slightly larger for better mobile/desktop click targets

const SEAT_COLORS = {
  normal:     { base: '#2a2a2a', stroke: '#555',    hover: '#3f3f46', busy: '#450a0a', busyStroke: '#7f1d1d' },
  vip:        { base: '#2a2a2a', stroke: '#ffffff', hover: '#3f3f46', busy: '#450a0a', busyStroke: '#7f1d1d' },
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
  if (isSelected)  { fill = '#3B82F6'; stroke = '#60a5fa'; strokeW = 2.5; } // Premium Blue accent for selected
  if (isWinner)    { fill = '#22c55e'; stroke = '#4ade80'; strokeW = 2.5; }
  if (hovered && !isBusy && !isSelected) { fill = colors.hover; }

  return (
    <g>
      <circle
        cx={seat.x} cy={seat.y} r={SEAT_R}
        fill={fill} stroke={stroke} strokeWidth={strokeW}
        style={{
          cursor: isBusy ? 'not-allowed' : 'pointer',
          transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          transformBox: 'fill-box',
          transformOrigin: 'center',
          transform: hovered && !isBusy ? 'scale(1.3)' : 'scale(1)',
          filter: hovered && !isBusy ? 'drop-shadow(0 0 6px rgba(255,255,255,0.45))' : 'none'
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => !isBusy && onToggle && onToggle(seat.id)}
      />
      {seat.type && seat.type !== 'normal' && (
        <text x={seat.x} y={seat.y + 3.5} textAnchor="middle" fontSize={7}
          fill={isSelected ? '#fff' : stroke}
          style={{ pointerEvents: 'none', userSelect: 'none', fontWeight: 900 }}
        >
          <tspan>{TYPE_ICON[seat.type] || ''}</tspan>
        </text>
      )}
      {/* Seat number label below */}
      <text x={seat.x} y={seat.y + SEAT_R + 11} textAnchor="middle"
        fontSize={8} fill="#ffffff" fontWeight={800}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s ease',
          visibility: hovered ? 'visible' : 'hidden'
        }}
      >
        <tspan>{`${seat.rowLabel}${seat.number}`}</tspan>
      </text>
    </g>
  );
}

/**
 * VenueMapSVG — Generic viewer/selector for the seat map.
 * Fully responsive, with smooth auto-focusing on selected sections, 
 * sleek floating glass zoom/pan controls, and tactile animations.
 */
const VenueMapSVG = memo(({
  mapData = [],
  busySeats = [],
  selectedSeats = [],
  onSeatToggle,
  readOnly = false,
  height = '100%',
  selectedSection = null
}) => {
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);

  // Helper to fit entire map
  const resetZoom = useCallback(() => {
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
    const zoom = Math.min(rect.width / mapW, rect.height / mapH, 1.8);
    setViewBox({ x: minX - (rect.width / zoom - mapW) / 2, y: minY - (rect.height / zoom - mapH) / 2, zoom });
  }, [mapData]);

  // Auto-fit on mount
  useEffect(() => {
    resetZoom();
  }, [mapData, resetZoom]);

  // Auto-focus on selectedSection change
  useEffect(() => {
    if (!selectedSection || !mapData.length || !svgRef.current) return;

    // Find component that matches selectedSection by ID or Name
    const comp = mapData.find(c => 
      String(c.id) === String(selectedSection.id) || 
      c.name?.toLowerCase() === selectedSection.name?.toLowerCase()
    );

    if (!comp) return;

    // Gather coordinates for this section
    const allX = [], allY = [];
    if (comp.type === 'seats') {
      comp.blocks?.forEach(b => b.seats.forEach(s => { allX.push(s.x); allY.push(s.y); }));
    } else {
      allX.push(comp.x, comp.x + (comp.width || 120));
      allY.push(comp.y, comp.y + (comp.height || 40));
    }

    if (!allX.length) return;

    const minX = Math.min(...allX) - 40;
    const minY = Math.min(...allY) - 40;
    const maxX = Math.max(...allX) + 40;
    const maxY = Math.max(...allY) + 40;
    const compW = maxX - minX;
    const compH = maxY - minY;

    const rect = svgRef.current.getBoundingClientRect();
    
    // Zoom closer to show individual seats clearly
    const zoom = Math.min(rect.width / compW, rect.height / compH, 2.2);

    setViewBox({
      x: minX - (rect.width / zoom - compW) / 2,
      y: minY - (rect.height / zoom - compH) / 2,
      zoom
    });
  }, [selectedSection, mapData]);

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
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const { x: cx, y: cy } = svgToCanvas(e.clientX, e.clientY);
    setViewBox(prev => {
      const newZoom = Math.max(0.25, Math.min(5.5, prev.zoom + delta));
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

  const zoomIn = () => {
    setViewBox(prev => {
      const newZoom = Math.min(5.5, prev.zoom + 0.25);
      return { ...prev, zoom: newZoom };
    });
  };

  const zoomOut = () => {
    setViewBox(prev => {
      const newZoom = Math.max(0.25, prev.zoom - 0.25);
      return { ...prev, zoom: newZoom };
    });
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
    <div style={{ width: '100%', height, position: 'relative', background: '#080808', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      
      {/* Floating Interactive Controls */}
      <div style={{
        position: 'absolute',
        top: 15,
        right: 15,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 50
      }}>
        <button
          type="button"
          onClick={zoomIn}
          style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'rgba(20, 20, 20, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20, 20, 20, 0.85)'; e.currentTarget.style.color = '#fff'; }}
          title="Acercar (+)"
        >
          ＋
        </button>
        <button
          type="button"
          onClick={zoomOut}
          style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'rgba(20, 20, 20, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20, 20, 20, 0.85)'; e.currentTarget.style.color = '#fff'; }}
          title="Alejar (-)"
        >
          －
        </button>
        <button
          type="button"
          onClick={resetZoom}
          style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'rgba(20, 20, 20, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20, 20, 20, 0.85)'; e.currentTarget.style.color = '#fff'; }}
          title="Restaurar Vista"
        >
          ⟲
        </button>
        
        {/* Zoom Indicator */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '4px 6px',
          borderRadius: '8px',
          fontSize: '9px',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 800,
          border: '1px solid rgba(255,255,255,0.08)',
          letterSpacing: '0.5px'
        }}>
          {Math.round(viewBox.zoom * 100)}%
        </div>
      </div>

      {/* Floating Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 15,
        left: 15,
        background: 'rgba(10, 10, 10, 0.75)',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.5)',
        pointerEvents: 'none',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontWeight: '700',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>🖱 Arrastra para mover</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>🎡 Rueda para zoom</span>
      </div>

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
        <g 
          transform={`scale(${viewBox.zoom}) translate(${-viewBox.x}, ${-viewBox.y})`}
          style={{
            transition: isPanning ? 'none' : 'transform 0.45s cubic-bezier(0.2, 0.9, 0.1, 1)'
          }}
        >
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
                          fontSize={8} fill="rgba(255,255,255,0.3)"
                          fontWeight={800} textAnchor="middle" fontFamily="monospace"
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

            // Non-seat element (like Stage, Screen, etc.)
            return (
              <g key={comp.id} transform={`rotate(${comp.rotation || 0}, ${cx}, ${cy})`}>
                <rect
                  x={comp.x} y={comp.y} width={comp.width || 120} height={comp.height || 40}
                  rx={8} 
                  fill={comp.color || '#1e293b'} 
                  stroke="rgba(255,255,255,0.12)" 
                  strokeWidth={1.5}
                  style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}
                />
                <text
                  x={cx} y={cy + 4}
                  textAnchor="middle" fontSize={11} fontWeight={900}
                  fill="#ffffff" fontFamily="Inter, sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none', letterSpacing: '0.5px' }}
                >
                  <tspan>{ELEM_LABELS[comp.type] || comp.name}</tspan>
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
});

export default VenueMapSVG;
