/**
 * @file features/admin/hooks/useAdminDashboard.js
 * @description Hook de dominio para el dashboard de administración.
 *
 * Centraliza las llamadas a métricas del sistema que múltiples
 * componentes del módulo admin necesitan.
 *
 * @layer features/admin
 */

import { useState, useEffect, useCallback } from 'react'
import { monitoringAPI, databaseAPI, adminUsersAPI, eventAPI } from '../../../services'
import { useNotification } from '../../../context'

/**
 * @typedef {Object} DashboardMetrics
 * @property {{ total: number, active: number, locked: number }} users
 * @property {{ total: number, upcoming: number, active: number }} events
 * @property {{ status: string, connections: number, size: string }} database
 * @property {{ cpu: number, memory: number, uptime: number }} system
 */

/**
 * Hook para las métricas globales del panel de administración.
 * @returns {{
 *   metrics: DashboardMetrics,
 *   loading: boolean,
 *   error: string|null,
 *   lastUpdated: Date|null,
 *   refresh: Function
 * }}
 */
const useAdminDashboard = () => {
  const { notify } = useNotification()

  const [metrics, setMetrics] = useState({
    users: { total: 0, active: 0, locked: 0 },
    events: { total: 0, upcoming: 0, active: 0 },
    database: { status: 'unknown', connections: 0, size: '—' },
    system: { cpu: 0, memory: 0, uptime: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Peticiones paralelas — si una falla, las demás siguen
      const [usersResult, eventsResult, dbResult, monitorResult] = await Promise.allSettled([
        adminUsersAPI.getAll(),
        eventAPI.getAll(),
        databaseAPI.getStatus(),
        monitoringAPI.getSystemStats(),
      ])

      const newMetrics = { ...metrics }

      if (usersResult.status === 'fulfilled') {
        const users = Array.isArray(usersResult.value)
          ? usersResult.value
          : usersResult.value?.users || []
        newMetrics.users = {
          total: users.length,
          active: users.filter(u => !u.locked && u.is_active !== false).length,
          locked: users.filter(u => u.locked).length,
        }
      }

      if (eventsResult.status === 'fulfilled') {
        const events = Array.isArray(eventsResult.value)
          ? eventsResult.value
          : eventsResult.value?.events || []
        const now = new Date()
        newMetrics.events = {
          total: events.length,
          upcoming: events.filter(e => new Date(e.date) > now).length,
          active: events.filter(e => e.status === 'active').length,
        }
      }

      if (dbResult.status === 'fulfilled') {
        newMetrics.database = {
          status: dbResult.value?.status || 'online',
          connections: dbResult.value?.connections || 0,
          size: dbResult.value?.size || '—',
        }
      }

      if (monitorResult.status === 'fulfilled') {
        newMetrics.system = {
          cpu: monitorResult.value?.cpu_usage || 0,
          memory: monitorResult.value?.memory_usage || 0,
          uptime: monitorResult.value?.uptime || 0,
        }
      }

      setMetrics(newMetrics)
      setLastUpdated(new Date())
    } catch (err) {
      const message = 'Error al cargar métricas del sistema'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    fetchMetrics()
    // Auto-refresh cada 60 segundos para métricas en tiempo real
    const interval = setInterval(fetchMetrics, 60000)
    return () => clearInterval(interval)
  }, [fetchMetrics])

  return { metrics, loading, error, lastUpdated, refresh: fetchMetrics }
}

export default useAdminDashboard
