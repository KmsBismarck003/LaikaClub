import React from 'react';
import { AdCarousel } from '../../../../components';
import './NativeAdBanner.css';

/**
 * NativeAdBanner — replaces the old sidebar/inline ad system.
 * Renders ads as an integrated full-width banner between sections,
 * labeled discreetly. Renders nothing when no ads are available.
 */
const NativeAdBanner = ({ position, ads, isLoading }) => {
  const hasAds = isLoading || ads?.some(ad => ad.position === position && ad.active);
  if (!hasAds) return null;

  return (
    <div className="native-ad-banner" aria-label="Contenido patrocinado">
      <span className="native-ad-label">Patrocinado</span>
      <AdCarousel position={position} isLoading={isLoading} preloadedAds={ads} />
    </div>
  );
};

export default NativeAdBanner;
