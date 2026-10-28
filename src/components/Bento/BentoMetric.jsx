import React from 'react';
import AnimatedCounter from '../AnimatedCounter/AnimatedCounter';
import './Bento.css';

/**
 * BentoMetric - Visualizador de métricas y KPIs de alta precisión.
 * @param {number|string} value - Valor principal del indicador
 * @param {string} label - Etiqueta descriptiva
 * @param {string} prefix - Prefijo opcional (ej: '$')
 * @param {string} suffix - Sufijo opcional (ej: '%', 'h')
 * @param {string|number} trend - Delta numérico o texto de tendencia
 * @param {string} trendType - 'positive' | 'negative' | 'neutral'
 * @param {boolean} animate - Si debe usar animación en el número
 */
const BentoMetric = ({
  value,
  label,
  prefix = '',
  suffix = '',
  trend,
  trendType = 'neutral',
  animate = true,
  className = '',
  ...props
}) => {
  const isNumeric = typeof value === 'number' || (!isNaN(Number(value)) && value !== '' && value !== null);

  return (
    <div className={`bento-metric ${className}`.trim()} {...props}>
      <div className="bento-metric__row">
        <span className="bento-metric__value">
          {prefix}
          {animate && isNumeric ? (
            <AnimatedCounter value={Number(value)} />
          ) : (
            value
          )}
          {suffix}
        </span>

        {trend && (
          <span className={`bento-metric__trend bento-metric__trend--${trendType}`}>
            {trend}
          </span>
        )}
      </div>

      {label && <span className="bento-metric__label">{label}</span>}
    </div>
  );
};

export default BentoMetric;
