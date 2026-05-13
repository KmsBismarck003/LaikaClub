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
      { id: 'dashboard',    path: '/admin',             icon: 'dashboard', label: 'Dashboard General',   permission: 'admin.view' },
      { id: 'users',       path: '/admin/users',        icon: 'users',     label: 'Gestión Usuarios',     permission: 'users.view' },
      { id: 'logs',        path: '/admin/logs',         icon: 'fileText',  label: 'Logs del Sistema',     permission: 'logs.view' },
      { id: 'config',      path: '/admin/config',       icon: 'settings',  label: 'Configuración',        permission: 'config.view' }
    ]
  },
  {
    id: 'operaciones_negocio',
    label: 'OPERACIONES Y VENTAS',
    items: [
      { id: 'sales',            path: '/admin/sales',            icon: 'dollarSign',  label: 'Ventas y Reportes',     permission: 'sales.view' },
      { id: 'transactions',     path: '/manager/transactions',   icon: 'dollarSign',  label: 'Transacciones (Auditoría)', permission: 'sales.view' },
      { id: 'events',           path: '/admin/events',           icon: 'calendar',    label: 'Gestión de Eventos',    permission: 'events.view' },
      { id: 'merchandise_adm',  path: '/admin/merchandise',      icon: 'shoppingBag', label: 'Aprobación Mercancía',  permission: 'admin.view' }
    ]
  },
  {
    id: 'infraestructura_datos',
    label: 'INFRAESTRUCTURA Y DATOS',
    items: [
      { id: 'admin_venue_map', path: '/admin/venue-map', icon: 'edit',     label: 'Mapa Editor (Recinto)', permission: 'venues.view' },
      { id: 'venues',         path: '/admin/venues',     icon: 'map',      label: 'Sedes y Recintos',      permission: 'venues.view' },
      { id: 'database',       path: '/admin/database',   icon: 'database', label: 'Base de Datos',         permission: 'database.view' },
      { id: 'big_data',       path: '/admin/big-data',   icon: 'database', label: 'Análisis Big Data',     permission: 'admin.view' }
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
      { id: 'g_main_dashboard', path: '/events/manage',        icon: 'dashboard',   label: 'Monitor Gestor' },
      { id: 'g_create',         path: '/events/create',        icon: 'plus',        label: 'Nuevo Evento' },
      { id: 'g_merch',          path: '/manager/merchandise',  icon: 'shoppingBag', label: 'Constructor Mercancía' },
      { id: 'g_events',         path: '/events/manage',        icon: 'calendar',    label: 'Mis Eventos' },
      { id: 'g_venue_map',      path: '/admin/venue-map',      icon: 'map',         label: 'Diseño de Recinto' },
      { id: 'g_stats',          path: '/manager/analytics',    icon: 'chart',       label: 'Big Data Analítico' },
      { id: 'g_transactions',   path: '/manager/transactions', icon: 'dollarSign',  label: 'Auditoría Ventas' },
      { id: 'g_attendees',      path: '/manager/attendees',    icon: 'users',       label: 'Gestor Asistentes' },
      { id: 'g_ads',            path: '/admin/ads',            icon: 'image',       label: 'Publicidad & Ads' }
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
      { id: 'o_dashboard', path: '/staff/dashboard',        icon: 'dashboard',    label: 'Monitor Operativo' },
      { id: 'o_staff',     path: '/staff?tab=scanner',      icon: 'checkCircle',  label: 'Terminal Escaneo' },
      { id: 'o_helpdesk',  path: '/staff?tab=helpdesk',     icon: 'search',       label: 'Mesa de Ayuda' },
      { id: 'o_boxoffice', path: '/staff?tab=boxoffice',    icon: 'shoppingBag',  label: 'Taquilla On-site' },
      { id: 'o_history',   path: '/staff/history',          icon: 'history',      label: 'Historial Entradas' },
      { id: 'o_incidents', path: '/staff/incidents',        icon: 'alertTriangle',label: 'Reportar Incidencias' }
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
      { id: 'g_merch_s',        path: '/manager/merchandise',  icon: 'shoppingBag',label: 'Control Mercancía' },
      { id: 'g_stats_s',        path: '/manager/analytics',    icon: 'chart',      label: 'Analíticas Globales' },
      { id: 'g_transactions_s', path: '/manager/transactions', icon: 'dollarSign', label: 'Auditoría Transacciones' },
      { id: 'g_attendees_s',    path: '/manager/attendees',    icon: 'users',      label: 'Censo Asistentes' },
      { id: 'g_ads_s',          path: '/admin/ads',            icon: 'image',      label: 'Publicidad & Ads' }
    ]
  },
  {
    id: 'super_operador',
    label: 'OPERADOR (Supervisión)',
    isCollapsible: true,
    items: [
      { id: 'o_staff_s',    path: '/staff',           icon: 'checkCircle',   label: 'Terminal Staff' },
      { id: 'o_history_s',  path: '/staff/history',   icon: 'history',       label: 'Historial Entradas' },
      { id: 'o_incidents_s',path: '/staff/incidents', icon: 'alertTriangle', label: 'Monitor Incidencias' }
    ]
  },
  {
    id: 'super_usuario',
    label: 'USUARIO (Supervisión)',
    isCollapsible: true,
    items: [
      { id: 'u_dashboard_s',    path: '/user/dashboard',    icon: 'dashboard', label: 'Vista Dashboard' },
      { id: 'u_tickets_s',      path: '/user/tickets',      icon: 'ticket',    label: 'Mis Boletos' },
      { id: 'u_achievements_s', path: '/user/achievements', icon: 'star',      label: 'Logros y ADN' }
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
