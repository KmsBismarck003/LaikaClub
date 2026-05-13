import React, { memo } from 'react';

const MapSeat = memo(({ 
    seatId, 
    x, 
    y, 
    status, 
    zone, 
    isSelected, 
    isHovered, 
    isScanning, 
    isWinner,
    isBusy,
    rouletteActive,
    onSeatToggle,
    onHover,
    onLeave,
    setPersistentSeatInfo
}) => {
    
    // Seat colors: OCCUPIED -> RED, SELECTED -> GOLD, AVAILABLE -> WHITE, RESERVED -> ORANGE
    const isTestOccupied = seatId.endsWith('0') || seatId.endsWith('3') || seatId.endsWith('5') || seatId.endsWith('8');
    const isTestReserved = seatId.endsWith('1') || seatId.endsWith('7'); // NUEVA SIMULACIÓN: Apartados
        // TODO EL MAPA EN GRIS PERLA INDUSTRIAL
    let baseColor = "#E1E1E1"; // Gris Perla Técnico
    
    // Si está seleccionado, le damos un resalte sutil en blanco brillante
    if (isSelected) baseColor = '#FFFFFF'; 
    
    // THEMED SCANNING COLORS (Solo para efectos de scanner/ganador)
    const getZoneColor = (z) => {
        return '#FFFFFF'; // Mantener neutral incluso en scan
    };

    if (isScanning || isWinner) {
        baseColor = "#FFFFFF";
    }

    const scale = isHovered || isScanning || isWinner ? 8.5 : 6.0;
    
    const handleSeatClick = () => {
        if (rouletteActive) return;

        // Mantenemos la lógica de persistencia pero el color visual es neutro
        const isTestOccupied = seatId.endsWith('0') || seatId.endsWith('3') || seatId.endsWith('5') || seatId.endsWith('8');
        const isTestReserved = seatId.endsWith('1') || seatId.endsWith('7');
        const isActuallyBusy = status === 'occupied' || isTestOccupied || status === 'reserved' || isTestReserved;

        if (isActuallyBusy && setPersistentSeatInfo) {
            setPersistentSeatInfo({
                id: seatId,
                zoneName: zone.name,
                price: zone.price,
                status: (status === 'occupied' || isTestOccupied) ? 'VENDIDO' : 'RESERVADO',
                user: 'Ulises Garcia', 
                email: 'ulises@laika.club',
                paidWith: (status === 'occupied' || isTestOccupied) ? 'VISA **** 4242' : 'PENDIENTE',
                date: '05/04 14:20'
            });
        } else if (onSeatToggle) {
            onSeatToggle(seatId);
        }
    };

    return (
        <g 
            transform={`translate(${x}, ${y}) scale(${scale})`}
            onMouseEnter={(e) => {
                if (rouletteActive) return;
                const rect = e.currentTarget.getBoundingClientRect();
                
                const isTestOccupied = seatId.endsWith('0') || seatId.endsWith('3') || seatId.endsWith('5') || seatId.endsWith('8');
                const isTestReserved = seatId.endsWith('1') || seatId.endsWith('7');
                const isActuallyBusy = status === 'occupied' || isTestOccupied || status === 'reserved' || isTestReserved;

                const finalStatusStr = (status === 'occupied' || isTestOccupied) ? 'VENDIDO' : 
                                      (status === 'reserved' || isTestReserved) ? 'RESERVADO' : 'DISPONIBLE';

                // HOVER SIMPLE (Tooltip)
                onHover && onHover({ 
                    id: seatId, 
                    rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                    zoneName: zone.name, 
                    price: zone.price, 
                    status: finalStatusStr
                });

                // PERSISTENT HUD (Intel HUD) - SE ACTIVA AL PASAR EL CURSOR
                if (isActuallyBusy && setPersistentSeatInfo) {
                    setPersistentSeatInfo({
                        id: seatId,
                        zoneName: zone.name,
                        price: zone.price,
                        status: finalStatusStr,
                        user: 'Ulises Garcia', 
                        email: 'ulises@laika.club',
                        paidWith: (status === 'occupied' || isTestOccupied) ? 'VISA **** 4242' : 'PENDIENTE',
                        date: '05/04 14:20'
                    });
                }
            }}
            onMouseLeave={() => onLeave && onLeave()} 
            onClick={handleSeatClick}
            style={{ 
                cursor: rouletteActive ? 'default' : 'pointer', 
                transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                pointerEvents: 'all' // FOZAR DETECCIÓN
            }}
        >
            {/* Button base / ring (Now Square) */}
            <rect 
                x="-1.1" y="-1.1" width="2.2" height="2.2" rx="0.5"
                fill="rgba(0,0,0,0.6)" 
                stroke="rgba(255,255,255,0.08)" 
                strokeWidth="0.1" 
            />
            
            {/* Main seat dot (The "Button" - Now Square) */}
            <rect 
                x="-0.75" y="-0.75" width="1.5" height="1.5" rx="0.4"
                fill={baseColor} 
                stroke={isSelected || isHovered || isScanning || isWinner ? '#fff' : 'rgba(0,0,0,0.2)'} 
                strokeWidth={isScanning || isWinner ? 0.3 : 0.1} 
                className="seat-rect"
                style={{ 
                    filter: (isScanning || isWinner || isSelected || isHovered) ? `drop-shadow(0 0 3px ${baseColor})` : 'none',
                    transition: 'all 0.2s ease'
                }} 
            />
            
            {/* Subtle inner highlight for technical effect */}
            {!isBusy && (
                <rect 
                    x="-0.4" y="-0.4" width="0.4" height="0.4" rx="0.1"
                    fill="rgba(255,255,255,0.3)" 
                    style={{ pointerEvents: 'none' }}
                />
            )}
        </g>
    );
});

export default MapSeat;
