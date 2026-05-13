/**
 * @file core/index.js
 * @description Punto de entrada de la capa Core.
 * 
 * Exporta toda la configuración global del sistema.
 * Los imports desde fuera deben usar '@/core' o '../core' según alias.
 * 
 * @layer core
 */

export * from './config/app.config'
export * from './config/roles.config'

export { default as APP_CONFIG } from './config/app.config'
export { default as PERMISSIONS } from './config/roles.config'
