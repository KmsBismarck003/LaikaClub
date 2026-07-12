import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, AdCarousel, Icon, Pagination } from '../../components'
import api from '../../services/api'
import { SkeletonEventCard, SkeletonHero } from '../../components/Skeleton/Skeleton'
import { useNotification } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useSkeletonContext } from '../../context/SkeletonContext'

// Home sub-components
import CategoryFilter from './components/CategoryFilter/CategoryFilter'
import EventsGrid    from './components/EventsGrid/EventsGrid'
import DiscoverySection from './components/DiscoverySection/DiscoverySection'
import { ShopCtaBanner } from './components/HomeShopSection/HomeShopSection'

import './Home.css'

/* ─── Constants ─── */
const CATEGORIES = [
  { id: 'all',      name: 'Todos',      icon: 'grid'     },
  { id: 'concert',  name: 'Conciertos', icon: 'music'    },
  { id: 'sport',    name: 'Deportes',   icon: 'sport'    },
  { id: 'theater',  name: 'Teatro',     icon: 'theater'  },
  { id: 'festival', name: 'Festivales', icon: 'festival' },
  { id: 'family',   name: 'Familiares', icon: 'heart'    },
  { id: 'other',    name: 'Otros',      icon: 'sparkles' },
]

const BADGE_VARIANTS = {
  concert:  'primary',
  sport:    'success',
  theater:  'error',
  festival: 'warning',
  other:    'secondary',
}

const ITEMS_PER_PAGE = 4

/* ─── Helpers ─── */
const formatDate = dateString => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

const formatTime = time => {
  if (!time) return ''
  const s = String(time)
  return s.includes(':') ? s.substring(0, 5) : s
}

const getCategoryInfo = id =>
  CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]

/* ═══════════════════════════════════════════════════════════════
   HOME COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { error: showError } = useNotification()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { showSkeleton: loading, startLoading, stopLoading } = useSkeletonContext()

  const eventsSectionRef = useRef(null)

  /* ─── State ─── */
  const [events,         setEvents]         = useState([])
  const [ads,            setAds]            = useState([])
  const [searchTerm,     setSearchTerm]     = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage,    setCurrentPage]    = useState(1)
  const [error,          setError]          = useState(null)
  const [recentlyViewed, setRecentlyViewed] = useState([])

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
        api.event.getPublic({ limit: 50 }),
        api.ads.getPublic(),
      ])
      setEvents(eventsRes || [])
      setAds(adsRes || [])
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

  /* ─── Filtered events ─── */
  const filteredEvents = useMemo(() => {
    let list = events.filter(e => e.status === 'published')

    if (selectedCategory !== 'all')
      list = list.filter(e => e.category === selectedCategory)

    if (searchTerm) {
      const t = searchTerm.toLowerCase()
      list = list.filter(e =>
        e.name.toLowerCase().includes(t) ||
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

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredEvents, currentPage])

  const showLeftSidebar = useMemo(() => {
    return loading || ads.some(ad => ad.position === 'side_left' && ad.active);
  }, [loading, ads]);

  const showRightSidebar = useMemo(() => {
    return loading || ads.some(ad => ad.position === 'side_right' && ad.active);
  }, [loading, ads]);

  /* ─── Render ─── */
  return (
    <div className="home">
      {/* Hero / Ad Carousel */}
      {loading ? <SkeletonHero /> : <AdCarousel position="main" isLoading={loading} preloadedAds={ads} />}

      <div className={`home-layout ${!showLeftSidebar ? 'no-left-sidebar' : ''} ${!showRightSidebar ? 'no-right-sidebar' : ''}`}>
        {/* Left sidebar ad */}
        {showLeftSidebar && (
          <aside className={`home-sidebar home-sidebar--left ${loading ? 'loading' : ''}`}>
            <AdCarousel position="side_left" isLoading={loading} preloadedAds={ads} />
          </aside>
        )}

        {/* ── MAIN CONTENT ── */}
        <main className="home-main">
          {/* Category filters */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Loading skeleton */}
          {loading ? (
            <div className="events-grid">
              {[1, 2, 3, 4].map(i => <SkeletonEventCard key={i} />)}
            </div>
          ) : error && events.length === 0 ? (
            /* ── Error state ── */
            <div className="home-error-view">
              <div className="error-code">ERROR</div>
              <Icon name="alertTriangle" size={72} className="error-icon" />
              <h2 className="error-title">Ups, algo salió mal</h2>
              <p className="error-message">{error}</p>
              <div className="error-actions">
                <Button variant="primary"   size="large" onClick={() => fetchInitialData()}>Reintentar</Button>
                <Button variant="secondary" size="large" onClick={() => navigate(-1)}>Regresar</Button>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            /* ── Empty state ── */
            <div className="events-empty">
              <Icon name="searchEmpty" size={56} className="events-empty-icon" />
              <h3 className="events-empty-title">No se encontraron eventos</h3>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all') }}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            /* ── Events grid ── */
            <>
              <div ref={eventsSectionRef}>
                <EventsGrid
                  paginatedEvents={paginatedEvents}
                  filteredEvents={filteredEvents}
                  selectedCategory={selectedCategory}
                  getCategoryInfo={getCategoryInfo}
                  BADGE_VARIANTS={BADGE_VARIANTS}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  navigate={navigate}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  eventsSectionRef={eventsSectionRef}
                />
              </div>

              {/* Shop CTA Banner */}
              <ShopCtaBanner onNavigate={() => navigate('/shop')} />

              {/* Inline ad */}
              <AdCarousel position="inline_1" isLoading={loading} preloadedAds={ads} />

              {/* Discovery sections */}
              <DiscoverySection
                recentlyViewed={recentlyViewed}
                events={events}
                navigate={navigate}
              />

              {/* Inline ad 2 */}
              <AdCarousel position="inline_2" isLoading={loading} preloadedAds={ads} />
            </>
          )}
        </main>

        {/* Right sidebar ad */}
        {showRightSidebar && (
          <aside className={`home-sidebar home-sidebar--right ${loading ? 'loading' : ''}`}>
            <AdCarousel position="side_right" isLoading={loading} preloadedAds={ads} />
          </aside>
        )}
      </div>
    </div>
  )
}

export default Home
