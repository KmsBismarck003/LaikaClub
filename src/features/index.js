/**
 * @file features/index.js
 * @description Barrel global de la capa de features.
 *
 * Punto de entrada unificado para todos los módulos de dominio.
 *
 * REGLA ARQUITECTÓNICA:
 * - Importar desde 'features/<dominio>' o desde 'features' (este barrel)
 * - NUNCA importar directamente desde 'features/<dominio>/hooks/<archivo>'
 *   en código fuera de la carpeta features/
 *
 * @layer features
 */

// ─── Módulo Auth ──────────────────────────────────────────────────────────────
export * from './auth'

// ─── Módulo Eventos ───────────────────────────────────────────────────────────
export * from './events'

// ─── Módulo Usuario ───────────────────────────────────────────────────────────
export * from './user'

// ─── Módulo Admin ─────────────────────────────────────────────────────────────
export * from './admin'

// ─── Módulo Manager ───────────────────────────────────────────────────────────
export * from './manager'

// ─── Módulo Staff ─────────────────────────────────────────────────────────────
export * from './staff'
