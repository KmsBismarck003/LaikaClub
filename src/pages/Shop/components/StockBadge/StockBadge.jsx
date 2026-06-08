import React from 'react';
import './StockBadge.css';

/**
 * StockBadge - Visual indicator for product availability
 * Variants: 'in_stock' | 'low_stock' | 'out_of_stock'
 */
const StockBadge = ({ stock, threshold = 5, compact = false }) => {
    const numStock = typeof stock === 'number' ? stock : parseInt(stock, 10) || 0;

    let variant, label;

    if (numStock <= 0) {
        variant = 'out_of_stock';
        label = compact ? 'Agotado' : 'Sin Stock';
    } else if (numStock <= threshold) {
        variant = 'low_stock';
        label = compact ? `${numStock} pzas` : `Pocas unidades · ${numStock} disponibles`;
    } else {
        variant = 'in_stock';
        label = compact ? 'Disponible' : `En stock`;
    }

    return (
        <span className={`stock-badge stock-badge--${variant} ${compact ? 'stock-badge--compact' : ''}`}>
            <span className="stock-badge__dot" />
            {label}
        </span>
    );
};

export default StockBadge;
