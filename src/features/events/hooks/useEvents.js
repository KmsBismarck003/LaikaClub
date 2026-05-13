/**
 * @file features/events/hooks/useEvents.js
 * @description Hook de dominio para listado y filtrado de eventos.
 *
 * RESPONSABILIDAD ÚNICA: Este hook gestiona el estado y lógica de la
 * lista de eventos. NO renderiza nada — solo provee datos y acciones.
 *
 * PRINCIPIO SOLID — S: un hook = una responsabilidad.
 * PRINCIPIO SOLID — D: depende de eventAPI (abstracción), no de fetch.
 *
 * @layer features/events
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { eventAPI } from '../../../services'
import { useNotification } from '../../../context'
import { useDebounce } from '../../../hooks'

/**
 * @typedef {Object} EventsState
 * @property {Array}   events          - Lista de eventos
 * @property {boolean} loading         - Estado de carga
 * @property {string|null} error       - Mensaje de error, si existe
 * @property {Object} filters          - Filtros activos
 * @property {Function} setFilters     - Actualizar filtros
 * @property {Function} refresh        - Recargar datos
 * @property {number} total            - Total de eventos (para paginación)
 */

/**
 * Hook para gestión de la lista de eventos.
 * @param {Object} initialFilters - Filtros iniciales de búsqueda
 * @returns {EventsState}
 */
const useEvents = (initialFilters = {}) => {
  const { notify } = useNotification()
  const abortRef = useRef(null)

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1,
    pageSize: 12,
    sortBy: 'date',
    sortOrder: 'asc',
    ...initialFilters,
  })

  // Evita búsquedas en cada keystroke
  const debouncedSearch = useDebounce(filters.search, 400)

  const fetchEvents = useCallback(async () => {
    // Cancelar petición anterior si existe
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)

      const params = {
        ...filters,
        search: debouncedSearch,
      }

      const response = await eventAPI.getAll(params)

      // Normalización de respuesta: soporta { events: [], total: N } o []
      if (Array.isArray(response)) {
        setEvents(response)
        setTotal(response.length)
      } else {
        setEvents(response.events || response.data || [])
        setTotal(response.total || 0)
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      const message = err.message || 'Error al cargar eventos'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, debouncedSearch, notify])

  useEffect(() => {
    fetchEvents()
    return () => abortRef.current?.abort()
  }, [fetchEvents])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset a página 1 si cambia cualquier filtro que no sea la página
      page: 'page' in newFilters ? newFilters.page : 1,
    }))
  }, [])

  return {
    events,
    loading,
    error,
    total,
    filters,
    setFilters: updateFilters,
    refresh: fetchEvents,
  }
}

export default useEvents
