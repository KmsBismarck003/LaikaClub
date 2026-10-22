import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { merchService } from '../../services/merch.service';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { AdCarousel, ConfirmDialog } from '../../components';
import NewsTicker from '../../components/NewsTicker/NewsTicker';
import {
    SkeletonHero,
    SkeletonAd,
    SkeletonEventCard,
    SkeletonNewsTicker
} from '../../components/Skeleton/Skeleton';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

import ShopHero from './components/ShopHero/ShopHero';
import FeaturedCategories from './components/FeaturedCategories/FeaturedCategories';
import ProductSearch from './components/ProductSearch/ProductSearch';
import ProductFilters from './components/ProductFilters/ProductFilters';
import ProductGrid from './components/ProductGrid/ProductGrid';
import ProductModal from './components/ProductModal/ProductModal';

import './Shop.css';

// --- Sorting logic ---
const sortProducts = (products, sortBy) => {
    const copy = [...products];
    switch (sortBy) {
        case 'price_asc':
            return copy.sort((a, b) => {
                const aMin = Math.min(...(a.variants?.map(v => parseFloat(v.price) || 0) || [0]));
                const bMin = Math.min(...(b.variants?.map(v => parseFloat(v.price) || 0) || [0]));
                return aMin - bMin;
            });
        case 'price_desc':
            return copy.sort((a, b) => {
                const aMin = Math.min(...(a.variants?.map(v => parseFloat(v.price) || 0) || [0]));
                const bMin = Math.min(...(b.variants?.map(v => parseFloat(v.price) || 0) || [0]));
                return bMin - aMin;
            });
        case 'newest':
            return copy.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        case 'popular':
        default:
            return copy.sort((a, b) => {
                const aOfficial = a.isOfficial !== undefined ? a.isOfficial : a.is_official;
                const bOfficial = b.isOfficial !== undefined ? b.isOfficial : b.is_official;
                return (bOfficial ? 1 : 0) - (aOfficial ? 1 : 0);
            });
    }
};

const PRODUCTS_PER_PAGE = 9;

