/**
 * @file features/events/index.js
 * @description Barrel del módulo de eventos.
 *
 * REGLA: Solo se exporta lo que otros módulos NECESITAN consumir.
 * Lo interno del feature permanece encapsulado.
 *
 * @layer features/events
 */

// Hooks
export { default as useEvents } from './hooks/useEvents'
export { default as useEventDetail } from './hooks/useEventDetail'
