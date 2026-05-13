/**
 * Laika Brain - User/Security Scenarios
 * Focus: Access, role management, audit, bans.
 */

export const userScenarios = {
    roles: {
        keywords: ['rol', 'permiso', 'gestor', 'operador', 'administrador', 'cambiar nivel', 'ayuda usuarios', 'gente', 'quien', 'accesos'],
        responses: [
            "Gestión de privilegios detectada. ¿Quieres elevar o restringir el acceso a un perfil?",
            "Puedo reasignar los roles de acceso ahora mismo. ¿Qué cambio tienes en mente?"
        ],
        thoughts: [
            "Consultando tabla de privilegios jerárquicos...",
            "Verificando dependencias de rol para el usuario actual...",
            "Analizando matriz de permisos de escritura vs lectura...",
            "Comprobando integridad de tokens de acceso..."
        ],
        actions: [
            { id: 'u-r1', text: 'Auditar Roles', icon: 'shield', cmd: 'audit_roles' },
            { id: 'u-r2', text: 'Ver Permisos', icon: 'key', path: '/admin/config' }
        ]
    },
    security: {
        keywords: ['bloquear', 'banear', 'suspender', 'peligro', 'intruso', 'fraudulento'],
        responses: [
            "Protocolo de Seguridad activado. ¿Procede bloqueo inmediato de la cuenta/IP?",
            "Detectando actividades sospechosas. ¿Quieres que suspenda el acceso a los usuarios auditados?"
        ],
        thoughts: [
            "Rastreando origen de peticiones concurrentes (IP)...",
            "Escaneando logs por patrones de fuerza bruta detectados...",
            "Aislando sesiones activas bajo sospecha de intrusión...",
            "Preparando firewall para bloqueo de capa 7..."
        ],
        actions: [
            { id: 'u-s1', text: 'Bloqueo Preventivo', icon: 'lock', cmd: 'suspend_user' },
            { id: 'u-s2', text: 'Ver Alertas Críticas', icon: 'alertTriangle', path: '/admin/auth-audit' }
        ]
    },
    audit: {
        keywords: ['auditar usuarios', 'quien entro', 'logs de acceso', 'actividad'],
        responses: [
            "Cargando historial de accesos. Puedo filtrar por fecha o por rol específico.",
            "Reporte de actividad: 12 nuevos registros hoy. ¿Quieres que analice patrones sospechosos?"
        ],
        thoughts: [
            "Indexando registros de auditoría del último ciclo de 24h...",
            "Filtrando eventos por criticidad (Warning/Critical)...",
            "Cruzando datos de login con geolocalización de IPs...",
            "Generando sumario de sesiones anómalas detectadas..."
        ],
        actions: [
            { id: 'u-a1', text: 'Ver Accesos de Hoy', icon: 'eye', path: '/admin/auth-audit' }
        ]
    }
};
