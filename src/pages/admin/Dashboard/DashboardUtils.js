export const INITIAL_SECTIONS = [
    {
        id: 'criticas',
        label: 'Operaciones Críticas',
        icon: 'activity',
        items: [
            { id: 'users', path: '/admin/users', icon: 'users', label: 'Gestión Usuarios' },
            { id: 'monitoring_rt', path: '/admin/monitoring', icon: 'activity', label: 'Monitoreo Realtime' },
            { id: 'big_data', path: '/admin/big-data', icon: 'chart', label: 'Big Data' },
            { id: 'audit', path: '/admin/auth-audit', icon: 'shield', label: 'Auditoría' }
        ]
    },
    {
        id: 'operativa',
        label: 'Gestión Operativa',
        icon: 'calendar',
        items: [
            { id: 'events', path: '/admin/events', icon: 'calendar', label: 'Eventos' },
            { id: 'merch', path: '/admin/merch', icon: 'shoppingBag', label: 'Mercancía' },
            { id: 'sales', path: '/admin/sales', icon: 'dollarSign', label: 'Ventas' },
            { id: 'venues', path: '/admin/venues', icon: 'map', label: 'Recintos' }
        ]
    },
    {
        id: 'infra',
        label: 'Infraestructura',
        icon: 'settings',
        items: [
            { id: 'monitoring', path: '/admin/monitoring', icon: 'activity', label: 'Monitoreo' },
            { id: 'database', path: '/admin/database', icon: 'database', label: 'Base de Datos' },
            { id: 'config', path: '/admin/config', icon: 'settings', label: 'Configuración' }
        ]
    }
];

export const WELCOME_TEXT = '¡Hola, Admin!';
