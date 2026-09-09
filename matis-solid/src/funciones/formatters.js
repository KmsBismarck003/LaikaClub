// =========================================================================
// CONFIGURACIÓN GLOBAL DE FORMATO NUMÉRICO Y DE MONEDA
// =========================================================================
// Para cambiar el comportamiento de visualización del dinero en toda la app,
// comente una de las siguientes opciones y descomente la otra:

// OPCIÓN A: Formato compacto abreviado con K y M (estilo americano, ej: $1.45M, $32.1K)
// const FORMATO_COMPACTO = true;

// OPCIÓN B: Formato extendido completo tradicional (estilo estándar, ej: $1,450,000)
const FORMATO_COMPACTO = true;

/**
 * Formatea un valor numérico como moneda en pesos mexicanos (MXN).
 * Soporta formateo compacto (K/M) o extendido según la configuración superior.
 * 
 * @param {number} value - El valor numérico a formatear.
 * @returns {string} El valor formateado listo para mostrar en pantalla.
 */
export function formatCurrency(value) {
  // Retorna un texto por defecto si el valor es nulo o indefinido
  if (value == null) return "$0";
  
  // Si la opción de formato compacto está activa, abrevia las cantidades
  if (FORMATO_COMPACTO) {
    // Obtiene el valor absoluto para realizar la evaluación matemática de escala
    const absValue = Math.abs(value);
    
    // Si la cantidad es igual o mayor a 1 millón, formatea a millones con sufijo "M"
    if (absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
    } 
    // Si la cantidad es igual o mayor a mil, formatea a miles con sufijo "K"
    else if (absValue >= 1000) {
      return `$${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
  }
  
  // Formato extendido por defecto: utiliza el localizador de México sin centavos
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formatea un valor entero con separadores de miles y millones.
 * También respeta la configuración de formato compacto si está activa.
 * 
 * @param {number} value - El entero a formatear.
 * @returns {string} El entero formateado como texto.
 */
export function formatInteger(value) {
  // Retorna cero por defecto si el valor es nulo o indefinido
  if (value == null) return "0";
  
  // Si la opción de formato compacto está activa, abrevia las cifras grandes
  if (FORMATO_COMPACTO) {
    // Obtiene el valor absoluto para evaluar la escala numérica
    const absValue = Math.abs(value);
    
    // Si la cifra es igual o mayor a 1 millón, formatea con el sufijo "M"
    if (absValue >= 1000000) {
      return `${(value / 1000000).toFixed(2).replace(/\.00$/, "")}M`;
    } 
    // Si es igual o mayor a 10 mil, formatea con el sufijo "K"
    else if (absValue >= 10000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
  }
  
  // Formato extendido estándar: usa separador de miles con formato numérico de México
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formatea una proporción decimal como porcentaje.
 * 
 * @param {number} value - La proporción decimal (ej: 0.15 para 15%).
 * @returns {string} El porcentaje formateado con el símbolo %.
 */
export function formatPercent(value) {
  // Retorna cero por ciento por defecto si el valor es nulo
  if (value == null) return "0%";
  
  // Utiliza el formateador internacional estándar para porcentajes en México
  return new Intl.NumberFormat("es-MX", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value);
}

/**
 * Formatea un objeto de período { fecha_inicio, fecha_fin } en una etiqueta
 * legible en español para los encabezados de gráficas.
 * Ejemplo de salida: "Ene 2024 – Ago 2026"
 *
 * @param {{ fecha_inicio: string|null, fecha_fin: string|null }} periodo
 * @returns {string} Cadena de texto con el rango de fechas, o mensaje de indisponibilidad.
 */
export function formatPeriodo(periodo) {
  if (!periodo || !periodo.fecha_inicio || !periodo.fecha_fin) {
    return "Período no disponible";
  }
  const opciones = { year: "numeric", month: "short" };
  const formatFecha = (isoStr) => {
    // Usamos T00:00:00 para evitar problemas de zona horaria que desplacen el día
    const d = new Date(`${isoStr}T00:00:00`);
    return d.toLocaleDateString("es-MX", opciones);
  };
  const inicio = formatFecha(periodo.fecha_inicio);
  const fin = formatFecha(periodo.fecha_fin);
  return `${inicio} – ${fin}`;
}

