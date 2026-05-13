/**
 * @file features/user/hooks/useRefunds.js
 * @description Hook de dominio para el tracker de reembolsos del usuario.
 *
 * Extrae la lógica de RefundTracker.jsx (17K líneas).
 *
 * @layer features/user
 */

import { useState, useEffect, useCallback } from 'react'
import { refundAPI } from '../../../services'
import { useAuth, useNotification } from '../../../context'

/**
 * Estado posibles de un reembolso
 */
export const REFUND_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
}

/**
 * Hook para gestión de reembolsos del usuario actual.
 * @returns {{
 *   refunds: Object[],
 *   loading: boolean,
 *   error: string|null,
 *   requesting: boolean,
 *   submitRefundRequest: Function,
 *   refresh: Function,
 *   activeFilter: string,
 *   setActiveFilter: Function,
 *   filteredRefunds: Object[]
 * }}
 */
const useRefunds = () => {
  const { user } = useAuth()
  const { notify } = useNotification()

  const [refunds, setRefunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requesting, setRequesting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchRefunds = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const data = await refundAPI.getMyRefunds()
      setRefunds(Array.isArray(data) ? data : data.refunds || [])
    } catch (err) {
      const message = err.message || 'Error al cargar reembolsos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchRefunds()
  }, [fetchRefunds])

  const submitRefundRequest = useCallback(async (ticketId, reason, detail = '') => {
    try {
      setRequesting(true)
      await refundAPI.requestRefund({ ticketId, reason, detail, userId: user.id })
      notify('Solicitud de reembolso enviada exitosamente', 'success')
      await fetchRefunds()
      return { success: true }
    } catch (err) {
      const message = err.message || 'Error al procesar la solicitud'
      notify(message, 'error')
      return { success: false, error: message }
    } finally {
      setRequesting(false)
    }
  }, [user, notify, fetchRefunds])

  const filteredRefunds = refunds.filter(refund => {
    if (activeFilter === 'all') return true
    return refund.status === activeFilter
  })

  return {
    refunds,
    loading,
    error,
    requesting,
    submitRefundRequest,
    refresh: fetchRefunds,
    activeFilter,
    setActiveFilter,
    filteredRefunds,
  }
}

export default useRefunds
