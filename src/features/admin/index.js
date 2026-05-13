/**
 * @file features/admin/index.js
 * @description Barrel del módulo de administración.
 *
 * Exporta todos los hooks, constantes y componentes del dominio admin.
 * Cualquier consumidor externo debe importar desde aquí, no desde subcarpetas.
 *
 * @layer features/admin
 */

// ─── Hooks de dominio ─────────────────────────────────────────────────────────
export { default as useAdminDashboard } from './hooks/useAdminDashboard'
export { default as useAdminUsers }     from './hooks/useAdminUsers'
export { default as useSidebar }        from './hooks/useSidebar'

// ─── Constantes de dominio ────────────────────────────────────────────────────
export {
  DEFAULT_ADMIN_SECTIONS,
  GESTOR_SIDEBAR_ITEMS,
  OPERADOR_SIDEBAR_ITEMS,
  ADMIN_SUPERVISION_SECTIONS,
  SIDEBAR_STORAGE_KEY,
  SIDEBAR_VERSION_SENTINEL
} from './constants/sidebarSections'
