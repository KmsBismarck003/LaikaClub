import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { getImageUrl } from '../../../../utils/imageUtils';

/**
 * ShopHeroSlider - Main featured merchandise banner
 * Automatically rotates top drops with real products and provides quick CTAs.
 */
const ShopHeroSlider = ({ products = [], onQuickView, onExploreCategory }) => {
    // Select top 3-4 featured products
    const featuredSlides = useMemo(() => {
        if (!products || products.length === 0) return [];

        // Prioritize official items and items with variants/images
        const candidates = products.filter(p => p.imageUrl || p.image_url);
        const sorted = [...candidates].sort((a, b) => {
            const aOfficial = (a.isOfficial || a.is_official) ? 1 : 0;
            const bOfficial = (b.isOfficial || b.is_official) ? 1 : 0;
            return bOfficial - aOfficial;
        });

        const selected = sorted.slice(0, 4);

        return selected.map((prod, idx) => {
            const lowestPrice = prod.variants && prod.variants.length > 0
                ? Math.min(...prod.variants.map(v => parseFloat(v.price) || 0))
                : parseFloat(prod.price) || 0;

            const badges = [
                'DROP DESTACADO',
                'COLECCIÓN OFICIAL',
                'EDICIÓN LIMITADA',
                'MÁS POPULAR'
            ];

            return {
                id: prod.id,
                product: prod,
                badge: badges[idx % badges.length],
                title: prod.name,
                subtitle: prod.description
                    ? (prod.description.length > 110 ? `${prod.description.substring(0, 110)}...` : prod.description)
                    : 'Mercancía oficial certificada y exclusiva para la comunidad Laika Club.',
                category: prod.category || 'Mercancía',
                eventName: prod.event_name || prod.eventName || (prod.eventId === 23 ? 'Avengers: Endgame' : null),
                price: lowestPrice,
                imageUrl: getImageUrl((prod.imageUrl || prod.image_url)?.split(',')[0])
            };
        });
    }, [products]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const totalSlides = featuredSlides.length;

    const handleNext = useCallback(() => {
        if (totalSlides <= 1) return;
        setCurrentIndex(prev => (prev + 1) % totalSlides);
    }, [totalSlides]);

    const handlePrev = useCallback(() => {
        if (totalSlides <= 1) return;
        setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
    }, [totalSlides]);

    // Autoplay timer
    useEffect(() => {
        if (totalSlides <= 1 || isPaused) return;
        const timer = setInterval(() => {
            handleNext();
        }, 5500);
        return () => clearInterval(timer);
    }, [totalSlides, isPaused, handleNext]);

    if (featuredSlides.length === 0) {
        return (
            <div className="shop-hero-slider shop-hero-slider--empty">
                <div className="shop-hero-slider__empty-content">
                    <Sparkles className="shop-hero-slider__sparkle-icon" size={32} />
                    <h3>CATÁLOGO OFICIAL LAIKA SHOP</h3>
                    <p>Explora la mercancía exclusiva de festivales y artistas.</p>
                </div>
            </div>
        );
    }

    const currentSlide = featuredSlides[currentIndex];

    return (
        <div 
            className="shop-hero-slider"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="shop-hero-slider__track">
                <div className="shop-hero-slider__slide" key={currentSlide.id}>
                    {/* Background glow & subtle overlay */}
                    <div className="shop-hero-slider__glow" />

                    <div className="shop-hero-slider__content">
                        <div className="shop-hero-slider__tags">
                            <span className="shop-hero-slider__badge">
                                <Sparkles size={13} className="shop-hero-slider__badge-icon" />
                                {currentSlide.badge}
                            </span>
                            {currentSlide.eventName && (
                                <span className="shop-hero-slider__event-pill">
                                    {currentSlide.eventName}
                                </span>
                            )}
                        </div>

                        <h2 className="shop-hero-slider__title">
                            {currentSlide.title}
                        </h2>

                        <p className="shop-hero-slider__description">
                            {currentSlide.subtitle}
                        </p>

                        <div className="shop-hero-slider__price-wrapper">
                            <span className="shop-hero-slider__price-label">Desde</span>
                            <span className="shop-hero-slider__price">
                                {new Intl.NumberFormat('es-MX', {
                                    style: 'currency',
                                    currency: 'MXN',
                                    minimumFractionDigits: 0
                                }).format(currentSlide.price)}
                            </span>
                            <span className="shop-hero-slider__currency">MXN</span>
                        </div>

                        <div className="shop-hero-slider__actions">
                            <button
                                type="button"
                                className="shop-hero-slider__btn shop-hero-slider__btn--primary"
                                onClick={() => onQuickView && onQuickView(currentSlide.product)}
                            >
                                <ShoppingBag size={17} />
                                <span>VER DETALLES</span>
                            </button>

                            <button
                                type="button"
                                className="shop-hero-slider__btn shop-hero-slider__btn--secondary"
                                onClick={() => onExploreCategory && onExploreCategory(currentSlide.category)}
                            >
                                <span>COLECCIÓN {currentSlide.category.toUpperCase()}</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div 
                        className="shop-hero-slider__image-container"
                        onClick={() => onQuickView && onQuickView(currentSlide.product)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Ver ${currentSlide.title}`}
                    >
                        <div className="shop-hero-slider__image-backdrop" />
                        <img 
                            src={currentSlide.imageUrl} 
                            alt={currentSlide.title}
                            className="shop-hero-slider__image"
                        />
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {totalSlides > 1 && (
                <>
                    <button
                        type="button"
                        className="shop-hero-slider__nav shop-hero-slider__nav--prev"
                        onClick={handlePrev}
                        aria-label="Slide anterior"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        type="button"
                        className="shop-hero-slider__nav shop-hero-slider__nav--next"
                        onClick={handleNext}
                        aria-label="Siguiente slide"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Pagination Dots */}
                    <div className="shop-hero-slider__pagination">
                        {featuredSlides.map((slide, idx) => (
                            <button
                                key={slide.id}
                                type="button"
                                className={`shop-hero-slider__dot ${idx === currentIndex ? 'shop-hero-slider__dot--active' : ''}`}
                                onClick={() => setCurrentIndex(idx)}
                                aria-label={`Ir a slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ShopHeroSlider;
