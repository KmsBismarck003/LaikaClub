import React from 'react';
import MapSeat from './MapSeat';

/**
 * MapZone — Renderiza una zona del mapa SVG con todos sus asientos.
 * NOTA: Los elementos <text> SVG NUNCA se deben renderizar condicionalmente
 * usando &&/ternarios dentro del SVG — React pierde la sincronización con el DOM SVG.
 * En su lugar, se controla visibilidad con opacity/display dentro del elemento.
 */
const MapZone = ({ 
    zone, 
    isSelected, 
    isEditMode, 
    editSubMode, 
    activeScannerZoneId, 
    activeScannerSeatId,
    busySeats,
    selectedSeats,
    rouletteActive,
    winnerSeatId,
    getPathData,
    handleMouseDownZone,
    handleMouseDownText,
    handleMouseDownPoint,
    handleMouseDownRotate,
    handleMouseDownTextRotate,
    handleMouseDownCurve,
    handleSplitEdge,
    onZoneSelect,
    onSeatToggle,
    setHoveredSeat,
    setPersistentSeatInfo,
    isAdminView
}) => {
    if (!zone.points || zone.points.length === 0) return null;

    const isStage = zone.type === 'stage';
    const isScanningZone = activeScannerZoneId === zone.id;
    const isScanningSeat = activeScannerSeatId?.startsWith(zone.id);
    const isScanning = isScanningSeat || isScanningZone;
    
    const pathData = getPathData(zone.points, zone.curveAmounts);
    
    const centerX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
    const centerY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;
    const topY = Math.min(...zone.points.map(p => p.y));
    const tX = centerX + (zone.textPos?.x || 0);
    const tY = centerY + (zone.textPos?.y || 0);

    const themedColor = zone.color || (() => {
        const price = typeof zone.price === 'string' ? parseFloat(zone.price.replace(/[^0-9.]/g,'')) : (zone.price || 0);
        const name = (zone.name || '').toUpperCase();
        if (price >= 2500 || name.includes('PLATIN')) return '#E5E4E2';
        if (price >= 1500 || name.includes('ORO') || name.includes('GOLD')) return '#EAB308';
        if (price >= 500 || name.includes('PLATA') || name.includes('SILVER')) return '#94A3B8';
        return '#CD7F32';
    })();
    const hasCustomColor = !!(zone.tier || zone.color);

    // ── Path styling ─────────────────────────────────────────────────
    let fillPath, strokePath, strokeWidthPath;
    if (isStage) {
        fillPath = 'url(#stageGradient)';
        strokePath = '#666';
        strokeWidthPath = 2;
    } else if (zone.type === 'seating') {
        if (isSelected) {
            fillPath = hasCustomColor ? `${themedColor}40` : 'rgba(255,255,255,0.15)';
            strokePath = hasCustomColor ? themedColor : '#ffffff';
            strokeWidthPath = 2;
        } else if (isAdminView) {
            fillPath = 'rgba(20,20,20,0.4)';
            strokePath = 'rgba(255,255,255,0.15)';
            strokeWidthPath = 1;
        } else if (isScanning) {
            fillPath = `${themedColor}66`;
            strokePath = themedColor;
            strokeWidthPath = 2;
        } else {
            fillPath = hasCustomColor ? `${themedColor}33` : 'rgba(40,40,40,0.9)';
            strokePath = hasCustomColor ? themedColor : 'rgba(255,255,255,0.2)';
            strokeWidthPath = hasCustomColor ? 2 : 1;
        }
    } else {
        fillPath = 'rgba(30,30,30,0.8)';
        strokePath = 'rgba(255,255,255,0.15)';
        strokeWidthPath = 1;
    }

    // ── Busy seat check ───────────────────────────────────────────────
    const isSeatBusy = (seatId) => {
        if (!Array.isArray(busySeats)) return false;
        return busySeats.some(s => (typeof s === 'string' ? s === seatId : s?.id === seatId || s?.seat_id === seatId));
    };

    // ── Seat rendering ────────────────────────────────────────────────
    const renderSeats = () => {
        // Usar asientos reales del constructor si existen
        if (zone.blocks && zone.blocks.length > 0) {
            return zone.blocks.flatMap((block, bi) =>
                (block.seats || []).map((seat, si) => {
                    const seatId = seat.id || seat.frontend_id || `${zone.id}-b${bi}-s${si}`;
                    const seatLabel = `${seat.row_label || ''}${seat.seat_number || ''}`;
                    const busy = isSeatBusy(seatId) || isSeatBusy(seat.backend_id);
                    return (
                        <MapSeat 
                            key={`seat-${seatId}`}
                            seatId={seatId}
                            seatLabel={seatLabel}
                            x={seat.x_pos ?? seat.x ?? 0}
                            y={seat.y_pos ?? seat.y ?? 0}
                            status={busy ? 'occupied' : (seat.is_active === false ? 'reserved' : 'available')}
                            zone={zone}
                            isSelected={selectedSeats.includes(seatId)}
                            isBusy={busy}
                            isScanning={activeScannerSeatId === seatId}
                            isWinner={winnerSeatId === seatId}
                            rouletteActive={rouletteActive}
                            onSeatToggle={onSeatToggle}
                            onHover={(info) => setHoveredSeat?.(info)}
                            onLeave={() => setHoveredSeat?.(null)}
                            setPersistentSeatInfo={setPersistentSeatInfo}
                        />
                    );
                })
            );
        }

        // Fallback: grilla automática
        const minX = Math.min(...zone.points.map(p => p.x));
        const maxX = Math.max(...zone.points.map(p => p.x));
        const minY = Math.min(...zone.points.map(p => p.y));
        const maxY = Math.max(...zone.points.map(p => p.y));
        const width = Math.max(maxX - minX, 1);
        const height = Math.max(maxY - minY, 1);
        const totalSeats = zone.count || 100;
        const aspect = width / height;
        const rows = Math.max(Math.floor(Math.sqrt(totalSeats / aspect) * 1.3), 1);
        const cols = Math.ceil((totalSeats / rows) * 1.3);

        const seats = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const seatId = `${zone.id}-${r}-${c}`;
                const busy = isSeatBusy(seatId);
                seats.push(
                    <MapSeat 
                        key={`seat-${seatId}`}
                        seatId={seatId}
                        seatLabel={`${String.fromCharCode(65 + r)}${c + 1}`}
                        x={minX + (c + 0.5) * (width / cols)}
                        y={minY + (r + 0.5) * (height / rows)}
                        status={busy ? 'occupied' : 'available'}
                        zone={zone}
                        isSelected={selectedSeats.includes(seatId)}
                        isBusy={busy}
                        isScanning={activeScannerSeatId === seatId}
                        isWinner={winnerSeatId === seatId}
                        rouletteActive={rouletteActive}
                        onSeatToggle={onSeatToggle}
                        onHover={(info) => setHoveredSeat?.(info)}
                        onLeave={() => setHoveredSeat?.(null)}
                        setPersistentSeatInfo={setPersistentSeatInfo}
                    />
                );
            }
        }
        return seats;
    };

    const showSeats = zone.type === 'seating' && (isSelected || isScanning || isAdminView);
    // Texto de zona visible solo cuando NO muestra asientos (a menos que sea admin)
    const showZoneLabel = zone.type === 'seating' && !isScanning && !isAdminView && (!isSelected || isEditMode);
    const showPriceLabel = zone.type === 'seating' && isSelected && !isEditMode && zone.price;

    return (
        <g>
            {/* ── Área principal de la zona ─────────────────── */}
            <path 
                d={pathData}
                fill={fillPath}
                stroke={strokePath}
                strokeWidth={strokeWidthPath}
                className={isSelected ? 'marching-ants' : ''}
                onMouseDown={isEditMode && editSubMode === 'move' ? handleMouseDownZone(zone.id) : undefined}
                onClick={() => {
                    if (isEditMode) {
                        onZoneSelect?.(zone.id);
                    } else if (!rouletteActive && zone.type === 'seating') {
                        onZoneSelect?.(zone.id);
                    }
                }}
                style={{ 
                    cursor: zone.type === 'seating' ? (isEditMode ? 'crosshair' : 'pointer') : 'default', 
                    transition: 'fill 0.2s, stroke 0.2s',
                    filter: (isSelected || isScanning) 
                        ? `drop-shadow(0 0 20px ${isScanning ? themedColor : 'rgba(255,255,255,0.3)'})` 
                        : 'none'
                }} 
            />

            {/* ── Texto ESCENARIO ───────────────────────────── */}
            {isStage && (
                <text 
                    key={`text-stage-${zone.id}`}
                    x={tX} y={tY}
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    fill="#000"
                    transform={`rotate(${zone.textAngle ?? -90}, ${tX}, ${tY})`}
                    onMouseDown={isEditMode && editSubMode === 'text' ? handleMouseDownText(zone.id) : undefined}
                    style={{ 
                        fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', 
                        letterSpacing: '0.5em', opacity: 0.5,
                        pointerEvents: isEditMode && editSubMode === 'text' ? 'auto' : 'none',
                    }}
                >
                    ESCENARIO
                </text>
            )}

            {/* ── Nombre de la zona ─────────────────────────── */}
            {/* IMPORTANTE: usar visibilidad en lugar de renderizado condicional para evitar removeChild */}
            {zone.type === 'seating' && (
                <text 
                    key={`text-name-${zone.id}`}
                    x={tX} y={tY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    transform={`rotate(${zone.textAngle || 0}, ${tX}, ${tY})`}
                    onMouseDown={isEditMode ? handleMouseDownText(zone.id) : undefined}
                    style={{ 
                        fontSize: '14px', fontWeight: 950, textTransform: 'uppercase',
                        pointerEvents: isEditMode ? 'auto' : 'none',
                        cursor: isEditMode ? 'move' : 'default',
                        opacity: showZoneLabel ? 0.8 : 0,
                        filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))',
                        transition: 'opacity 0.2s',
                        userSelect: 'none',
                    }}
                >
                    {zone.name}
                </text>
            )}

            {/* ── Precio de la zona (cuando está seleccionada) ── */}
            {zone.type === 'seating' && (
                <text
                    key={`text-price-${zone.id}`}
                    x={tX} y={tY + 18}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.6)"
                    style={{
                        fontSize: '10px', fontWeight: 700,
                        pointerEvents: 'none',
                        opacity: showPriceLabel ? 1 : 0,
                        transition: 'opacity 0.2s',
                        userSelect: 'none',
                    }}
                >
                    {typeof zone.price === 'number' ? `$${zone.price}` : (zone.price || '')}
                </text>
            )}

            {/* ── Asientos con clipPath ─────────────────────── */}
            {showSeats && (
                <g key={`seats-group-${zone.id}`}>
                    <defs>
                        <clipPath id={`mask-${zone.id}`}>
                            <path d={pathData} />
                        </clipPath>
                    </defs>
                    <g 
                        clipPath={`url(#mask-${zone.id})`} 
                        onMouseDown={isEditMode && editSubMode === 'move' ? handleMouseDownZone(zone.id) : undefined}
                    >
                        {renderSeats()}
                    </g>
                </g>
            )}

            {/* ── Controles de edición: Puntos ─────────────── */}
            {isEditMode && isSelected && editSubMode === 'points' && (
                <g key={`edit-points-${zone.id}`}>
                    {zone.points.map((p, idx) => (
                        <circle 
                            key={`pt-${zone.id}-${idx}`}
                            cx={p.x} cy={p.y} r={5} 
                            fill="#ff3333" stroke="#fff" strokeWidth={1.5}
                            onMouseDown={handleMouseDownPoint(zone.id, idx)} 
                            style={{ cursor: 'nwse-resize' }} 
                        />
                    ))}
                    <line x1={centerX} y1={topY} x2={centerX} y2={topY - 30} stroke="#ff3333" strokeWidth={2} />
                    <circle 
                        cx={centerX} cy={topY - 35} r={10} 
                        fill="#ff3333" stroke="#fff" strokeWidth={2} 
                        onMouseDown={handleMouseDownRotate(zone.id)} 
                        style={{ cursor: 'alias' }} 
                    />
                </g>
            )}

            {/* ── Controles de edición: Texto ──────────────── */}
            {isEditMode && isSelected && editSubMode === 'text' && (
                <g key={`edit-text-${zone.id}`}>
                    <line x1={tX} y1={tY} x2={tX} y2={tY - 25} stroke="#0ea5e9" strokeWidth={1.5} />
                    <circle cx={tX} cy={tY - 30} r={8} fill="#0ea5e9" stroke="#fff" strokeWidth={2} 
                        onMouseDown={handleMouseDownTextRotate(zone.id)} style={{ cursor: 'alias' }} />
                    <circle cx={tX} cy={tY} r={6} fill="#0ea5e9" stroke="#fff" strokeWidth={1.5} 
                        onMouseDown={handleMouseDownText(zone.id)} style={{ cursor: 'move' }} />
                </g>
            )}

            {/* ── Controles de edición: Curvas ─────────────── */}
            {isEditMode && isSelected && editSubMode === 'curves' && (
                <g key={`edit-curves-${zone.id}`}>
                    {(() => {
                        const curvs = zone.curveAmounts || Array(zone.points.length).fill(0);
                        return zone.points.map((_, edgeIdx) => {
                            const p1 = zone.points[edgeIdx];
                            const p2 = zone.points[(edgeIdx + 1) % zone.points.length];
                            const midX = (p1.x + p2.x) / 2;
                            const midY = (p1.y + p2.y) / 2;
                            const dx = p2.x - p1.x;
                            const dy = p2.y - p1.y;
                            const len = Math.sqrt(dx*dx + dy*dy) || 1;
                            const c = { 
                                x: midX + (-dy / len) * (curvs[edgeIdx] || 0), 
                                y: midY + (dx / len) * (curvs[edgeIdx] || 0) 
                            };
                            return (
                                <g key={`curve-ctrl-${zone.id}-${edgeIdx}`}>
                                    <circle cx={c.x} cy={c.y} r={5} fill="#8b5cf6" stroke="#fff" strokeWidth={1} 
                                        onMouseDown={handleMouseDownCurve(zone.id, edgeIdx)} style={{ cursor: 'pointer' }} />
                                    <circle cx={c.x + 10} cy={c.y - 10} r={4} fill="#22c55e" stroke="#fff" strokeWidth={1} 
                                        onClick={handleSplitEdge(zone.id, edgeIdx)} style={{ cursor: 'pointer' }} />
                                </g>
                            );
                        });
                    })()}
                </g>
            )}
        </g>
    );
};

export default MapZone;
