/**
 * @file features/user/hooks/useAchievements.js
 * @description Hook de dominio para el sistema de logros del usuario.
 *
 * ANTES: toda la lógica vivía dentro de Achievements.jsx (17K líneas).
 * DESPUÉS: la UI en pages/user/Achievements.jsx es ligera (<80 líneas),
 * y toda la lógica vive aquí.
 *
 * PRINCIPIO SOLID — S: separación total UI / lógica.
 *
 * @layer features/user
 */

import { useState, useEffect, useCallback } from 'react'
import { achievementsAPI } from '../../../services'
import { useAuth, useNotification } from '../../../context'

/**
 * @typedef {Object} Achievement
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {boolean} unlocked
 * @property {number} progress      - 0 a 100
 * @property {string} category
 * @property {string|null} unlockedAt
 */

/**
 * Hook para el sistema de logros del usuario autenticado.
 * @returns {{
 *   achievements: Achievement[],
 *   coupons: Object[],
 *   stats: Object,
 *   loading: boolean,
 *   error: string|null,
 *   activeFilter: string,
 *   setActiveFilter: Function,
 *   filteredAchievements: Achievement[],
 *   refresh: Function
 * }}
 */
const useAchievements = () => {
  const { user } = useAuth()
  const { notify } = useNotification()

  const [achievements, setAchievements] = useState([])
  const [coupons, setCoupons] = useState([])
  const [stats, setStats] = useState({ total: 0, unlocked: 0, percentage: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchAchievements = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)

      const [achievementsData, couponsData] = await Promise.allSettled([
        achievementsAPI.getAll(),
        achievementsAPI.getCoupons(),
      ])

      let totalPoints = 0
      let list = []

      if (achievementsData.status === 'fulfilled') {
        const data = achievementsData.value
        // If the API returns { total_points: X, achievements: [...] } or just an array
        if (data && !Array.isArray(data)) {
          totalPoints = data.total_points || 0
          list = data.achievements || []
        } else if (Array.isArray(data)) {
          list = data
        }
        
        setAchievements(list)

        const unlocked = list.filter(a => a.unlocked).length
        setStats({
          total: list.length,
          unlocked,
          percentage: list.length > 0 ? Math.round((unlocked / list.length) * 100) : 0,
          totalPoints
        })
      } else {
        setError('No se pudieron cargar los logros')
      }

      if (couponsData.status === 'fulfilled') {
        const couponList = Array.isArray(couponsData.value)
          ? couponsData.value
          : couponsData.value?.coupons || []
        setCoupons(couponList)
      }
    } catch (err) {
      const message = err.message || 'Error al cargar logros'
      setError(message)
      notify(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [user, notify])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  // Filtrado en memoria — evita peticiones extra
  const filteredAchievements = achievements.filter(achievement => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unlocked') return achievement.unlocked
    if (activeFilter === 'locked') return !achievement.unlocked
    return achievement.category === activeFilter
  })

  return {
    achievements,
    coupons,
    stats,
    loading,
    error,
    activeFilter,
    setActiveFilter,
    filteredAchievements,
    refresh: fetchAchievements,
  }
}

export default useAchievements
