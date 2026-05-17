import React from 'react';
import './SeatMapLegend.css';

/**
 * SeatMapLegend — Leyenda visual del mapa de asientos.
 * Muestra los estados: Seleccionado, Disponible, Ocupado (VIP opcional).
 * Sigue el estilo visual del ejemplo de referencia.
 */
const SeatMapLegend = ({ showVip = false, showWheelchair = false, className = '' }) => {
    const items = [
        { 
            type: 'selected', 
            label: 'Seleccionado', 
            color: '#3B82F6',
            icon: null
        },
        { 
            type: 'available', 
            label: 'Disponible', 
            color: '#D1D5DB',
            icon: null
        },
        { 
            type: 'occupied', 
            label: 'Ocupado', 
            color: null,
            icon: '👤'
        },
    ];

    if (showVip) {
        items.push({
            type: 'vip',
            label: 'VIP',
            color: '#EAB308',
            icon: null
        });
    }

    if (showWheelchair) {
        items.push({
            type: 'wheelchair',
            label: 'Silla de ruedas',
            color: '#6B7280',
            icon: '♿'
        });
    }

    return (
        <div className={`seat-map-legend ${className}`}>
            {items.map(item => (
                <div key={item.type} className="legend-item">
                    <div className={`legend-swatch legend-swatch--${item.type}`}>
                        {item.icon ? (
                            <span className="legend-icon">{item.icon}</span>
                        ) : (
                            <span 
                                className="legend-dot"
                                style={{ background: item.color }}
                            />
                        )}
                    </div>
                    <span className="legend-label">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default SeatMapLegend;
