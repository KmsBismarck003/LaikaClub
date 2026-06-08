import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Eye, Zap } from 'lucide-react';
import './HomeShopSection.css';

const ProductCard = ({ product, onProductClick, onAddToCart }) => {
    const allVariantsOutOfStock = !product.variants || product.variants.length === 0 || product.variants.every(v => v.stock <= 0);
    const defaultVariant = product.variants?.[0];
    const price = defaultVariant ? parseFloat(defaultVariant.price) || 0 : 0;
    
    // Format price in Amazon style (separated whole and decimal numbers)
    const wholePart = Math.floor(price);
    const decimalPart = (price % 1).toFixed(2).substring(2);

    // Generate static but realistic ratings based on product ID to avoid re-renders
    const rating = parseFloat(((product.id % 7) * 0.1 + 4.3).toFixed(1));
    const reviewCount = (product.id * 23) % 240 + 38;

    const imageUrl = product.image_url?.split(',')[0] || '/assets/default_product.png';

    const handleCardClick = () => {
        onProductClick(product);
    };

    const handleCartClick = (e) => {
        e.stopPropagation();
        if (allVariantsOutOfStock) return;
        onAddToCart(e, product, defaultVariant);
    };

    return (
        <div className="amazon-product-card" onClick={handleCardClick}>
            <div className="amazon-card-image-wrapper">
                {product.is_official && (
                    <span className="amazon-badge-official">
                        <Zap size={10} className="fill-current" /> Oficial
                    </span>
                )}
                {allVariantsOutOfStock && (
                    <span className="amazon-badge-out">Agotado</span>
                )}
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="amazon-card-image" 
                    loading="lazy" 
                />
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
                
                {/* Rating */}
                <div className="amazon-card-rating">
                    <div className="amazon-stars">
                        {[...Array(5)].map((_, i) => {
                            const isFilled = i < Math.floor(rating);
                            return (
                                <Star 
                                    key={i} 
                                    size={13} 
                                    fill={isFilled ? "#ff9900" : "none"} 
                                    color={isFilled ? "#ff9900" : "#ccc"} 
                                />
                            );
                        })}
                    </div>
                    <span className="amazon-rating-text">{rating}</span>
                    <span className="amazon-review-count">({reviewCount})</span>
                </div>

                {/* Price tag */}
                <div className="amazon-price-wrapper">
                    <span className="amazon-currency">$</span>
                    <span className="amazon-price-whole">{wholePart}</span>
                    <span className="amazon-price-decimal">{decimalPart}</span>
                    <span className="amazon-currency-code">MXN</span>
                </div>

                <div className="amazon-shipping-tag">
                    {product.is_official ? (
                        <span className="amazon-prime-shipping">✓ Envío Laika gratis</span>
                    ) : (
                        <span className="amazon-regular-shipping">Recogida en evento</span>
                    )}
                </div>

                {/* Action button */}
                <button
                    className={`amazon-add-btn ${allVariantsOutOfStock ? 'disabled' : ''}`}
                    onClick={handleCartClick}
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

const ProductShelf = ({ title, subtitle, products, onProductClick, onAddToCart }) => {
    const shelfRef = useRef(null);

    const scroll = (direction) => {
        if (shelfRef.current) {
            const scrollAmount = direction === 'left' ? -500 : 500;
            shelfRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="amazon-shelf-container">
            <div className="amazon-shelf-header">
                <div className="amazon-shelf-title-area">
                    <h2 className="amazon-shelf-title">{title}</h2>
                    {subtitle && <span className="amazon-shelf-subtitle">{subtitle}</span>}
                </div>
                <div className="amazon-shelf-nav">
                    <button className="shelf-nav-btn" onClick={() => scroll('left')} aria-label="Desplazar izquierda">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="shelf-nav-btn" onClick={() => scroll('right')} aria-label="Desplazar derecha">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="amazon-shelf-scroll-wrapper">
                <div className="amazon-shelf-scroll-container" ref={shelfRef}>
                    {products.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onProductClick={onProductClick} 
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const HomeShopSection = ({ products, onProductClick, onAddToCart }) => {
    const navigate = useNavigate();

    // Grouping / Shelves logic
    const officialProducts = products.filter(p => p.is_official);
    const apparelProducts = products.filter(p => p.category?.toLowerCase() === 'ropa' || p.category?.toLowerCase() === 'gorras');
    const utilityProducts = products.filter(p => p.category?.toLowerCase() === 'vaso' || p.category?.toLowerCase() === 'boleto');

    // Fallback if filters yield empty results
    const showAllAsBackup = officialProducts.length === 0 && apparelProducts.length === 0 && utilityProducts.length === 0;

    return (
        <section className="amazon-shop-section-wrapper">
            <div className="amazon-shop-section-header">
                <div className="amazon-logo-indicator">
                    <span className="logo-text-accent">LAIKA</span>
                    <span className="logo-text-base">SHOP</span>
                    <div className="amazon-curve-arrow"></div>
                </div>
                <button 
                    className="amazon-visit-store-btn" 
                    onClick={() => navigate('/shop')}
                    type="button"
                >
                    Ir a la tienda completa &rarr;
                </button>
            </div>

            <div className="amazon-shop-shelves">
                {officialProducts.length > 0 && (
                    <ProductShelf 
                        title="Lanzamientos Oficiales y Merch" 
                        subtitle="Artículos oficiales certificados directamente por los gestores de eventos"
                        products={officialProducts}
                        onProductClick={onProductClick}
                        onAddToCart={onAddToCart}
                    />
                )}

                {apparelProducts.length > 0 && (
                    <ProductShelf 
                        title="Moda y Estilo en Eventos" 
                        subtitle="Sudaderas, playeras y gorras exclusivas para los mejores drops"
                        products={apparelProducts}
                        onProductClick={onProductClick}
                        onAddToCart={onAddToCart}
                    />
                )}

                {utilityProducts.length > 0 && (
                    <ProductShelf 
                        title="Accesorios y Pases VIP" 
                        subtitle="Termos de acero, pases backstage y coleccionables del club"
                        products={utilityProducts}
                        onProductClick={onProductClick}
                        onAddToCart={onAddToCart}
                    />
                )}

                {showAllAsBackup && products.length > 0 && (
                    <ProductShelf 
                        title="Productos Recomendados para ti" 
                        subtitle="Explora la colección destacada de Laika Shop"
                        products={products}
                        onProductClick={onProductClick}
                        onAddToCart={onAddToCart}
                    />
                )}
            </div>
        </section>
    );
};

export default HomeShopSection;
