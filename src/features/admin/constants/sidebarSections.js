/**
 * @file sidebarSections.js
 * @description Definición estática de las secciones del sidebar del panel de administración.
 *
 * PRINCIPIO SRP: Este archivo es responsable ÚNICAMENTE de los datos del menú.
 * La lógica de renderizado y drag & drop vive en useSidebar.js.
 * El renderizado vive en DashboardLayout.jsx.
 *
 * REGLA: Si se añade una nueva sección o ítem de navegación al panel admin,
 * este es el ÚNICO lugar donde debe modificarse.
 *
 * @layer features/admin/constants
 */

/**
 * Secciones predeterminadas del sidebar para el rol ADMIN.
 * Cada sección agrupa items de navegación por dominio funcional.
 *
 * @type {Array<SidebarSection>}
 */
export const DEFAULT_ADMIN_SECTIONS = [
  {
    id: 'control_central',
    label: 'CONTROL MAESTRO',
    items: [
      { id: 'dashboard',    path: '/admin',             icon: 'dashboard', label: 'Vista General',   permission: 'admin.view' },
      { id: 'users',       path: '/admin/users',        icon: 'users',     label: 'Gestión Usuarios',     permission: 'users.view' },
      { id: 'logs',        path: '/admin/logs',         icon: 'fileText',  label: 'Historial de Actividad',     permission: 'logs.view' },
      { id: 'config',      path: '/admin/config',       icon: 'settings',  label: 'Configuración',        permission: 'config.view' }
    ]
  },
  {
    id: 'operaciones_negocio',
    label: 'OPERACIONES Y VENTAS',
    items: [
      { id: 'sales',            path: '/admin/sales',            icon: 'dollarSign',  label: 'Reportes de Ventas',     permission: 'sales.view' },
      { id: 'transactions',     path: '/manager/transactions',   icon: 'dollarSign',  label: 'Historial de Pagos', permission: 'sales.view' },
      { id: 'events',           path: '/admin/events',           icon: 'calendar',    label: 'Gestión de Eventos',    permission: 'events.view' },
      { id: 'merchandise_adm',  path: '/admin/merchandise',      icon: 'shoppingBag', label: 'Aprobación de Tienda',  permission: 'admin.view' }
    ]
  },
  {
    id: 'infraestructura_datos',
    label: 'INFRAESTRUCTURA Y DATOS',
    items: [
      { id: 'admin_venue_map', path: '/admin/venue-map', icon: 'edit',     label: 'Diseño de Lugares', permission: 'venues.view' },
      { id: 'venues',         path: '/admin/venues',     icon: 'map',      label: 'Lugares y Sedes',      permission: 'venues.view' },
      { id: 'database',       path: '/admin/database',   icon: 'database', label: 'Copias de Seguridad',         permission: 'database.view' },
      { id: 'big_data',       path: '/admin/big-data',   icon: 'database', label: 'Análisis y Predicciones',     permission: 'admin.view' }
    ]
  },
  {
    id: 'marketing_medios',
    label: 'COMUNICACIÓN Y MEDIOS',
    items: [
      { id: 'ads',    path: '/admin/ads',    icon: 'image',    label: 'Publicidad & Ads',  permission: 'cms.view' },
      { id: 'emails', path: '/admin/emails', icon: 'mail',     label: 'Email Marketing',    permission: 'admin.view' },
      { id: 'ticker', path: '/admin/ticker', icon: 'sparkles', label: 'Cinta de Noticias',  permission: 'cms.view' }
    ]
  }
]

/**
 * Items del sidebar para el rol GESTOR.
 * No son secciones múltiples, solo una vista por dominio.
 *
 * @type {Array<SidebarSection>}
 */
export const GESTOR_SIDEBAR_ITEMS = [
  {
    id: 'g_main',
    label: 'GESTIÓN GESTOR',
    items: [
      { id: 'g_main_dashboard', path: '/events/manage',        icon: 'dashboard',   label: 'Mi Panel de Control' },
      { id: 'g_create',         path: '/events/create',        icon: 'plus',        label: 'Crear Evento' },
      { id: 'g_merch',          path: '/manager/merchandise',  icon: 'shoppingBag', label: 'Diseño de Tienda / Souvenirs' },
      { id: 'g_events',         path: '/events/manage',        icon: 'calendar',    label: 'Mis Eventos' },
      { id: 'g_venue_map',      path: '/admin/venue-map',      icon: 'map',         label: 'Diseñar Lugar' },
      { id: 'g_stats',          path: '/manager/analytics',    icon: 'chart',       label: 'Análisis y Predicciones' },
      { id: 'g_transactions',   path: '/manager/transactions', icon: 'dollarSign',  label: 'Control de Ventas' },
      { id: 'g_attendees',      path: '/manager/attendees',    icon: 'users',       label: 'Control de Asistentes' },
      { id: 'g_ads',            path: '/admin/ads',            icon: 'image',       label: 'Administrar Anuncios' }
    ]
  }
]

