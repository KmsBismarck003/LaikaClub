import { databaseScenarios } from './scenarios/database';
import { userScenarios } from './scenarios/users';
import { eventScenarios } from './scenarios/events';
import { getFallbackResponse } from './scenarios/fallback';

/**
 * Laika Brain Orchestrator
 * Selecciona el escenario adecuado según el contexto.
 */
export const orquestate = async (message, path, role, contextData = {}) => {
    const lowMsg = message.trim().toLowerCase();
    const lowRole = (role || 'usuario').toLowerCase();
    const isAdmin = lowRole === 'admin' || lowRole === 'administrador';
    const hasImage = !!contextData.image;
    
    // 1. Mapeo de Escenarios por Ruta
    let currentScenario = null;
    let baseResponse = null;
    
    if (path.includes('/admin/database') || path.includes('/database')) {
        currentScenario = databaseScenarios;
    } else if (path.includes('/admin/users') || path.includes('/admin/auth-audit') || path.includes('/users')) {
        currentScenario = userScenarios;
    } else if (path.includes('/events/manage') || path.includes('/admin/events') || path.includes('/events')) {
        currentScenario = eventScenarios;
    }

    // 2. Intento de Match en el Escenario Contextual
    if (currentScenario && isAdmin) {
        for (const key in currentScenario) {
            const scenario = currentScenario[key];
            if (scenario.keywords.some(k => lowMsg.includes(k))) {
                baseResponse = {
                    text: scenario.responses[Math.floor(Math.random() * scenario.responses.length)],
                    actions: scenario.actions || null,
                    thoughts: scenario.thoughts || null,
                    context: key
                };
                break;
            }
        }
    }

    // 3. Fallback General si no hay match
    if (!baseResponse) {
        baseResponse = getFallbackResponse(message, lowRole);
    }

    // 4. Inyección de Contexto de Imagen si existe
    if (hasImage) {
        return {
            ...baseResponse,
            text: `He recibido tu adjunto visual. Analizando... ${baseResponse.text}`,
            thoughts: [
                "Extrayendo descriptores de imagen...",
                "Correlacionando patrones visuales con el prompt...",
                ...(baseResponse.thoughts || [])
            ]
        };
    }

    return baseResponse;
};

export const getBriefing = async (path, role, data = {}) => {
    const lowRole = (role || 'usuario').toLowerCase();
    const isAdmin = lowRole === 'admin' || lowRole === 'administrador';
    if (!isAdmin) return null;

    if (path.includes('/admin/database') || path.includes('/database')) {
        return {
            text: "Reporte de Base de Datos: Integridad 100%. Te sugiero un respaldo preventivo si vas a realizar cambios hoy.",
            thoughts: [
                "Escaneando servidores de persistencia...",
                "Analizando fragmentación de índices de hoy...",
                "Comparando fecha del último respaldo masivo...",
                "Generando reporte de salud estructural..."
            ],
            actions: [
                { id: 'brief-db-1', text: 'Backup Completo', icon: 'database', cmd: 'backup', params: { type: 'full' } },
                { id: 'brief-db-2', text: 'Limpiar Caché', icon: 'refreshCw', cmd: 'clear_cache' }
            ]
        };
    }

    if (path.includes('/admin/users') || path.includes('/users')) {
        return {
            text: `Control de Usuarios: Tienes registros pendientes de auditoría. ¿Quieres que los verifiquemos?`,
            thoughts: [
                "Consultando tabla de sesiones activas...",
                "Rastreando intentos de login fallidos...",
                "Mapeando permisos de los nuevos administradores...",
                "Compilando informe de actividad de usuarios..."
            ],
            actions: [
                { id: 'brief-usr-1', text: 'Auditar Ahora', icon: 'shield', cmd: 'audit_users' }
            ]
        };
    }

    if (path.includes('/events/manage') || path.includes('/admin/events')) {
        return {
            text: "Gestor de Eventos detectado. ¿Necesitas que analice la tendencia de ventas del festival actual?",
            thoughts: [
                "Agregando ventas por categoría de boleto...",
                "Analizando tasa de conversión del checkout...",
                "Comparando proyección de 'Sold Out' vs real...",
                "Preparando reporte de tendencias de mercado..."
            ],
            actions: [
                { id: 'brief-ev-1', text: 'Ver Análisis', icon: 'barChart', cmd: 'get_analytics' }
            ]
        };
    }

    return null;
};
