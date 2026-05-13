import React from 'react';
import MapSeat from './MapSeat';

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
    isAdminView // NUEVA PROP
}) => {
    if (!zone.points || zone.points.length === 0) return null;

    const isStage = zone.type === 'stage';
    const isScanningSeat = activeScannerSeatId?.split('-')[0] === zone.id;
    const isScanningZone = activeScannerZoneId === zone.id;
    const isScanning = isScanningSeat || isScanningZone;
    
    const pathData = getPathData(zone.points, zone.curveAmounts);
    
    const centerX = zone.points.reduce((sum, p) => sum + p.x, 0) / zone.points.length;
    const centerY = zone.points.reduce((sum, p) => sum + p.y, 0) / zone.points.length;
    const topY = Math.min(...zone.points.map(p => p.y));

    // THEMED COLORS FOR SCANNER
    const getGetThemedColor = (z) => {
        if (z.color) return z.color;
        const name = (z.name || '').toUpperCase();
        if (z.price >= 2500 || name.includes('PLATIN')) return '#ffffff';
        if (z.price >= 1500 || name.includes('ORO') || name.includes('GOLD')) return '#EAB308';
        if (z.price >= 500 || name.includes('PLATA') || name.includes('SILVER')) return '#94A3B8';
        return '#CD7F32';
    };

    const themedColor = getGetThemedColor(zone);
    const hasCustomColor = !!(zone.tier || zone.color);

    return (
        <g>
            <path 
                d={pathData}
                fill={isStage ? 'url(#stageGradient)' : (zone.type === 'seating' ? (isSelected ? (hasCustomColor ? `${themedColor}40` : 'rgba(255, 255, 255, 0.15)') : (isAdminView ? 'rgba(20, 20, 20, 0.4)' : (isScanning ? `${themedColor}66` : (hasCustomColor ? `${themedColor}33` : 'rgba(40, 40, 40, 0.9)')))) : 'rgba(30, 30, 30, 0.8)')}
                stroke={isSelected ? (hasCustomColor ? themedColor : '#ffffff') : (isAdminView ? 'rgba(255, 255, 255, 0.15)' : (isScanning ? themedColor : (isStage ? '#666' : (hasCustomColor ? themedColor : 'rgba(255, 255, 255, 0.2)'))))}
                strokeWidth={isSelected ? 2 : (isAdminView ? 1 : (isScanning || hasCustomColor ? 2 : (isStage ? 2 : 1)))}
                className={isSelected ? 'marching-ants' : (isAdminView ? 'static-dashed' : '')}
                onMouseDown={isEditMode && editSubMode === 'move' ? handleMouseDownZone(zone.id) : undefined}
                onClick={(e) => {
                    if (isEditMode) {
                        onZoneSelect && onZoneSelect(zone.id);
                    } else if (!rouletteActive && zone.type === 'seating' && onZoneSelect) {
                        onZoneSelect(zone.id);
                    }
                }}
                style={{ 
                    cursor: zone.type === 'seating' ? (isEditMode ? 'crosshair' : 'pointer') : 'default', 
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    filter: (isSelected || isScanning) ? `drop-shadow(0 0 25px ${isScanning ? themedColor : 'rgba(255,255,255,0.3)'})` : 'none'
                }} 
            />

            {isStage && (
                <text 
                    x={centerX + (zone.textPos?.x || 0)} 
                    y={centerY + (zone.textPos?.y || 0)} 
                    textAnchor="middle" 
                    alignmentBaseline="middle" 
                    fill="#000" 
                    transform={`rotate(${zone.textAngle !== undefined ? zone.textAngle : -90}, ${centerX + (zone.textPos?.x || 0)}, ${centerY + (zone.textPos?.y || 0)})`}
                    onMouseDown={isEditMode && editSubMode === 'text' ? handleMouseDownText(zone.id) : undefined}
                    style={{ 
                        fontSize: '22px', 
                        fontWeight: 900, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5em', 
                        opacity: 0.5, 
                        pointerEvents: isEditMode && editSubMode === 'text' ? 'auto' : 'none',
                        cursor: isEditMode && editSubMode === 'text' ? 'move' : 'default'
                    }}
                >
                    ESCENARIO
                </text>
            )}

            {zone.type === 'seating' && (!isScanning && !isAdminView && (!isSelected || isEditMode)) && (
                <text 
                    x={centerX + (zone.textPos?.x || 0)} 
                    y={centerY + (zone.textPos?.y || 0)} 
                    textAnchor="middle" 
                    alignmentBaseline="middle" 
                    fill="#fff" 
                    transform={`rotate(${zone.textAngle || 0}, ${centerX + (zone.textPos?.x || 0)}, ${centerY + (zone.textPos?.y || 0)})`}
                    onMouseDown={isEditMode ? handleMouseDownText(zone.id) : undefined}
                    style={{ 
                        fontSize: '14px', 
                        fontWeight: 950, 
                        textTransform: 'uppercase', 
                        pointerEvents: isEditMode ? 'auto' : 'none',
                        cursor: isEditMode ? 'move' : 'none',
                        opacity: isSelected ? 1 : 0.8,
                        filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))'
                    }}
                >
                    {zone.name}
                </text>
            )}

            {zone.type === 'seating' && (isSelected || isScanning || isAdminView) && (
                <>
                    <defs>
                        <clipPath id={`mask-${zone.id}`}>
                            <path d={pathData} />
                        </clipPath>
                    </defs>
                    <g clipPath={`url(#mask-${zone.id})`} onMouseDown={isEditMode && editSubMode === 'move' ? handleMouseDownZone(zone.id) : undefined}>
                        {(() => {
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

                            return Array.from({ length: rows }).map((_, row) => 
                                Array.from({ length: cols }).map((_, col) => {
                                    const seatId = `${zone.id}-${row}-${col}`;
                                    // Búsqueda inteligente de ocupación (Soporta IDs planos o Objetos de Venta)
                                    const isBusy = Array.isArray(busySeats) && busySeats.some(s => (s.id === seatId || s === seatId));
                                    const x = minX + (col + 0.5) * (width / cols);
                                    const y = minY + (row + 0.5) * (height / rows);
                                    
                                    return (
                                        <MapSeat 
                                            key={seatId}
                                            seatId={seatId}
                                            x={x} y={y}
                                            status={isBusy ? 'occupied' : 'available'}
                                            zone={zone}
                                            isSelected={selectedSeats.includes(seatId)}
                                            isBusy={isBusy}
                                            isScanning={activeScannerSeatId === seatId}
                                            isWinner={winnerSeatId === seatId}
                                            rouletteActive={rouletteActive}
                                            onSeatToggle={onSeatToggle}
                                            onHover={(info) => setHoveredSeat && setHoveredSeat(info)}
                                            onLeave={() => setHoveredSeat && setHoveredSeat(null)}
                                            setPersistentSeatInfo={setPersistentSeatInfo}
                                        />
                                    );
                                })
                            ).flat();
                        })()}
                    </g>
                </>
            )}

            {isEditMode && isSelected && editSubMode === 'points' && (
                <g>
                    {zone.points.map((p, idx) => (
                        <circle 
                            key={`${zone.id}-p-${idx}`} 
                            cx={p.x} cy={p.y} r={5} 
                            fill="#ff0000" stroke="#fff" strokeWidth={1} 
                            onMouseDown={handleMouseDownPoint(zone.id, idx)} 
                            style={{ cursor: 'nwse-resize' }} 
                        />
                    ))}
                    <line x1={centerX} y1={topY} x2={centerX} y2={topY - 30} stroke="#ff0000" strokeWidth={2} />
                    <circle cx={centerX} cy={topY - 35} r={10} fill="#ff0000" stroke="#fff" strokeWidth={2} onMouseDown={handleMouseDownRotate(zone.id)} style={{ cursor: 'alias' }} />
                </g>
            )}

            {isEditMode && isSelected && editSubMode === 'text' && (
                <g>
                    {(() => {
                        const tX = centerX + (zone.textPos?.x || 0);
                        const tY = centerY + (zone.textPos?.y || 0);
                        return (
                            <g>
                                <line x1={tX} y1={tY} x2={tX} y2={tY - 25} stroke="#0ea5e9" strokeWidth={1.5} />
                                <circle cx={tX} cy={tY - 30} r={8} fill="#0ea5e9" stroke="#fff" strokeWidth={2} onMouseDown={handleMouseDownTextRotate(zone.id)} style={{ cursor: 'alias' }} />
                                <circle cx={tX} cy={tY} r={6} fill="#0ea5e9" stroke="#fff" strokeWidth={1.5} onMouseDown={handleMouseDownText(zone.id)} style={{ cursor: 'move' }} />
                            </g>
                        );
                    })()}
                </g>
            )}

            {isEditMode && isSelected && editSubMode === 'curves' && (
                <g>
                    {(() => {
                        const curvs = zone.curveAmounts || Array(zone.points.length).fill(0);
                        return Array.from({ length: zone.points.length }).map((_, edgeIdx) => {
                            const p1 = zone.points[edgeIdx];
                            const p2 = zone.points[(edgeIdx + 1) % zone.points.length];
                            // Logic to get control point repeated here for simplicity or moved to common utils
                            const midX = (p1.x + p2.x) / 2;
                            const midY = (p1.y + p2.y) / 2;
                            const dx = p2.x - p1.x;
                            const dy = p2.y - p1.y;
                            const len = Math.sqrt(dx*dx + dy*dy) || 1;
                            const nx = -dy / len; 
                            const ny = dx / len;
                            const c = { x: midX + nx * (curvs[edgeIdx] || 0), y: midY + ny * (curvs[edgeIdx] || 0) };

                            return (
                                <g key={`edge-ctrl-${edgeIdx}`}>
                                    <circle cx={c.x} cy={c.y} r={5} fill="#8b5cf6" stroke="#fff" strokeWidth={1} onMouseDown={handleMouseDownCurve(zone.id, edgeIdx)} style={{ cursor: 'pointer' }} />
                                    <circle cx={c.x + 10} cy={c.y - 10} r={4} fill="#22c55e" stroke="#fff" strokeWidth={1} onClick={handleSplitEdge(zone.id, edgeIdx)} style={{ cursor: 'pointer' }} />
                                    <text x={c.x + 10} y={c.y - 8} fill="#fff" style={{ fontSize: '6px', fontWeight: '900', pointerEvents: 'none' }} textAnchor="middle">+</text>
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
