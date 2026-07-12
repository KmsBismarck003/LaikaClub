export const INITIAL_SECTIONS = [
    {
        id: 'criticas',
        label: 'Control Principal',
        icon: 'activity',
        items: [
            { id: 'users', path: '/admin/users', icon: 'users', label: 'Gestión Usuarios' },
            { id: 'monitoring_rt', path: '/admin/monitoring', icon: 'activity', label: 'Monitoreo en Vivo' },
            { id: 'big_data', path: '/admin/big-data', icon: 'chart', label: 'Análisis y Predicciones' },
            { id: 'audit', path: '/admin/auth-audit', icon: 'shield', label: 'Registro de Accesos' }
        ]
    },
    {
        id: 'operativa',
        label: 'Gestión de Eventos',
        icon: 'calendar',
        items: [
            { id: 'events', path: '/admin/events', icon: 'calendar', label: 'Administrar Eventos' },
            { id: 'merch', path: '/admin/merch', icon: 'shoppingBag', label: 'Diseño de Tienda / Souvenirs' },
            { id: 'sales', path: '/admin/sales', icon: 'dollarSign', label: 'Reportes de Ventas' },
            { id: 'venues', path: '/admin/venues', icon: 'map', label: 'Lugares y Sedes' },
            { id: 'laika', path: '/admin/laika', icon: 'bot', label: 'Laika Agent' },
            { id: 'emails', path: '/admin/emails', icon: 'mail', label: 'Correos de Difusión' },
            { id: 'push', path: '/admin/push-manager', icon: 'bell', label: 'Notificaciones Push' }
        ]
    },
    {
        id: 'infra',
        label: 'Seguridad y Sistema',
        icon: 'settings',
        items: [
            { id: 'monitoring', path: '/admin/monitoring', icon: 'activity', label: 'Estado del Sistema' },
            { id: 'database', path: '/admin/database', icon: 'database', label: 'Copias de Seguridad' },
            { id: 'config', path: '/admin/config', icon: 'settings', label: 'Ajustes' }
        ]
    }
];

export const WELCOME_TEXT = '¡Hola, Admin!';
