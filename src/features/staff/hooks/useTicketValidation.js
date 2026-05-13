/**
 * @file features/staff/hooks/useTicketValidation.js
 * @description Hook de dominio para la validación de tickets en puerta.
 *
 * Encapsula toda la lógica de escaneo QR, validación contra API
 * y manejo del flujo de acceso para el staff operativo.
 *
 * @layer features/staff
 */

import { useState, useCallback, useRef } from 'react'
import { ticketAPI } from '../../../services'
import { useNotification } from '../../../context'

/**
 * @typedef {'idle'|'scanning'|'validating'|'success'|'error'} ValidationState
 */

/**
 * Hook para el flujo de validación de tickets del staff.
 * @returns {{
 *   state: ValidationState,
 *   lastResult: Object|null,
 *   scanHistory: Object[],
 *   validateTicket: Function,
 *   reset: Function,
 *   clearHistory: Function
 * }}
 */
const useTicketValidation = () => {
  const { notify } = useNotification()
  const cooldownRef = useRef(false) // Previene double-scan

  const [state, setState] = useState('idle')
  const [lastResult, setLastResult] = useState(null)
  const [scanHistory, setScanHistory] = useState([])

  /**
   * Valida un ticket escaneado.
   * @param {string} ticketCode - Código QR del ticket
   * @param {string|number} eventId - ID del evento activo
   */
  const validateTicket = useCallback(async (ticketCode, eventId) => {
    // Anti double-scan: ignora si ya está procesando
    if (cooldownRef.current || state === 'validating') return
    if (!ticketCode || !eventId) {
      notify('Código de ticket o evento no válido', 'error')
      return
    }

    cooldownRef.current = true
    setState('validating')

    try {
      const result = await ticketAPI.validateTicket({ ticketCode, eventId })

      const scanRecord = {
        id: Date.now(),
        code: ticketCode,
        timestamp: new Date().toISOString(),
        success: result.valid,
        holder: result.holder_name || result.holder || 'Desconocido',
        message: result.message || (result.valid ? 'Acceso autorizado' : 'Acceso denegado'),
      }

      setLastResult(scanRecord)
      setScanHistory(prev => [scanRecord, ...prev].slice(0, 50)) // Máximo 50 en historial
      setState(result.valid ? 'success' : 'error')

      if (result.valid) {
        notify(`✅ Acceso autorizado — ${scanRecord.holder}`, 'success')
      } else {
        notify(`❌ ${scanRecord.message}`, 'error')
      }
    } catch (err) {
      const errorRecord = {
        id: Date.now(),
        code: ticketCode,
        timestamp: new Date().toISOString(),
        success: false,
        holder: '—',
        message: err.message || 'Error de validación',
      }
      setLastResult(errorRecord)
      setState('error')
      notify(errorRecord.message, 'error')
    } finally {
      // Cooldown de 2s para evitar doble escaneo del mismo QR
      setTimeout(() => {
        cooldownRef.current = false
        setState('idle')
      }, 2000)
    }
  }, [state, notify])

  const reset = useCallback(() => {
    setState('idle')
    setLastResult(null)
    cooldownRef.current = false
  }, [])

  const clearHistory = useCallback(() => {
    setScanHistory([])
  }, [])

  return {
    state,
    lastResult,
    scanHistory,
    validateTicket,
    reset,
    clearHistory,
  }
}

export default useTicketValidation
