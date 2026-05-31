/**
 * banks.js — Catálogo de bancos mexicanos con sus rangos de BINs conocidos.
 *
 * Fuente de verdad para los selectores del panel de administración.
 * Los BINs aquí son solo los más comunes por banco; el administrador puede
 * añadir BINs adicionales manualmente al crear el evento.
 *
 * Formato BIN: primeros 6 dígitos de la tarjeta (IIN/BIN estándar).
 */

export const MEXICAN_BANKS = [
  {
    id: 'bbva',
    name: 'BBVA Bancomer',
    color: '#072146',
    logo: '🔷',
    commonBins: ['415231', '455511', '402766', '415232', '455512', '446200', '446201'],
  },
  {
    id: 'santander',
    name: 'Santander',
    color: '#EC0000',
    logo: '🔴',
    commonBins: ['557910', '525678', '557911', '548489', '421637', '421638'],
  },
  {
    id: 'citibanamex',
    name: 'Citibanamex',
    color: '#003B79',
    logo: '🔵',
    commonBins: ['416749', '416750', '489462', '489463', '510459', '510460'],
  },
  {
    id: 'banorte',
    name: 'Banorte',
    color: '#E30613',
    logo: '🟥',
    commonBins: ['458136', '458137', '400920', '400921', '463912', '463913'],
  },
  {
    id: 'hsbc',
    name: 'HSBC México',
    color: '#DB0011',
    logo: '🔺',
    commonBins: ['548187', '548188', '400658', '400659', '453978', '453979'],
  },
  {
    id: 'scotiabank',
    name: 'Scotiabank',
    color: '#EC111A',
    logo: '🏦',
    commonBins: ['450998', '450999', '523467', '523468', '553501', '553502'],
  },
  {
    id: 'inbursa',
    name: 'Inbursa',
    color: '#00529B',
    logo: '💙',
    commonBins: ['491528', '491529', '450026', '450027'],
  },
  {
    id: 'american_express',
    name: 'American Express',
    color: '#007BC1',
    logo: '💳',
    commonBins: ['376734', '376735', '374500', '374501', '378282'],
  },
  {
    id: 'custom',
    name: 'Banco personalizado',
    color: '#6366f1',
    logo: '⚙️',
    commonBins: [],
  },
];

/**
 * Retorna el objeto banco dado su id.
 * @param {string} bankId
 */
export function getBankById(bankId) {
  return MEXICAN_BANKS.find((b) => b.id === bankId) || null;
}

/**
 * Convierte los BINs comunes de un banco a formato CSV para guardar en BD.
 * @param {string} bankId
 * @returns {string}
 */
export function getDefaultBinsCsv(bankId) {
  const bank = getBankById(bankId);
  return bank ? bank.commonBins.join(', ') : '';
}
