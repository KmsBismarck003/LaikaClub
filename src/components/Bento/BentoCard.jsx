import React from 'react';
import './Bento.css';

/**
 * BentoCard - Unidad modular base del sistema Bento Box.
 * Soporta curvaturas continuas tipo squircle, micro-bordes y física de animación natural.
 */
const BentoCard = ({
  children,
  colSpan = 12,
  rowSpan = 1,
  variant = 'default',
  header,
  footer,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  const isInteractive = variant === 'interactive' || Boolean(onClick);

  const classes = [
    'bento-card',
    `bento-card--col-${colSpan}`,
    rowSpan > 1 ? `bento-card--row-${rowSpan}` : '',
    variant !== 'default' ? `bento-card--${variant}` : '',
    isInteractive ? 'bento-card--interactive' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e);
    }
  };

  return (
    <div
      className={classes}
      style={style}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      {...props}
    >
      {header && <div className="bento-card__header">{header}</div>}
      <div className="bento-card__body">{children}</div>
      {footer && <div className="bento-card__footer">{footer}</div>}
    </div>
  );
};

export default BentoCard;
