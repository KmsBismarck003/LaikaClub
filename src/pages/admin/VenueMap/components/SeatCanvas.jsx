import React, { useRef, useState, useCallback, useEffect } from 'react';

const SEAT_R = 9;
const SEAT_COLORS = {
  normal:     { fill: '#2a2a2a', stroke: '#555' },
  vip:        { fill: '#1a1a2e', stroke: '#9333ea' },
  accessible: { fill: '#0f2027', stroke: '#06b6d4' },
};
const TYPE_ICONS = { normal: '', vip: '★', accessible: '♿' };

function getSeatColor(seat, isSelected, isOccupied) {
  if (isSelected) return { fill: '#eab308', stroke: '#fbbf24' };
  if (isOccupied)  return { fill: '#450a0a', stroke: '#7f1d1d' };
  return SEAT_COLORS[seat.type] || SEAT_COLORS.normal;
}

// ── Render one seat block component ──
function SeatsComp({ comp, selectedSeats, onToggleSeat, onSelectBlock, onSelectComp, isSelected }) {
  const allSeatIds = comp.blocks?.flatMap(b => b.seats.map(s => s.id)) || [];

  return (
    <g
      transform={`rotate(${comp.rotation || 0}, ${comp.x + comp.width / 2}, ${comp.y + comp.height / 2})`}
      onClick={(e) => { e.stopPropagation(); onSelectComp(comp.id); }}
    >
      {/* Selection outline */}
      {isSelected && (
        <rect
          x={comp.x - 6} y={comp.y - 6}
          width={comp.width + 12} height={comp.height + 12}
          rx={8} fill="none" stroke="#eab308" strokeWidth={1.5}
          strokeDasharray="5 3" style={{ animation: 'marchingAnts 0.5s linear infinite' }}
        />
      )}

      {/* Row label + seats */}
      {comp.blocks?.map(block => (
        <g key={block.id}>
          {/* Row label */}
          <text
            x={block.seats[0]?.x - 16}
            y={block.seats[0]?.y + SEAT_R / 2}
            fontSize={8} fill="rgba(255,255,255,0.3)" fontWeight={700}
            textAnchor="middle" fontFamily="monospace"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <tspan>{block.rowLabel}</tspan>
          </text>

          {block.seats.map(seat => {
            const isSel = selectedSeats.includes(seat.id);
            const colors = getSeatColor(seat, isSel, false);
            return (
              <g key={seat.id}>
                <circle
                  cx={seat.x} cy={seat.y} r={SEAT_R}
                  fill={colors.fill} stroke={colors.stroke} strokeWidth={isSel ? 2 : 1}
                  style={{ cursor: 'pointer', transition: 'fill 0.1s' }}
                  onClick={(e) => { e.stopPropagation(); onToggleSeat(seat.id); }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onSelectBlock(block.seats.map(s => s.id));
                  }}
                />
                {seat.type !== 'normal' && (
                  <text
                    x={seat.x} y={seat.y + 3}
                    fontSize={7} textAnchor="middle"
                    fill={colors.stroke}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    <tspan>{TYPE_ICONS[seat.type]}</tspan>
                  </text>
                )}
                {/* Seat number */}
                <text
                  x={seat.x} y={seat.y + SEAT_R + 9}
                  fontSize={6} textAnchor="middle"
                  fill="rgba(255,255,255,0.2)"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  <tspan>{seat.number}</tspan>
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
}

// ── Render non-seat element ──
function ElementComp({ comp, isSelected, onSelectComp }) {
  const TYPE_LABELS = { stage: '🎸 ESCENARIO', screen: '🖥 PANTALLA', aisle: 'PASILLO', ga: 'GENERAL' };
  const cx = comp.x + comp.width / 2;
  const cy = comp.y + comp.height / 2;

  return (
    <g
      transform={`rotate(${comp.rotation || 0}, ${cx}, ${cy})`}
      onClick={e => { e.stopPropagation(); onSelectComp(comp.id); }}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={comp.x} y={comp.y} width={comp.width} height={comp.height}
        rx={6} fill={comp.color || '#334155'}
        stroke={isSelected ? '#eab308' : 'rgba(255,255,255,0.1)'}
        strokeWidth={isSelected ? 2 : 1}
      />
      <text
        x={cx} y={cy + 4}
        textAnchor="middle" fontSize={10} fontWeight={800}
        fill="rgba(255,255,255,0.7)" fontFamily="Inter,sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <tspan>{TYPE_LABELS[comp.type] || comp.name}</tspan>
      </text>
    </g>
  );
}

// ── Main Canvas ──────────────────────────────────────────────
const SeatCanvas = ({
  components, selectedId, selectedSeats, activeTool,
  viewBox, setViewBox,
  onCanvasClick, onSelectComponent, onMoveComponent,
  onToggleSeat, onSelectBlock,
}) => {
  const svgRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const panStart = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [ghostPos, setGhostPos] = useState(null); // cursor position in canvas coords

  const svgToCanvas = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    return {
      x: (px / viewBox.zoom) + viewBox.x,
      y: (py / viewBox.zoom) + viewBox.y,
    };
  }, [viewBox]);

  // Wheel → zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const { x: cx, y: cy } = svgToCanvas(e.clientX, e.clientY);
    setViewBox(prev => {
      const newZoom = Math.max(0.3, Math.min(4, prev.zoom + delta));
      const scale = newZoom / prev.zoom;
      return {
        zoom: newZoom,
        x: cx - (cx - prev.x) * scale,
        y: cy - (cy - prev.y) * scale,
      };
    });
  }, [svgToCanvas, setViewBox]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    // Middle-button or space → pan (handled via button=1 or e.altKey)
    if (e.altKey || activeTool === 'pan') {
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, vx: viewBox.x, vy: viewBox.y };
      return;
    }
    dragStart.current = { mx: e.clientX, my: e.clientY, moved: false };
  };

  const handleMouseMove = (e) => {
    if (isPanning && panStart.current) {
      const dx = (e.clientX - panStart.current.mx) / viewBox.zoom;
      const dy = (e.clientY - panStart.current.my) / viewBox.zoom;
      setViewBox(prev => ({ ...prev, x: panStart.current.vx - dx, y: panStart.current.vy - dy }));
      return;
    }
    // Show ghost cursor position
    if (activeTool !== 'select') {
      setGhostPos(svgToCanvas(e.clientX, e.clientY));
    } else {
      setGhostPos(null);
    }
  };

  const handleMouseUp = (e) => {
    if (isPanning) { setIsPanning(false); panStart.current = null; return; }
    if (dragStart.current && !dragStart.current.moved) {
      // click on canvas
      const pos = svgToCanvas(e.clientX, e.clientY);
      onCanvasClick(Math.round(pos.x), Math.round(pos.y));
    }
    dragStart.current = null;
  };

  // Drag a component
  const handleCompMouseDown = (e, compId) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    onSelectComponent(compId);
    const startPos = svgToCanvas(e.clientX, e.clientY);
    let lastPos = startPos;
    let hasMoved = false;

    const onMove = (ev) => {
      const cur = svgToCanvas(ev.clientX, ev.clientY);
      const dx = cur.x - lastPos.x;
      const dy = cur.y - lastPos.y;
      if (!hasMoved && Math.abs(dx) + Math.abs(dy) < 2) return;
      hasMoved = true;
      onMoveComponent(compId, dx, dy);
      lastPos = cur;
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const transform = `scale(${viewBox.zoom}) translate(${-viewBox.x}, ${-viewBox.y})`;

  const CURSOR_MAP = {
    select: 'default',
    'add-seats': 'crosshair',
    'add-stage': 'crosshair',
    'add-screen': 'crosshair',
    'add-aisle': 'crosshair',
    'add-ga': 'crosshair',
  };

  return (
    <svg
      ref={svgRef}
      className="avm-svg"
      style={{ cursor: isPanning ? 'grabbing' : (CURSOR_MAP[activeTool] || 'default') }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { setIsPanning(false); setGhostPos(null); }}
      onClick={e => { if (e.target === svgRef.current) onSelectComponent(null); }}
    >
      <defs>
        <style>{`
          @keyframes marchingAnts { from { stroke-dashoffset: 8; } to { stroke-dashoffset: 0; } }
        `}</style>
        <pattern id="canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="rgba(255, 255, 255, 0.15)" />
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="0.5" />
        </pattern>
      </defs>

      <g transform={transform}>
        {/* Workspace Bounding Box representing the Room limits */}
        <rect
          x={0}
          y={0}
          width={2000}
          height={1500}
          fill="#111114"
          rx={16}
          style={{ pointerEvents: 'none' }}
        />
        <rect
          x={0}
          y={0}
          width={2000}
          height={1500}
          fill="url(#canvas-grid)"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={1.5}
          rx={16}
          style={{ pointerEvents: 'none' }}
        />

        {/* Dashed center guidelines */}
        <line x1={0} y1={750} x2={2000} y2={750} stroke="rgba(255, 255, 255, 0.03)" strokeWidth={1} strokeDasharray="6 4" style={{ pointerEvents: 'none' }} />
        <line x1={1000} y1={0} x2={1000} y2={1500} stroke="rgba(255, 255, 255, 0.03)" strokeWidth={1} strokeDasharray="6 4" style={{ pointerEvents: 'none' }} />

        <text
          x={1000}
          y={740}
          fontSize={8}
          fontWeight={700}
          fill="rgba(255,255,255,0.08)"
          fontFamily="monospace"
          textAnchor="middle"
          letterSpacing="0.1em"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          LÍNEA CENTRAL
        </text>

        <text
          x={20}
          y={35}
          fontSize={11}
          fontWeight={800}
          fill="rgba(255,255,255,0.15)"
          fontFamily="Inter, sans-serif"
          letterSpacing="0.08em"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          ÁREA DE TRABAJO DE LA SALA (2000 x 1500 px)
        </text>

        {/* Render components */}
        {components.map(comp => {
          const isSelected = comp.id === selectedId;
          if (comp.type === 'seats') {
            return (
              <g key={comp.id} onMouseDown={e => handleCompMouseDown(e, comp.id)}>
                <SeatsComp
                  comp={comp}
                  selectedSeats={selectedSeats}
                  isSelected={isSelected}
                  onToggleSeat={onToggleSeat}
                  onSelectBlock={onSelectBlock}
                  onSelectComp={onSelectComponent}
                />
              </g>
            );
          }
          return (
            <g key={comp.id} onMouseDown={e => handleCompMouseDown(e, comp.id)}>
              <ElementComp comp={comp} isSelected={isSelected} onSelectComp={onSelectComponent} />
            </g>
          );
        })}

        {/* Ghost cursor for tool placement */}
        {ghostPos && activeTool === 'add-seats' && (
          <circle cx={ghostPos.x} cy={ghostPos.y} r={SEAT_R}
            fill="rgba(234,179,8,0.2)" stroke="#eab308" strokeWidth={1.5}
            strokeDasharray="3 2" style={{ pointerEvents: 'none' }}
          />
        )}
        {ghostPos && activeTool === 'add-stage' && (
          <rect x={ghostPos.x - 80} y={ghostPos.y - 25} width={160} height={50} rx={6}
            fill="rgba(51,65,85,0.3)" stroke="#eab308" strokeWidth={1.5} strokeDasharray="4 2"
            style={{ pointerEvents: 'none' }}
          />
        )}
        {ghostPos && activeTool === 'add-screen' && (
          <rect x={ghostPos.x - 90} y={ghostPos.y - 10} width={180} height={20} rx={4}
            fill="rgba(30,58,95,0.3)" stroke="#eab308" strokeWidth={1.5} strokeDasharray="4 2"
            style={{ pointerEvents: 'none' }}
          />
        )}
        {ghostPos && activeTool === 'add-aisle' && (
          <rect x={ghostPos.x - 60} y={ghostPos.y - 15} width={120} height={30} rx={4}
            fill="rgba(28,28,28,0.4)" stroke="#eab308" strokeWidth={1.5} strokeDasharray="4 2"
            style={{ pointerEvents: 'none' }}
          />
        )}
        {ghostPos && activeTool === 'add-ga' && (
          <rect x={ghostPos.x - 70} y={ghostPos.y - 40} width={140} height={80} rx={6}
            fill="rgba(20,83,45,0.3)" stroke="#eab308" strokeWidth={1.5} strokeDasharray="4 2"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </g>
    </svg>
  );
};

export default SeatCanvas;
