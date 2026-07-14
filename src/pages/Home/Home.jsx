import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Icon } from '../../components'
import { SkeletonEventCard, SkeletonHero } from '../../components/Skeleton/Skeleton'
import useHomeEvents from './hooks/useHomeEvents'

// Home sub-components
import HeroSection      from './components/HeroSection/HeroSection'
import CategoryFilter   from './components/CategoryFilter/CategoryFilter'
import EventsGrid       from './components/EventsGrid/EventsGrid'
import DiscoverySection from './components/DiscoverySection/DiscoverySection'
import NativeAdBanner   from './components/NativeAdBanner/NativeAdBanner'
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

const getCategoryInfo = id =>
  CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]

/* ═══════════════════════════════════════════════════════════════
   HOME COMPONENT — orchestrator only, no business logic here
   ═══════════════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate()
  const eventsSectionRef = useRef(null)

  const {
    ads,
    featuredEvents,
    filteredEvents,
    paginatedEvents,
    recentlyViewed,
    selectedCategory,
    setSelectedCategory,
    currentPage,
    setCurrentPage,
    totalPages,
    loading,
    error,
    clearFilters,
    fetchInitialData,
  } = useHomeEvents()

  return (
    <div className="home">

      {/* ── Hero: cinematic event carousel ── */}
      {loading
        ? <SkeletonHero />
        : <HeroSection featuredEvents={featuredEvents} />
      }

      {/* ── Main content area ── */}
      <div className="home-main">

        {/* Category filter chips */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Loading state */}
        {loading ? (
          <div className="events-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonEventCard key={i} />)}
          </div>

        ) : error && filteredEvents.length === 0 ? (
          /* Error state */
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
          /* Empty state */
          <div className="events-empty">
            <Icon name="searchEmpty" size={56} className="events-empty-icon" />
            <h3 className="events-empty-title">No se encontraron eventos</h3>
            <Button onClick={clearFilters}>Limpiar filtros</Button>
          </div>

        ) : (
          /* Events + discovery */
          <>
            <div ref={eventsSectionRef}>
              <EventsGrid
                paginatedEvents={paginatedEvents}
                filteredEvents={filteredEvents}
                selectedCategory={selectedCategory}
                getCategoryInfo={getCategoryInfo}
                navigate={navigate}
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                eventsSectionRef={eventsSectionRef}
              />
            </div>

            <NativeAdBanner position="inline_1" ads={ads} isLoading={loading} />

            <ShopCtaBanner onNavigate={() => navigate('/shop')} />

            <DiscoverySection
              recentlyViewed={recentlyViewed}
              events={filteredEvents}
              navigate={navigate}
            />

            <NativeAdBanner position="inline_2" ads={ads} isLoading={loading} />
          </>
        )}
      </div>
    </div>
  )
}

export default Home
