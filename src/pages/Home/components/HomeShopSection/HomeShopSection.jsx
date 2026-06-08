import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Eye, Zap, ArrowRight } from 'lucide-react';
import './HomeShopSection.css';

/* ─── PRODUCT CARD (unchanged logic) ─── */
const ProductCard = ({ product, onProductClick, onAddToCart }) => {
    const allVariantsOutOfStock = !product.variants || product.variants.length === 0 || product.variants.every(v => v.stock <= 0);
    const defaultVariant = product.variants?.[0];
    const price = defaultVariant ? parseFloat(defaultVariant.price) || 0 : 0;

    const wholePart = Math.floor(price);
    const decimalPart = (price % 1).toFixed(2).substring(2);

    const rating = product.rating !== undefined && product.rating !== null ? parseFloat(product.rating) : 0;
    const reviewCount = product.reviews ? product.reviews.length : 0;

    const imageUrl = product.image_url?.split(',')[0] || '/assets/default_product.png';

    return (
        <div className="amazon-product-card" onClick={() => onProductClick(product)}>
            <div className="amazon-card-image-wrapper">
                {product.is_official && (
                    <span className="amazon-badge-official">
                        <Zap size={10} /> Oficial
                    </span>
                )}
                {allVariantsOutOfStock && (
                    <span className="amazon-badge-out">Agotado</span>
                )}
                <img src={imageUrl} alt={product.name} className="amazon-card-image" loading="lazy" />
                <div className="amazon-card-overlay">
                    <button
                        className="amazon-quick-view-btn"
                        onClick={(e) => { e.stopPropagation(); onProductClick(product); }}
                        title="Vista rápida"
                    >
                        <Eye size={16} />
                    </button>
                </div>
            </div>

            <div className="amazon-card-content">
                <span className="amazon-card-category">{product.category || 'Música'}</span>
                <h3 className="amazon-card-title">{product.name}</h3>

                <div className="amazon-card-rating">
                    <div className="amazon-stars">
                        {[...Array(5)].map((_, i) => {
                            const isFilled = i < Math.floor(rating);
                            return (
                                <Star key={i} size={13} fill={isFilled ? "#ff9900" : "none"} color={isFilled ? "#ff9900" : "#ccc"} />
                            );
                        })}
                    </div>
                    <span className="amazon-rating-text">{rating}</span>
                    <span className="amazon-review-count">({reviewCount})</span>
                </div>

                <div className="amazon-price-wrapper">
                    <span className="amazon-currency">$</span>
                    <span className="amazon-price-whole">{wholePart}</span>
                    <span className="amazon-price-decimal">{decimalPart}</span>
                    <span className="amazon-currency-code">MXN</span>
                </div>

                <div className="amazon-shipping-tag">
                    {product.is_official ? (
                        <span className="amazon-prime-shipping">Envío Laika gratis</span>
                    ) : (
                        <span className="amazon-regular-shipping">Recogida en evento</span>
                    )}
                </div>

                <button
                    className={`amazon-add-btn ${allVariantsOutOfStock ? 'disabled' : ''}`}
                    onClick={(e) => { e.stopPropagation(); if (!allVariantsOutOfStock) onAddToCart(e, product, defaultVariant); }}
                    disabled={allVariantsOutOfStock}
                    type="button"
                >
                    <ShoppingBag size={14} />
                    {allVariantsOutOfStock ? 'Sin stock' : 'Agregar'}
                </button>
            </div>
        </div>
    );
};

