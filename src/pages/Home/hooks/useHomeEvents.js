import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../../services/api'
import { useSkeletonContext } from '../../../context/SkeletonContext'

import { useAuth } from '../../../context/AuthContext'
import { analyticsAPI } from '../../../services/miscService'

const ITEMS_PER_PAGE = 8

export const formatDate = dateString => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export const formatTime = time => {
  if (!time) return ''
  const s = String(time)
  return s.includes(':') ? s.substring(0, 5) : s
}

const useHomeEvents = () => {
  const [searchParams] = useSearchParams()
  const { showSkeleton: loading, startLoading, stopLoading } = useSkeletonContext()

  const [events,          setEvents]          = useState([])
  const [ads,             setAds]             = useState([])
  const [searchTerm,      setSearchTerm]      = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [currentPage,     setCurrentPage]     = useState(1)
  const [error,           setError]           = useState(null)
  const [recentlyViewed,  setRecentlyViewed]  = useState([])
  const [mlRecommendations, setMlRecommendations] = useState([])
  const { user } = useAuth()

  /* ─── Sync URL params ─── */
  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '')
    setSelectedCategory(searchParams.get('category') || 'all')
  }, [searchParams])

  /* ─── Data fetch ─── */
  const fetchInitialData = useCallback(async (background = false) => {
    if (!background) startLoading('home_data')
    try {
      const [eventsRes, adsRes] = await Promise.all([
        api.event.getPublic({ limit: 100 }),
        api.ads.getPublic(),
      ])
      
      let recsRes = []
      if (user?.id) {
        try {
          const recsData = await analyticsAPI.getUserRecommendations(user.id, 4)
          recsRes = recsData?.recommendations || []
        } catch (e) { console.warn("No ML recommendations available") }
      }
      
      setEvents(eventsRes || [])
      setAds(adsRes || [])
      setMlRecommendations(recsRes)
      setError(null)
    } catch (err) {
      console.error('Error al cargar datos de Inicio:', err)
      if (!background) {
        setError('No se pudieron cargar los datos. Verifica tu conexión.')
        setEvents([])
        setAds([])
      }
    } finally {
      if (!background) stopLoading('home_data')
    }
  }, [startLoading, stopLoading])

  useEffect(() => {
    fetchInitialData()
    const interval = setInterval(() => fetchInitialData(true), 120_000)

    const loadRecent = () => {
      setRecentlyViewed(JSON.parse(localStorage.getItem('recently_viewed') || '[]'))
    }
    loadRecent()
    window.addEventListener('storage', loadRecent)
    window.addEventListener('recentlyViewedUpdated', loadRecent)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', loadRecent)
      window.removeEventListener('recentlyViewedUpdated', loadRecent)
    }
  }, [fetchInitialData])

  /* ─── Reset page on filter change ─── */
  useEffect(() => { setCurrentPage(1) }, [searchTerm, selectedCategory])

  // Refetch if user changes
  useEffect(() => {
    if (user?.id) fetchInitialData(true)
  }, [user?.id, fetchInitialData])

  /* ─── Derived state ─── */
  const filteredEvents = useMemo(() => {
    let list = events.filter(e => e.status === 'published')

    if (selectedCategory !== 'all')
      list = list.filter(e => e.category === selectedCategory)

    if (searchTerm) {
      const t = searchTerm.toLowerCase()
      list = list.filter(e =>
        e.name?.toLowerCase().includes(t) ||
        e.description?.toLowerCase().includes(t) ||
        e.location?.toLowerCase().includes(t) ||
        e.venue?.toLowerCase().includes(t) ||
        e.state_name?.toLowerCase().includes(t) ||
        e.municipality_name?.toLowerCase().includes(t)
      )
    }

    const cityParam = searchParams.get('city')
    if (cityParam && cityParam !== 'Todo México') {
      const city = cityParam.toLowerCase()
      list = list.filter(e =>
        e.location?.toLowerCase().includes(city) ||
        e.venue?.toLowerCase().includes(city) ||
        e.state_name?.toLowerCase().includes(city) ||
        e.municipality_name?.toLowerCase().includes(city)
      )
    }

    return list
  }, [events, selectedCategory, searchTerm, searchParams])

  const featuredEvents = useMemo(() =>
    events.filter(e => e.status === 'published').slice(0, 5),
  [events])

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredEvents, currentPage])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedCategory('all')
  }, [])

  return {
    /* state */
    events,
    ads,
    featuredEvents,
    filteredEvents,
    paginatedEvents,
    recentlyViewed,
    mlRecommendations,
    searchTerm,
    selectedCategory,
    currentPage,
    totalPages,
    loading,
    error,
    /* actions */
    setSearchTerm,
    setSelectedCategory,
    setCurrentPage,
    clearFilters,
    fetchInitialData,
    ITEMS_PER_PAGE,
  }
}

export default useHomeEvents
