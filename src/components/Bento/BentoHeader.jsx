import React from 'react';
import './Bento.css';

/**
 * BentoHeader - Cabecera estandarizada para tarjetas Bento.
 * @param {string|React.ReactNode} title - Título con tipografía contrastada
 * @param {string|React.ReactNode} subtitle - Subtítulo descriptivo secundario
 * @param {React.ReactNode} icon - Slot para icono vectorial SVG
 * @param {React.ReactNode} action - Slot para controles o botones de acción
 */
const BentoHeader = ({
  title,
  subtitle,
  icon,
  action,
  className = '',
  ...props
}) => {
  return (
    <div className={`bento-header ${className}`.trim()} {...props}>
      <div className="bento-header__main">
        {icon && <div className="bento-header__icon">{icon}</div>}
        <div className="bento-header__text">
          {title && <h3 className="bento-header__title">{title}</h3>}
          {subtitle && <p className="bento-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="bento-header__action">{action}</div>}
    </div>
  );
};

export default BentoHeader;
