import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { merchService } from '../../services/merch.service';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { AdCarousel } from '../../components';
import NewsTicker from '../../components/NewsTicker/NewsTicker';
import { 
    SkeletonHero, 
    SkeletonAd, 
    SkeletonEventCard, 
    SkeletonNewsTicker 
} from '../../components/Skeleton/Skeleton';
import HeroSection from '../Home/components/HeroSection/HeroSection';
import api from '../../services/api';

import FilterBar from './components/FilterBar/FilterBar';
import ProductGrid from './components/ProductGrid/ProductGrid';
import ProductModal from './components/ProductModal/ProductModal';

import './Shop.css';

const Shop = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedArtist, setSelectedArtist] = useState('all');
    const [priceRange, setPriceRange] = useState(5000); // Default to a higher range to show premium products
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [ads, setAds] = useState([]);
    
    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9; // 3x3 Grid

    const navigate = useNavigate();
    const { addMerchToCart } = useCart();
    const { showNotification } = useNotification();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);

        // 1. ADS FETCHING (COMMERCIAL POOL)
        try {
            const adsData = await api.ads.getPublic();
            setAds(Array.isArray(adsData) ? adsData : []);
        } catch (adError) {
            console.error("Ad loading failed:", adError);
        }

        // 2. MERCHANDISE FETCHING
        try {
            const merchData = await merchService.getAllMerchandise(null, 'published');
            const safeMerch = Array.isArray(merchData) ? merchData : [];
            setProducts(safeMerch);
            setFilteredProducts(safeMerch);
        } catch (merchError) {
            console.error("Merchandise loading failed:", merchError);
            setProducts([]); 
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const q = queryParams.get('q');
        if (q !== null) {
            setSearchTerm(q || '');
        }
    }, [location.search]);

    useEffect(() => {
        if (!Array.isArray(products)) return;
        
        const results = products.filter(p => {
            const name = p.name || '';
            const desc = p.description || '';
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 desc.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'all' || p.category?.toLowerCase() === activeCategory.toLowerCase();
            const matchesArtist = selectedArtist === 'all' || p.brand?.toLowerCase() === selectedArtist.toLowerCase();
            
            // Find lowest price among active variants
            const lowestPrice = p.variants && p.variants.length > 0 
                ? Math.min(...p.variants.map(v => parseFloat(v.price) || 0)) 
                : 0;
            const matchesPrice = lowestPrice <= priceRange;

            return matchesSearch && matchesCategory && matchesArtist && matchesPrice;
        });
        setFilteredProducts(results);
    }, [searchTerm, products, activeCategory, selectedArtist, priceRange]);

    const handleQuickView = (product) => {
        setSelectedProduct(product);
    };

    const handleAddToCart = (e, product, variant) => {
        if (e) e.stopPropagation();
        
        if (!variant) {
            showNotification('Atencion', 'Selecciona una opcion (talla/color)', 'warning');
            return;
        }
        
        addMerchToCart(product, variant, 1);
        showNotification('Exito', `${product.name} añadido al carrito`, 'success');
        
        // Redirect to cart
        navigate('/cart');
    };

    const resetFilters = () => {
        setSearchTerm('');
        setActiveCategory('all');
        setSelectedArtist('all');
        setPriceRange(5000);
    };

    if (loading) {
        return (
            <div className="laika-shop-container professional-redesign">
                <SkeletonNewsTicker />
                <SkeletonHero />
                <div className="home-layout">
                    <aside className="home-sidebar home-sidebar--left">
                        <SkeletonAd position="side_left" />
                    </aside>
                    <main className="home-main">
                        <div className="home-banner">
                            <SkeletonAd position="main" />
                        </div>
                        <div className="shop-marketplace-layout">
                            <div className="product-results-v2">
                                <div className="grid-dense-v2">
                                    {[...Array(9)].map((_, i) => (
                                        <SkeletonEventCard key={i} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </main>
                    <aside className="home-sidebar home-sidebar--right">
                        <SkeletonAd position="side_right" />
                    </aside>
                </div>
            </div>
        );
    }

    // PAGINATION LOGIC
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    return (
        <div className="laika-shop-container professional-redesign">
            <NewsTicker settings={{
                text: '50% OFF EN TODA LA COLECION DE HOODIES - NUEVO DROP: BAD BUNNY CHROME COLLECTION - ENVIO GRATIS EN COMPRAS MAYORES A $1000 -',
                speed: 40
            }} />

            <HeroSection 
                title="LAIKA SHOP" 
                subtitle="EQUIPO OFICIAL Y EDICIONES LIMITADAS DE ARTISTAS" 
                backgroundImage="/assets/shop_hero.png"
            />

            <div className="home-layout">
                <aside className="home-sidebar home-sidebar--left">
                    <div className="sidebar-sticky-wrapper">
                        <AdCarousel position="side_left" isLoading={loading} preloadedAds={ads} />
                    </div>
                </aside>

                <main className="home-main">
                    <div className="home-banner shop-top-carousel-container">
                        <AdCarousel position="main" isLoading={loading} preloadedAds={ads} />
                    </div>

                    <div className="shop-marketplace-layout">
                        <FilterBar 
                            activeCategory={activeCategory} 
                            setActiveCategory={setActiveCategory} 
                        />

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
                    </div>
                </main>

                <aside className="home-sidebar home-sidebar--right">
                    <div className="sidebar-sticky-wrapper">
                        <AdCarousel position="side_right" isLoading={loading} preloadedAds={ads} />
                    </div>
                </aside>
            </div>

            <ProductModal 
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                handleAddToCart={handleAddToCart}
            />
        </div>
    );
};

export default Shop;
