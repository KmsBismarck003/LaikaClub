/**
 * Laika Brain - Database Scenarios
 * Focus: Integrity, backups, migrations, audit.
 */

export const databaseScenarios = {
    backup: {
        keywords: ['respaldo', 'backup', 'copia', 'save', 'guardar db', 'ayuda db', 'sistema', 'administrar db'],
        responses: [
            "Protocolo de Respaldo Preventivo activado. ¿Qué tipo de copia de seguridad prefieres?",
            "Puedo generar una instantánea completa de las tablas ahora mismo. ¿Procedemos?",
            "Entendido. Un backup asegurará que no haya pérdida de datos si hay fallos en el servidor."
        ],
        thoughts: [
            "Estableciendo conexión segura con el nodo maestro de base de datos...",
            "Calculando tamaño total del volcado (aproximadamente 45MB)...",
            "Verificando espacio en disco para el archivo temporal...",
            "Validando permisos de escritura en la carpeta de respaldos..."
        ],
        actions: [
            { id: 'db-b1', text: 'Backup Completo (SQL)', icon: 'database', cmd: 'backup', params: { type: 'full' } },
            { id: 'db-b2', text: 'Incremental (Hoy)', icon: 'clock', cmd: 'backup', params: { type: 'incremental' } }
        ]
    },
    optimize: {
        keywords: ['optimizar', 'limpiar', 'lento', 'mejorar db', 'limpieza', 'purgar'],
        responses: [
            "Detectando fragmentación en los índices. Puedo ejecutar un mantenimiento de optimización ahora.",
            "La limpieza de caché y optimización de tablas mejorará el rendimiento general. ¿Deseas que lo haga?"
        ],
        thoughts: [
            "Analizando niveles de fragmentación en tablas de alto tráfico...",
            "Escaneando tablas temporales de boletos y loginas...",
            "Calculando el impacto en la latencia de respuesta actual...",
            "Ponderando la liberación de memoria en el búfer de caché..."
        ],
        actions: [
            { id: 'db-o1', text: 'Optimizar Tablas', icon: 'zap', cmd: 'optimize' },
            { id: 'db-o2', text: 'Vaciar Caché', icon: 'trash', cmd: 'clear_cache' }
        ]
    },
    audit: {
        keywords: ['auditar', 'revisar db', 'analizar tablas', 'verificar integridad', 'errores db'],
        responses: [
            "Iniciando escaneo de integridad estructural. Te daré un reporte en unos segundos.",
            "Auditoría rápida: 98% integridad. Hay algunas entradas huérfanas en boletos. ¿Quieres que las limpie?"
        ],
        thoughts: [
            "Iniciando verificación de claves foráneas en cascada...",
            "Escaneando por huellas de inyección SQL en logs recientes...",
            "Validando la relación de integridad entre usuarios y suscripciones...",
            "Comparando registros de eventos con transacciones de pasarela..."
        ],
        actions: [
            { id: 'db-a1', text: 'Análisis Completo', icon: 'shield', cmd: 'db_audit' },
            { id: 'db-a2', text: 'Ver Reporte', icon: 'fileText', cmd: 'get_db_report' }
        ]
    }
};
