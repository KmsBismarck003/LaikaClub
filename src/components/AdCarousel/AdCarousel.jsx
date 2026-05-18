import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../../utils/imageUtils' // Added
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { SkeletonAd } from '../Skeleton/Skeleton.jsx'
import Icon from '../Icons/Icons' // Added
import './AdCarousel.css'

const AdCarousel = ({ position, isLoading: externalLoading, preloadedAds, eventId }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ads, setAds] = useState(preloadedAds || [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [internalLoading, setInternalLoading] = useState(!preloadedAds)

  const loading = externalLoading !== undefined ? externalLoading : internalLoading

  // Responsive check for side banners
  useEffect(() => {
    if (position.startsWith('side')) {
      const checkVisibility = () => {
        // Show side banners only on large screens (> 1200px)
        setVisible(window.innerWidth >= 1200)
      }

      checkVisibility()
      window.addEventListener('resize', checkVisibility)
      return () => window.removeEventListener('resize', checkVisibility)
    }
  }, [position])

  useEffect(() => {
    // If ads are preloaded, don't fetch internally
    if (preloadedAds) {
      let filtered = preloadedAds.filter(ad => ad.position === position)
      if (eventId) {
        filtered = filtered.filter(ad => String(ad.event_id) === String(eventId))
      }
      setAds(filtered)
      setInternalLoading(false)
      return
    }

    const fetchAds = async () => {
      try {
        setInternalLoading(true)
        const allAds = await api.ads.getPublic()
        // Filter by position
        let filtered = allAds.filter(ad => ad.position === position)
        if (eventId) {
          filtered = filtered.filter(ad => String(ad.event_id) === String(eventId))
        }
        setAds(filtered)
      } catch (error) {
        console.error(`Error loading ads for ${position}:`, error)
      } finally {
        setInternalLoading(false)
      }
    }

    if (visible) {
      fetchAds()
    }
  }, [position, visible, preloadedAds, eventId])

  // Auto-play
  useEffect(() => {
    if (ads.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [ads])

  if (!visible) return null

  if (loading) {
    return <SkeletonAd position={position} />
  }

  if (ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex]

  const handleAdClick = (ad) => {
    if (ad) {
      // Register click in backend (Fire and forget)
      api.ads.registerClick(ad.id, user?.id).catch(err => console.error('Click error:', err))

      // If ad is directly linked to an event, navigate to it
      if (ad.event_id) {
        navigate(`/event/${ad.event_id}`)
      } else if (ad.link_url) {
        const link = ad.link_url.trim()
        
        // Handle internal relative paths
        if (link.startsWith('/')) {
          const normalizedLink = link.replace(/^\/events\//, '/event/')
          navigate(normalizedLink)
        } 
        // Handle full external URLs
        else if (link.startsWith('http')) {
          window.open(link, '_blank', 'noopener,noreferrer')
        }
        // Fallback for simple strings that might be event IDs (shared behavior)
        else {
          navigate(`/event/${link}`)
        }
      }
    }
  }

  const isVertical = position.startsWith('side')

  return (
    <div className={`ad-carousel ${position} ${isVertical ? 'vertical' : 'horizontal'}`}>
      <div
        className="ad-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: ads.length > 1 ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
        }}
      >
        {ads.map((ad, index) => (
          <div
            key={ad.id || index}
            className="ad-slide"
            onClick={() => handleAdClick(ad)}
            style={{ cursor: ad.link_url ? 'pointer' : 'default' }}
          >
            <img src={getImageUrl(ad.image_url)} alt={ad.title} />
            
            {/* Info Bar */}
            <div className="ad-bottom-bar">
              <div className="ad-info-main">
                <span className="ad-label-alt">
                  {ad.event_id ? "VER EVENTO" : ad.link_url ? "MÁS INFORMACIÓN" : "SOCIO OFICIAL"}
                </span>
                <h4 className="ad-title-alt">{ad.title}</h4>
              </div>
              <div className="ad-action-btn">
                <Icon name={(ad.event_id || ad.link_url) ? "arrowRight" : "plus"} size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {ads.length > 1 && (
        <div className="ad-indicators">
          {ads.map((_, idx) => (
            <span
              key={idx}
              className={`indicator ${idx === currentIndex ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(idx)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AdCarousel
