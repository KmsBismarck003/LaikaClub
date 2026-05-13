/**
 * @file roles.config.js
 * @description Definición canónica de roles, permisos y jerarquía del sistema.
 *
 * REGLA: Este archivo es la única fuente de verdad para lógica de roles.
 * Usar `hasPermission()` y `canAccess()` en lugar de comparaciones inline.
 *
 * @layer core/config
 */

import { ROLES } from './app.config'

// ─── Jerarquía de Roles ───────────────────────────────────────────────────────
// El admin hereda los permisos de todos los roles inferiores.

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.GESTOR]: 3,
  [ROLES.OPERADOR]: 2,
  [ROLES.USUARIO]: 1,
}

// ─── Permisos por Módulo ─────────────────────────────────────────────────────

export const PERMISSIONS = {
  // Gestión de usuarios
  users: {
    view: [ROLES.ADMIN],
    create: [ROLES.ADMIN],
    edit: [ROLES.ADMIN],
    delete: [ROLES.ADMIN],
  },
  // Gestión de eventos
  events: {
    view: [ROLES.ADMIN, ROLES.GESTOR, ROLES.OPERADOR, ROLES.USUARIO],
    create: [ROLES.ADMIN, ROLES.GESTOR],
    edit: [ROLES.ADMIN, ROLES.GESTOR],
    delete: [ROLES.ADMIN],
  },
  // Gestión de tickets
  tickets: {
    purchase: [ROLES.USUARIO],
    validate: [ROLES.ADMIN, ROLES.OPERADOR],
    manage: [ROLES.ADMIN, ROLES.GESTOR],
  },
  // Panel de administración
  admin: {
    access: [ROLES.ADMIN],
  },
  // Dashboard de gestor
  manager: {
    access: [ROLES.ADMIN, ROLES.GESTOR],
  },
  // Panel de staff
  staff: {
    access: [ROLES.ADMIN, ROLES.OPERADOR],
  },
}

// ─── Funciones de Autorización ───────────────────────────────────────────────

/**
 * Verifica si un rol tiene permiso para realizar una acción en un módulo.
 * @param {string} role - Rol del usuario actual
 * @param {string} module - Módulo a verificar (ej: 'events')
 * @param {string} action - Acción a verificar (ej: 'create')
 * @returns {boolean}
 */
export const hasPermission = (role, module, action) => {
  if (!role || !PERMISSIONS[module] || !PERMISSIONS[module][action]) return false
  return PERMISSIONS[module][action].includes(role)
}

/**
 * Verifica si un rol puede acceder a una lista de roles permitidos.
 * Equivalente al prop `allowedRoles` en ProtectedRoute.
 * @param {string} userRole - Rol del usuario actual
 * @param {string[]} allowedRoles - Roles permitidos para la ruta
 * @returns {boolean}
 */
export const canAccess = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(userRole)
}

/**
 * Retorna el label visible de un rol.
 * @param {string} role
 * @returns {string}
 */
export const getRoleLabel = (role) => {
  const labels = {
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.GESTOR]: 'Gestor de Eventos',
    [ROLES.OPERADOR]: 'Operador',
    [ROLES.USUARIO]: 'Usuario',
  }
  return labels[role] || 'Desconocido'
}

export default PERMISSIONS
