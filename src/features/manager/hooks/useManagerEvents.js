/**
 * @file features/manager/hooks/useManagerEvents.js
 * @description Hook de dominio para el gestor de eventos del rol Manager.
 *
 * @layer features/manager
 */

import { useState, useEffect, useCallback } from 'react'
import { managerAPI, eventAPI } from '../../../services'
import { useAuth, useNotification } from '../../../context'

/**
 * Hook para la gestión de eventos del manager autenticado.
 * @returns {{
 *   events: Object[],
 *   loading: boolean,
 *   error: string|null,
 *   createEvent: Function,
 *   updateEvent: Function,
 *   cancelEvent: Function,
 *   refresh: Function
 * }}
 */
const useManagerEvents = () => {
  const { user } = useAuth()
  const { notify } = useNotification()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const data = await managerAPI.getManagerEvents(user.id)
      setEvents(Array.isArray(data) ? data : data.events || [])
    } catch (err) {
      const message = err.message || 'Error al cargar eventos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const createEvent = useCallback(async (eventData) => {
    try {
      await eventAPI.create(eventData)
      notify('Evento creado exitosamente', 'success')
      await fetchEvents()
      return { success: true }
    } catch (err) {
      notify(err.message || 'Error al crear el evento', 'error')
      return { success: false, error: err.message }
    }
  }, [notify, fetchEvents])

  const updateEvent = useCallback(async (eventId, eventData) => {
    try {
      await eventAPI.update(eventId, eventData)
      notify('Evento actualizado exitosamente', 'success')
      await fetchEvents()
      return { success: true }
    } catch (err) {
      notify(err.message || 'Error al actualizar el evento', 'error')
      return { success: false, error: err.message }
    }
  }, [notify, fetchEvents])

  const cancelEvent = useCallback(async (eventId, reason) => {
    try {
      await managerAPI.cancelEvent(eventId, { reason })
      notify('Evento cancelado', 'warning')
      await fetchEvents()
      return { success: true }
    } catch (err) {
      notify(err.message || 'Error al cancelar el evento', 'error')
      return { success: false, error: err.message }
    }
  }, [notify, fetchEvents])

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    cancelEvent,
    refresh: fetchEvents,
  }
}

export default useManagerEvents
