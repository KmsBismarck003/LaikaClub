import React from 'react';
import './Bento.css';

/**
 * BentoBadge - Pastilla o chip de estado semántico accesible.
 * @param {React.ReactNode} children - Contenido textual o badge
 * @param {string} variant - 'success' | 'warning' | 'error' | 'info' | 'neutral'
 * @param {boolean} dot - Muestra indicador de pulso luminoso
 */
const BentoBadge = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
  ...props
}) => {
  return (
    <span className={`bento-badge bento-badge--${variant} ${className}`.trim()} {...props}>
      {dot && <span className="bento-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
};

export default BentoBadge;