const Shop = () => {
    const location = useLocation();
    const { addMerchToCart } = useCart();
    const { showNotification } = useNotification();

    // Data
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [events, setEvents] = useState([]);
    const [ads, setAds] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
    const [productToConfirm, setProductToConfirm] = useState(null);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedEventId, setSelectedEventId] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [availability, setAvailability] = useState('all');
    const [priceRange, setPriceRange] = useState(5000);
    const maxPrice = 5000;

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Sync search from URL query param
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q !== null) setSearchTerm(q || '');
    }, [location.search]);

    // Load recently viewed products
    useEffect(() => {
        const loadRecent = () => {
            try {
                const items = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
                setRecentlyViewedProducts(items);
            } catch (e) {
                console.error('Failed to load recently viewed products:', e);
            }
        };
        loadRecent();
        window.addEventListener('recentlyViewedProductsUpdated', loadRecent);
        return () => window.removeEventListener('recentlyViewedProductsUpdated', loadRecent);
    }, []);

    // Initial data load (merchandise, events, ads)
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const adsData = await api.ads.getPublic();
                setAds(Array.isArray(adsData) ? adsData : []);
            } catch (e) {
                console.error('Ads load failed:', e);
            }
            try {
                const evts = await api.event.getPublic();
                setEvents(Array.isArray(evts) ? evts : []);
            } catch (e) {
                console.error('Events load failed:', e);
            }
            try {
                const data = await merchService.getAllMerchandise(null, 'published', null, 'approved');
                const safe = Array.isArray(data) ? data : [];
                setProducts(safe);
            } catch (e) {
                console.error('Merch load failed:', e);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Dynamically derive distinct categories from real products
    const availableCategories = useMemo(() => {
        if (!products || products.length === 0) return ['ropa', 'accesorios', 'vasos', 'coleccionables'];
        const cats = new Set();
        products.forEach(p => {
            if (p.category) cats.add(p.category.toLowerCase());
        });
        return Array.from(cats);
    }, [products]);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeCategory, selectedEventId, sortBy, availability, priceRange]);

    // Compute active filter count for badge
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (activeCategory !== 'all') count++;
        if (selectedEventId !== 'all') count++;
        if (availability !== 'all') count++;
        if (priceRange < maxPrice) count++;
        if (sortBy !== 'popular') count++;
        return count;
    }, [activeCategory, selectedEventId, availability, priceRange, sortBy]);

    // Filter & sort products
    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];

        let result = products.filter(p => {
            // Search
            const search = searchTerm.toLowerCase();
            const matchesSearch = !search ||
                (p.name || '').toLowerCase().includes(search) ||
                (p.description || '').toLowerCase().includes(search) ||
                (p.category || '').toLowerCase().includes(search) ||
                (p.brand || '').toLowerCase().includes(search) ||
                (p.event_name || p.eventName || '').toLowerCase().includes(search) ||
                (p.artist || '').toLowerCase().includes(search) ||
                (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(search)));

            // Category
            const matchesCategory = activeCategory === 'all' ||
                (p.category || '').toLowerCase() === activeCategory.toLowerCase();

            // Event
            const matchesEvent = selectedEventId === 'all' ||
                String(p.eventId || p.event_id) === String(selectedEventId);

            // Availability
            const totalStock = p.variants?.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0) ?? 0;
            const matchesAvailability =
                availability === 'all' ||
                (availability === 'in_stock' && totalStock > 0) ||
                (availability === 'out_of_stock' && totalStock <= 0);

            // Price
            const lowestPrice = p.variants && p.variants.length > 0
                ? Math.min(...p.variants.map(v => parseFloat(v.price) || 0))
                : 0;
            const matchesPrice = lowestPrice <= priceRange;

            return matchesSearch && matchesCategory && matchesEvent && matchesAvailability && matchesPrice;
        });

        return sortProducts(result, sortBy);
    }, [products, searchTerm, activeCategory, selectedEventId, availability, priceRange, sortBy]);

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const currentProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const handleQuickView = useCallback((product) => {
        setSelectedProduct(product);
    }, []);

    const handleAddToCart = useCallback((e, product, variant, quantity = 1) => {
        if (e) e.stopPropagation();
        if (!variant) {
            showNotification('Atención', 'Selecciona una opción (talla/color)', 'warning');
            return;
        }
        setProductToConfirm({ product, variant, quantity });
    }, [showNotification]);

    const handleConfirmAddToCart = useCallback(() => {
        if (!productToConfirm) return;
        const { product, variant, quantity } = productToConfirm;
        addMerchToCart(product, variant, quantity);
        showNotification('Éxito', `${product.name} añadido al carrito`, 'success');
        setProductToConfirm(null);
    }, [productToConfirm, addMerchToCart, showNotification]);

    const resetFilters = useCallback(() => {
        setSearchTerm('');
        setActiveCategory('all');
        setSelectedEventId('all');
        setSortBy('popular');
        setAvailability('all');
        setPriceRange(maxPrice);
        setCurrentPage(1);
    }, [maxPrice]);

    const handleApplyQuickFilter = useCallback(({ category, eventId }) => {
        if (category) setActiveCategory(category);
        if (eventId) setSelectedEventId(eventId);
        setCurrentPage(1);
    }, []);

    const handleResetQuickFilter = useCallback(() => {
        setActiveCategory('all');
        setSelectedEventId('all');
        setCurrentPage(1);
    }, []);

    const handleExploreCategory = useCallback((category) => {
        if (category) setActiveCategory(category);
        setSelectedEventId('all');
        setCurrentPage(1);
        const toolbar = document.querySelector('.shop-toolbar') || document.querySelector('.shop-marketplace-layout');
        if (toolbar) {
            toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    }, []);

    if (loading) {
        return (
            <div className="laika-shop-container professional-redesign">
                <SkeletonNewsTicker />
                <SkeletonHero />
                <div className="home-layout">
                    <main className="home-main">
                        <div className="home-banner">
                            <SkeletonAd position="main" />
                        </div>
                        <div className="shop-marketplace-layout">
                            <div className="product-grid">
                                <div className="product-grid__items">
                                    {[...Array(9)].map((_, i) => (
                                        <SkeletonEventCard key={i} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="laika-shop-container professional-redesign">
            <NewsTicker settings={{
                text: 'MERCANCÍA OFICIAL LAIKA CLUB · 10% OFF CON TU BOLETO DE FESTIVAL CON CÓDIGO LAIKACLUB10 · ENVÍO GRATIS EN COMPRAS MAYORES A $1,000 · EDICIONES LIMITADAS DE ARTISTAS ·',
                speed: 40
            }} />

            <div className="home-layout">
                <main className="home-main">
                    {/* TOP HERO BENTO: PORTO + FESTIVAL HUB FUSION */}
                    <ShopHero
                        products={products}
                        categories={availableCategories}
                        events={events}
                        activeCategory={activeCategory}
                        selectedEventId={selectedEventId}
                        onApplyQuickFilter={handleApplyQuickFilter}
                        onResetQuickFilter={handleResetQuickFilter}
                        onQuickView={handleQuickView}
                        onExploreCategory={handleExploreCategory}
                    />

                    {/* HORIZONTAL CATEGORIES RIBBON WITH LIVE ITEM COUNTERS */}
                    <FeaturedCategories
                        categories={availableCategories}
                        activeCategory={activeCategory}
                        onSelectCategory={(cat) => {
                            setActiveCategory(cat);
                            setCurrentPage(1);
                        }}
                        products={products}
                    />

                    {/* TOP AD BANNER IF AVAILABLE */}
                    {ads && ads.length > 0 && (
                        <div className="home-banner shop-top-carousel-container">
                            <AdCarousel position="main" isLoading={loading} preloadedAds={ads} />
                        </div>
                    )}

                    <div className="shop-marketplace-layout">
                        {/* SEARCH + FILTER TOOLBAR */}
                        <div className="shop-toolbar">
                            <ProductSearch
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                onClear={() => setSearchTerm('')}
                                totalResults={filteredProducts.length}
                                onToggleFilters={() => setFiltersOpen(prev => !prev)}
                                filtersOpen={filtersOpen}
                            />
                        </div>

                        {/* ADVANCED FILTERS PANEL */}
                        <ProductFilters
                            isOpen={filtersOpen}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            availability={availability}
                            setAvailability={setAvailability}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            maxPrice={maxPrice}
                            activeFiltersCount={activeFiltersCount}
                            onResetAll={resetFilters}
                        />

                        {/* PRODUCT GRID */}
                        <ProductGrid
                            currentProducts={currentProducts}
                            totalProductsCount={filteredProducts.length}
                            handleQuickView={handleQuickView}
                            handleAddToCart={handleAddToCart}
                            onResetFilters={resetFilters}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            handlePageChange={handlePageChange}
                        />

                        {/* RECENTLY VIEWED PRODUCTS */}
                        {recentlyViewedProducts && recentlyViewedProducts.length > 0 && (
                            <div className="recently-viewed-section">
                                <h3 className="recently-viewed-title">Vistos recientemente</h3>
                                <div className="recently-viewed-grid">
                                    {recentlyViewedProducts.map((p) => {
                                        const lowestPrice = p.variants && p.variants.length > 0
                                            ? Math.min(...p.variants.map(v => parseFloat(v.price) || 0))
                                            : parseFloat(p.price) || 0;
                                        return (
                                            <div 
                                                key={p.id} 
                                                className="recently-viewed-card"
                                                onClick={() => handleQuickView(p)}
                                            >
                                                <div className="recently-viewed-img-wrapper">
                                                    <img src={getImageUrl((p.imageUrl || p.image_url)?.split(',')[0])} alt={p.name} />
                                                </div>
                                                <div className="recently-viewed-info">
                                                    <span className="recently-viewed-name">{p.name}</span>
                                                    <span className="recently-viewed-price">
                                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(lowestPrice)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <ProductModal
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                handleAddToCart={handleAddToCart}
            />

            {/* Diálogo de Confirmación para Agregar Producto al Carrito */}
            <ConfirmDialog
                isOpen={Boolean(productToConfirm)}
                onClose={() => setProductToConfirm(null)}
                onConfirm={handleConfirmAddToCart}
                title="¿Agregar al carrito?"
                message={`¿Deseas agregar "${productToConfirm?.product?.name}" a tu carrito de compras?`}
                confirmText="Agregar al carrito"
                cancelText="Cancelar"
                variant="cart"
                itemDetails={productToConfirm ? {
                    image: productToConfirm.product.imageUrl || productToConfirm.product.image_url,
                    title: productToConfirm.product.name,
                    subtitle: [
                        productToConfirm.variant.size ? `Talla: ${productToConfirm.variant.size}` : null,
                        productToConfirm.variant.color ? `Color: ${productToConfirm.variant.color}` : null,
                        productToConfirm.product.category
                    ].filter(Boolean).join(' · '),
                    price: `$${parseFloat(productToConfirm.variant.price || 0).toFixed(2)} MXN`,
                    badge: productToConfirm.product.isOfficial ? 'OFICIAL LAIKA' : 'MERCH',
                    quantity: productToConfirm.quantity
                } : null}
            />
        </div>
    );
};

export default Shop;
