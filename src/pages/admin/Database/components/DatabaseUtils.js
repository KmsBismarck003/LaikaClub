/**
 * Utilidades de lógica para la gestión de Base de Datos (SQL/NoSQL)
 */

/**
 * Calcula el tiempo restante para la expiración de un respaldo
 * @param {string} createdAt - Fecha de creación ISO
 * @param {number} retentionDays - Días de retención configurados
 * @returns {object} { text: string, color: string }
 */
export const calculateTimeRemaining = (createdAt, retentionDays = 30) => {
    if (!createdAt) return { text: 'N/A', color: 'secondary' };
    const createdDate = new Date(createdAt);
    if (isNaN(createdDate.getTime())) return { text: 'N/A', color: 'secondary' };

    const expirationDate = new Date(createdDate.getTime() + retentionDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = expirationDate - now;

    if (diffTime <= 0) return { text: 'EXPIRADO', color: 'error' };

    const d = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const h = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diffTime % (1000 * 60)) / 1000);

    const text = d > 0 ? `${d}d ${h}h` : `${h}h ${m}m ${s}s`;
    const color = d < 3 ? 'warning' : 'success';
    
    return { text, color };
};

/**
 * Extrae la fecha de creación desde un ID de snapshot de MongoDB Atlas
 * Formato esperado: snapshot_collection_YYYYMMDD_HHMMSS
 * @param {string} id 
 * @returns {string|null} ISO date string
 */
export const extractDateFromId = (id) => {
    if (!id) return null;
    const parts = id.split('_');
    if (parts.length >= 4) {
        const dateStr = parts[2]; 
        const timeStr = parts[3]; 
        if (dateStr.length === 8 && timeStr.length === 6) {
            return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}T${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`;
        }
    }
    return null;
};

/**
 * Formatea bytes a una unidad legible (MB por defecto para bases de datos)
 * @param {number|string} size 
 * @returns {string}
 */
export const formatSize = (size) => {
    return (parseFloat(size) || 0).toFixed(2) + ' MB';
};