/**
 * Items del sidebar para el rol OPERADOR.
 *
 * @type {Array<SidebarSection>}
 */
export const OPERADOR_SIDEBAR_ITEMS = [
  {
    id: 'o_main',
    label: 'CONTROL OPERADOR',
    items: [
      { id: 'o_dashboard', path: '/staff/dashboard',        icon: 'dashboard',    label: 'Panel de Staff' },
      { id: 'o_staff',     path: '/staff?tab=scanner',      icon: 'checkCircle',  label: 'Lector de Entradas' },
      { id: 'o_helpdesk',  path: '/staff?tab=helpdesk',     icon: 'search',       label: 'Soporte de Entrada' },
      { id: 'o_boxoffice', path: '/staff?tab=boxoffice',    icon: 'shoppingBag',  label: 'Venta Presencial' },
      { id: 'o_history',   path: '/staff/history',          icon: 'history',      label: 'Registro de Accesos' },
      { id: 'o_incidents', path: '/staff/incidents',        icon: 'alertTriangle',label: 'Reporte de Problemas' }
    ]
  }
]

/**
 * Secciones de supervisión que el ADMIN puede ver sobre otros roles.
 * Se añaden DESPUÉS de las secciones admin base.
 *
 * @type {Array<SidebarSection>}
 */
export const ADMIN_SUPERVISION_SECTIONS = [
  {
    id: 'super_gestor',
    label: 'GESTOR (Supervisión)',
    isCollapsible: true,
    items: [
      { id: 'g_events_s',       path: '/events/manage',        icon: 'calendar',   label: 'Monitor Eventos' },
      { id: 'g_merch_s',        path: '/manager/merchandise',  icon: 'shoppingBag',label: 'Supervisar Tienda' },
      { id: 'g_stats_s',        path: '/manager/analytics',    icon: 'chart',      label: 'Análisis y Predicciones' },
      { id: 'g_transactions_s', path: '/manager/transactions', icon: 'dollarSign', label: 'Auditoría de Pagos' },
      { id: 'g_attendees_s',    path: '/manager/attendees',    icon: 'users',      label: 'Registro de Asistentes' },
      { id: 'g_ads_s',          path: '/admin/ads',            icon: 'image',      label: 'Administrar Anuncios' }
    ]
  },
  {
    id: 'super_operador',
    label: 'OPERADOR (Supervisión)',
    isCollapsible: true,
    items: [
      { id: 'o_staff_s',    path: '/staff',           icon: 'checkCircle',   label: 'Terminal de Staff' },
      { id: 'o_history_s',  path: '/staff/history',   icon: 'history',       label: 'Registro de Accesos' },
      { id: 'o_incidents_s',path: '/staff/incidents', icon: 'alertTriangle', label: 'Control de Reportes' }
    ]
  },
  {
    id: 'super_usuario',
    label: 'USUARIO (Supervisión)',
    isCollapsible: true,
    items: [
      { id: 'u_dashboard_s',    path: '/user/dashboard',    icon: 'dashboard', label: 'Vista del Cliente' },
      { id: 'u_tickets_s',      path: '/user/tickets',      icon: 'ticket',    label: 'Boletos del Cliente' },
      { id: 'u_achievements_s', path: '/user/achievements', icon: 'star',      label: 'Premios del Cliente' }
    ]
  }
]

/**
 * Clave de localStorage para persistir el orden del sidebar.
 * Centralizado aquí para evitar magic strings dispersos.
 */
export const SIDEBAR_STORAGE_KEY = 'sidebar_order'

/**
 * ID del ítem centinela para detectar versiones desactualizadas del sidebar en localStorage.
 * Si este ID no existe en el orden guardado, se resetea al predeterminado.
 */
export const SIDEBAR_VERSION_SENTINEL = 'hypervision'
