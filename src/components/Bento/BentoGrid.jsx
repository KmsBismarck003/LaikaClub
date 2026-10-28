import React from 'react';
import './Bento.css';

/**
 * BentoGrid - Contenedor paramétrico para layouts Bento Box.
 * @param {React.ReactNode} children - Elementos BentoCard hijos
 * @param {string} className - Clases CSS adicionales
 * @param {object} style - Estilos inline opcionales
 */
const BentoGrid = ({ children, className = '', style = {}, ...props }) => {
  return (
    <div className={`bento-grid ${className}`.trim()} style={style} {...props}>
      {children}
    </div>
  );
};

export default BentoGrid;
