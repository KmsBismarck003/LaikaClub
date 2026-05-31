/**
 * features/presale/index.js — Public API del módulo de preventa.
 *
 * Solo expone lo que los consumidores externos necesitan.
 * Los internos (utils, constants) se importan directamente dentro del módulo.
 */

// Hook principal
export { usePresale } from './hooks/usePresale';

// Componentes
export { default as PresaleGate } from './components/PresaleGate';
export { default as PresaleBadge } from './components/PresaleBadge';
export { default as PresaleSection } from './components/PresaleSection';

// Utilidades públicas (por si el Checkout las necesita directamente)
export { isBinAllowed, isPresaleActiveNow, getPresaleState } from './utils/binValidator';

// Constantes
export { MEXICAN_BANKS, getBankById, getDefaultBinsCsv } from './constants/banks';
