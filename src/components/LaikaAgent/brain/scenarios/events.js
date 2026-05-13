/**
 * Laika Brain - Event/Sales Scenarios
 * Focus: Publishing, analytics, promotion.
 */

export const eventScenarios = {
    publish: {
        keywords: ['publicar', 'lanzar', 'nuevo evento', 'activar evento', 'crear', 'ayuda eventos', 'boleto', 'cartelera', 'vender'],
        responses: [
            "Gestor de Cartelera detectado. ¿Quieres que prepare el borrador del nuevo evento hoy?",
            "Puedo ayudarte con la publicación masiva o el lanzamiento de preventa."
        ],
        thoughts: [
            "Accediendo a la tabla de borradores de eventos...",
            "Validando disponibilidad de fechas en el calendario maestro...",
            "Verificando resolución de assets gráficos para el banner...",
            "Calculando el impacto en la cuota de almacenamiento..."
        ],
        actions: [
            { id: 'e-p1', text: 'Crear Nuevo', icon: 'plusCircle', path: '/events/create' },
            { id: 'e-p2', text: 'Programar Launch', icon: 'calendar', cmd: 'schedule_launch' }
        ]
    },
    analytics: {
        keywords: ['ventas', 'reporte de ventas', 'como va el evento', 'estadísticas', 'tendencia', 'metrica', 'analytics'],
        responses: [
            "Analizando flujo de transacciones. Hay una tendencia al alza en boletos VIP.",
            "Reporte de hoy: 15% más ventas que ayer. ¿Quieres que compare con el evento anterior?"
        ],
        thoughts: [
            "Agregando transacciones de boletos en tiempo real...",
            "Filtrando ventas por categoría (General/VIP/Socio)...",
            "Cruzando datos con el embudo de conversión de la landing...",
            "Generando proyección de 'Sold Out' basado en ritmo actual..."
        ],
        actions: [
            { id: 'e-a1', text: 'Ver Gráficas', icon: 'barChart', path: '/manager/analytics' },
            { id: 'e-a2', text: 'Descargar Excel', icon: 'download', cmd: 'export_sales' }
        ]
    },
    promotion: {
        keywords: ['promocionar', 'publicidad', 'ads', 'notificacion', 'push', 'mail'],
        responses: [
            "Módulo de Marketing activado. ¿Quieres lanzar una notificación push para el evento de hoy?",
            "Puedo ayudarte a orquestar una campaña de email dirigida a los usuarios más activos."
        ],
        thoughts: [
            "Segmentando audiencia por comportamiento de compra...",
            "Preparando payload para el servicio de Firebase Cloud Messaging...",
            "Validando copia de marketing contra filtros de spam...",
            "Calculando el alcance estimado de la notificación..."
        ],
        actions: [
            { id: 'e-m1', text: 'Enviar Push', icon: 'zap', cmd: 'send_push' },
            { id: 'e-m2', text: 'Email Marketing', icon: 'mail', path: '/admin/laika' }
        ]
    }
};
