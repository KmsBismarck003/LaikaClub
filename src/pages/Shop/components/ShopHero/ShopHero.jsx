import React from 'react';
import ShopHeroSlider from './ShopHeroSlider';
import ShopQuickFinder from './ShopQuickFinder';
import ShopPromoCard from './ShopPromoCard';
import './ShopHero.css';

/**
 * ShopHero - Split Bento Hero Section (Fusion of Porto E-commerce & Festival Bento Hub)
 * Combines high-impact featured product carousel with quick product finder and fan promo.
 */
const ShopHero = ({
    products = [],
    categories = [],
    events = [],
    activeCategory = 'all',
    selectedEventId = 'all',
    onApplyQuickFilter,
    onResetQuickFilter,
    onQuickView,
    onExploreCategory
}) => {
    return (
        <section className="shop-hero-section" aria-label="Sección destacada de Laika Shop">
            <div className="shop-hero-section__container">
                {/* Left Column: Big Featured Slider */}
                <div className="shop-hero-section__main">
                    <ShopHeroSlider
                        products={products}
                        onQuickView={onQuickView}
                        onExploreCategory={onExploreCategory}
                    />
                </div>

                {/* Right Column: Quick Finder + Fan Benefit Bento Cards */}
                <div className="shop-hero-section__sidebar">
                    <ShopQuickFinder
                        categories={categories}
                        events={events}
                        activeCategory={activeCategory}
                        selectedEventId={selectedEventId}
                        onApplyFilter={onApplyQuickFilter}
                        onResetFilter={onResetQuickFilter}
                    />
                    <ShopPromoCard />
                </div>
            </div>
        </section>
    );
};

export default ShopHero;
