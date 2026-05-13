/**
 * @file app.config.js
 * @description Configuración global centralizada de la aplicación Laika Club.
 *
 * REGLA: Este archivo es la única fuente de verdad para constantes de la app.
 * Ningún componente debe hardcodear URLs, versiones o flags de feature.
 *
 * @layer core/config
 */

// ─── Versión y Metadata ──────────────────────────────────────────────────────

export const APP_CONFIG = {
  name: 'LAIKA CLUB',
  version: '2.0.0',
  description: 'Sistema integral de gestión de eventos y ticketing',
  environment: process.env.NODE_ENV || 'development',
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const API_CONFIG = {
  baseURL:
    process.env.REACT_APP_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:8000/api'
      : `http://${window.location.hostname}:8000/api`),
  timeout: 15000, // ms
  retries: 3,
}

// ─── Autenticación ───────────────────────────────────────────────────────────

export const AUTH_CONFIG = {
  tokenKey: 'token',
  userKey: 'user',
  sessionKey: 'sessionToken',
  defaultSessionTimeout: 30, // minutos
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos en ms
}

// ─── UI & UX ─────────────────────────────────────────────────────────────────

export const UX_CONFIG = {
  loadingScreenDuration: 8000, // ms — duración mínima del splash screen
  skeletonMinDuration: 400,    // ms — duración mínima del skeleton
  toastDuration: 4000,         // ms — duración de las notificaciones
  animationsDefault: true,     // si las animaciones están activas por defecto
  densityDefault: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
}

// ─── Paginación ──────────────────────────────────────────────────────────────

export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
}

// ─── Feature Flags ───────────────────────────────────────────────────────────
// Permite activar/desactivar funcionalidades sin tocar el código de negocio.

export const FEATURE_FLAGS = {
  luckySeat: true,
  laikaAgent: true,
  bigDataAnalytics: true,
  merchandiseMarketplace: true,
  emailMarketing: true,
  socialLogin: false, // pendiente de integración
}

// ─── Roles del Sistema ───────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: 'admin',
  GESTOR: 'gestor',
  OPERADOR: 'operador',
  USUARIO: 'usuario',
}

// ─── Rutas por defecto por Rol ───────────────────────────────────────────────

export const DEFAULT_ROUTES = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.GESTOR]: '/events/manage',
  [ROLES.OPERADOR]: '/staff/dashboard',
  [ROLES.USUARIO]: '/',
}

export default APP_CONFIG
