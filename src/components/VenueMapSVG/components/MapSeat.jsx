import React, { memo } from 'react';

/**
 * MapSeat — Representación visual SVG de un asiento individual.
 * Estados: disponible (gris perla), seleccionado (blanco brillante),
 * ocupado (rojo apagado), reservado (naranja apagado), ganador/scanner (animación especial).
 */
const MapSeat = memo(({ 
    seatId, 
    x, 
    y, 
    status,        // 'available' | 'occupied' | 'reserved'
    zone, 
    isSelected, 
    isHovered, 
    isScanning, 
    isWinner,
    isBusy,        // Calculado externamente con datos reales de busySeats
    rouletteActive,
    onSeatToggle,
    onHover,
    onLeave,
    setPersistentSeatInfo,
    seatLabel,     // Etiqueta del asiento (ej: "A-1")
}) => {
    
    // ── Estado visual del asiento ────────────────────────────────────
    const isOccupied = status === 'occupied' || isBusy;
    const isReserved = status === 'reserved';
    const isAvailable = !isOccupied && !isReserved;
    
    // Colores según estado
    let fillColor = '#D1D5DB';     // Disponible: gris perla neutral
    let strokeColor = 'rgba(255,255,255,0.12)';
    let opacity = 1;

    if (isOccupied) {
        fillColor = '#4B1E1E';     // Ocupado: rojo oscuro apagado
        strokeColor = '#7f1d1d';
        opacity = 0.85;
    } else if (isReserved) {
        fillColor = '#3D2A0A';     // Reservado: naranja oscuro apagado
        strokeColor = '#92400e';
        opacity = 0.85;
    } else if (isSelected) {
        fillColor = '#3B82F6';     // Seleccionado: azul premium (similar a referencia)
        strokeColor = '#60a5fa';
        opacity = 1;
    } else if (isScanning || isWinner) {
        fillColor = '#FFFFFF';
        strokeColor = '#fff';
        opacity = 1;
    }

    const scale = isHovered && isAvailable ? 8.5 : 6.0;
    
    // ── Handlers ─────────────────────────────────────────────────────
    const handleClick = () => {
        if (rouletteActive) return;

        if ((isOccupied || isReserved) && setPersistentSeatInfo) {
            setPersistentSeatInfo({
                id: seatLabel || seatId,
                zoneName: zone.name,
                price: zone.price,
                status: isOccupied ? 'VENDIDO' : 'RESERVADO',
                user: null,
                email: null,
                paidWith: isOccupied ? null : 'PENDIENTE',
                date: null
            });
        } else if (isAvailable && onSeatToggle) {
            onSeatToggle(seatId);
        }
    };

    const handleMouseEnter = (e) => {
        if (rouletteActive) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const finalStatus = isOccupied ? 'OCUPADO' : isReserved ? 'RESERVADO' : isSelected ? 'SELECCIONADO' : 'DISPONIBLE';
        
        onHover && onHover({ 
            id: seatLabel || seatId, 
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            zoneName: zone.name, 
            price: zone.price, 
            status: finalStatus
        });

        // Mostrar info en HUD admin solo para asientos no disponibles
        if ((isOccupied || isReserved) && setPersistentSeatInfo) {
            setPersistentSeatInfo({
                id: seatLabel || seatId,
                zoneName: zone.name,
                price: zone.price,
                status: finalStatus,
                user: null,
                email: null,
                paidWith: isOccupied ? null : 'PENDIENTE',
                date: null
            });
        }
    };

    return (
        <g 
            transform={`translate(${x}, ${y}) scale(${scale})`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => onLeave && onLeave()} 
            onClick={handleClick}
            style={{ 
                cursor: rouletteActive ? 'default' : (isAvailable ? 'pointer' : 'not-allowed'), 
                transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                pointerEvents: 'all'
            }}
        >
            {/* Base / sombra */}
            <rect 
                x="-1.1" y="-1.1" width="2.2" height="2.2" rx="0.45"
                fill="rgba(0,0,0,0.5)" 
                stroke="none"
            />
            
            {/* Asiento principal */}
            <rect 
                x="-0.75" y="-0.75" width="1.5" height="1.5" rx="0.35"
                fill={fillColor} 
                stroke={strokeColor}
                strokeWidth={isSelected || isScanning || isWinner ? 0.25 : 0.08}
                className="seat-rect"
                style={{ 
                    filter: isSelected ? `drop-shadow(0 0 2px #3B82F6)` 
                           : (isScanning || isWinner) ? `drop-shadow(0 0 3px #fff)` 
                           : 'none',
                    opacity,
                    transition: 'all 0.15s ease'
                }} 
            />
            
            {/* Brillo interior solo para disponibles */}
            {isAvailable && !isSelected && (
                <rect 
                    x="-0.45" y="-0.55" width="0.4" height="0.25" rx="0.1"
                    fill="rgba(255,255,255,0.25)" 
                    style={{ pointerEvents: 'none' }}
                />
            )}

            {/* Check mark para seleccionados */}
            {isSelected && (
                <path
                    d="M-0.3 0 L-0.1 0.2 L0.3 -0.3"
                    stroke="#fff"
                    strokeWidth="0.3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ pointerEvents: 'none' }}
                />
            )}
        </g>
    );
});

MapSeat.displayName = 'MapSeat';
export default MapSeat;
