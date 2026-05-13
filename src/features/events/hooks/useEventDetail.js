/**
 * @file features/events/hooks/useEventDetail.js
 * @description Hook para cargar y gestionar el detalle de un evento.
 *
 * @layer features/events
 */

import { useState, useEffect, useCallback } from 'react'
import { eventAPI } from '../../../services'
import { useNotification } from '../../../context'

/**
 * Hook para el detalle de un evento específico.
 * @param {string|number} eventId - ID del evento
 * @returns {{ event, loading, error, refresh }}
 */
const useEventDetail = (eventId) => {
  const { notify } = useNotification()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDetail = useCallback(async () => {
    if (!eventId) return
    try {
      setLoading(true)
      setError(null)
      const data = await eventAPI.getById(eventId)
      setEvent(data)
    } catch (err) {
      const message = err.message || 'Error al cargar el evento'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [eventId, notify])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  return { event, loading, error, refresh: fetchDetail }
}

export default useEventDetail