/* ─── PRODUCT SHELF ─── */
const ProductShelf = ({ title, subtitle, products, onProductClick, onAddToCart }) => {
    const shelfRef = useRef(null);
    const scroll = (dir) => shelfRef.current?.scrollBy({ left: dir === 'left' ? -500 : 500, behavior: 'smooth' });

    return (
        <div className="amazon-shelf-container">
            <div className="amazon-shelf-header">
                <div className="amazon-shelf-title-area">
                    <h2 className="amazon-shelf-title">{title}</h2>
                    {subtitle && <span className="amazon-shelf-subtitle">{subtitle}</span>}
                </div>
                <div className="amazon-shelf-nav">
                    <button className="shelf-nav-btn" onClick={() => scroll('left')} aria-label="Desplazar izquierda"><ChevronLeft size={20} /></button>
                    <button className="shelf-nav-btn" onClick={() => scroll('right')} aria-label="Desplazar derecha"><ChevronRight size={20} /></button>
                </div>
            </div>
            <div className="amazon-shelf-scroll-wrapper">
                <div className="amazon-shelf-scroll-container" ref={shelfRef}>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} onProductClick={onProductClick} onAddToCart={onAddToCart} />
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─── SHOP CTA BANNER ─── */
export const ShopCtaBanner = ({ onNavigate }) => (
    <div className="home-shop-cta-banner" id="laika-shop-home-cta">
        <div className="home-shop-cta-content">
            <div className="home-shop-cta-text">
                <span className="home-shop-cta-label">Laika Shop</span>
                <h3 className="home-shop-cta-title">Descubre la colección completa</h3>
                <p className="home-shop-cta-description">
                    Explora más de 50 productos exclusivos: hoodies, playeras, coleccionables y ediciones limitadas de tus artistas favoritos.
                </p>
            </div>
            <button
                className="home-shop-cta-btn"
                onClick={onNavigate}
                type="button"
                id="home-shop-explore-btn"
            >
                Explorar tienda
                <ArrowRight size={18} />
            </button>
        </div>
        <div className="home-shop-cta-decoration">
            <div className="deco-circle deco-circle--1" />
            <div className="deco-circle deco-circle--2" />
            <div className="deco-circle deco-circle--3" />
        </div>
    </div>
);

/* ─── MAIN SECTION ─── */
const HomeShopSection = ({ products, onProductClick, onAddToCart }) => {
    const navigate = useNavigate();

    const officialProducts = products.filter(p => p.is_official);
    const apparelProducts = products.filter(p =>
        p.category?.toLowerCase() === 'ropa' || p.category?.toLowerCase() === 'gorras'
    );
    const utilityProducts = products.filter(p =>
        p.category?.toLowerCase() === 'vaso' || p.category?.toLowerCase() === 'boleto'
    );
    const showAllAsBackup = officialProducts.length === 0 && apparelProducts.length === 0 && utilityProducts.length === 0;

    return (
        <section className="amazon-shop-section-wrapper">
            {/* SECTION HEADER */}
            <div className="amazon-shop-section-header">
                <div className="amazon-logo-indicator">
                    <span className="logo-text-accent">LAIKA</span>
                    <span className="logo-text-base">SHOP</span>
                    <div className="amazon-curve-arrow" />
                </div>
                <button
                    className="amazon-visit-store-btn"
                    onClick={() => navigate('/shop')}
                    type="button"
                    id="home-visit-store-btn"
                >
                    Ver tienda completa &rarr;
                </button>
            </div>

            {/* PRODUCT SHELVES */}
            <div className="amazon-shop-shelves">
                {officialProducts.length > 0 && (
                    <ProductShelf
                        title="Lanzamientos Oficiales"
                        subtitle="Artículos oficiales certificados por los gestores de eventos"
                        products={officialProducts}
                        onProductClick={onProductClick}
                        onAddToCart={onAddToCart}
                    />
                )}
                {apparelProducts.length > 0 && (
                    <ProductShelf
                        title="Moda y Estilo"
                        subtitle="Sudaderas, playeras y gorras exclusivas para los mejores drops"
                        products={apparelProducts}
                        onProductClick={onProductClick}
                        onAddToCart={onAddToCart}
                    />
                )}
                {utilityProducts.length > 0 && (
                    <ProductShelf
                        title="Accesorios y Pases"
                        subtitle="Termos de acero, pases backstage y coleccionables del club"
                        products={utilityProducts}
                        onProductClick={onProductClick}
                        onAddToCart={onAddToCart}
                    />
                )}
                {showAllAsBackup && products.length > 0 && (
                    <ProductShelf
                        title="Productos Recomendados"
                        subtitle="Explora la colección destacada de Laika Shop"
                        products={products}
                        onProductClick={onProductClick}
                        onAddToCart={onAddToCart}
                    />
                )}
            </div>

            {/* CTA BANNER */}
            <ShopCtaBanner onNavigate={() => navigate('/shop')} />
        </section>
    );
};

export default HomeShopSection;
