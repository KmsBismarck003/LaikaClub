import React, { useState, useCallback } from 'react';
import { Heart, ShoppingBag, Eye, Tag } from 'lucide-react';
import { useFavorites } from '../../../../context/FavoritesContext';
import { getImageUrl } from '../../../../utils/imageUtils';
import StockBadge from '../StockBadge/StockBadge';
import './ProductCard.css';

const getLowestPrice = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map(v => parseFloat(v.price) || 0));
};

const getTotalStock = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
};

const formatPrice = (price) =>
    new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(price);

const ProductCard = ({ product, onQuickView, onAddToCart }) => {
    const { toggleFavorite, isFavorite } = useFavorites();
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const defaultVariant = product.variants?.[0];
    const totalStock = getTotalStock(product.variants);
    const lowestPrice = getLowestPrice(product.variants);
    const allOutOfStock = totalStock <= 0;
    const rawImageUrl = product.imageUrl || product.image_url;
    const imageUrl = rawImageUrl ? getImageUrl(rawImageUrl.split(',')[0]) : '/assets/default_product.png';
    const isOfficial = product.isOfficial !== undefined ? product.isOfficial : product.is_official;

    const handleFavoriteClick = useCallback((e) => {
        e.stopPropagation();
        toggleFavorite(product);
    }, [product, toggleFavorite]);

    const handleQuickView = useCallback((e) => {
        e.stopPropagation();
        onQuickView(product);
    }, [product, onQuickView]);

    const handleAddToCart = useCallback((e) => {
        e.stopPropagation();
        if (allOutOfStock) return;
        onAddToCart(e, product, defaultVariant);
    }, [product, defaultVariant, allOutOfStock, onAddToCart]);

    return (
        <article
            className={`product-card ${allOutOfStock ? 'product-card--out-of-stock' : ''}`}
            onClick={() => onQuickView(product)}
            role="button"
            tabIndex={0}
            aria-label={`Ver ${product.name}`}
            onKeyDown={(e) => e.key === 'Enter' && onQuickView(product)}
            id={`product-card-${product.id}`}
        >
            {/* IMAGE AREA */}
            <div className="product-card__image-wrap">
                {/* Badges */}
                <div className="product-card__badges">
                    {isOfficial && (
                        <span className="product-card__badge product-card__badge--official">
                            Oficial Laika
                        </span>
                    )}
                    {allOutOfStock && (
                        <span className="product-card__badge product-card__badge--sold-out">
                            Agotado
                        </span>
                    )}
                </div>

                {/* Wishlist */}
                <button
                    className={`product-card__wishlist ${isFavorite(product.id) ? 'active' : ''}`}
                    onClick={handleFavoriteClick}
                    type="button"
                    aria-label="Agregar a favoritos"
                >
                    <Heart
                        size={17}
                        fill={isFavorite(product.id) ? 'currentColor' : 'none'}
                    />
                </button>

                {/* Product Image */}
                {!imageLoaded && !imageError && (
                    <div className="product-card__image-skeleton" />
                )}
                <img
                    src={imageError ? '/assets/default_product.png' : imageUrl}
                    alt={product.name}
                    className={`product-card__image ${imageLoaded ? 'loaded' : ''}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => { setImageError(true); setImageLoaded(true); }}
                />

                {/* Hover Overlay */}
                <div className="product-card__hover-overlay">
                    <button
                        className="product-card__quick-view-btn"
                        onClick={handleQuickView}
                        type="button"
                    >
                        <Eye size={16} />
                        Ver detalle
                    </button>
                </div>
            </div>

            {/* BODY */}
            <div className="product-card__body">
                {/* Category + Stock */}
                <div className="product-card__meta">
                    {product.category && (
                        <span className="product-card__category">
                            <Tag size={11} />
                            {product.category}
                        </span>
                    )}
                    <StockBadge stock={totalStock} compact />
                </div>

                <h3 className="product-card__name">{product.name}</h3>

                {/* Price */}
                <div className="product-card__price-row">
                    <span className="product-card__price">{formatPrice(lowestPrice)}</span>
                    {product.variants && product.variants.length > 1 && (
                        <span className="product-card__price-hint">desde</span>
                    )}
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                    <div className="product-card__tags">
                        {product.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="product-card__tag">{tag}</span>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <button
                    className={`product-card__add-btn ${allOutOfStock ? 'disabled' : ''}`}
                    onClick={handleAddToCart}
                    disabled={allOutOfStock}
                    type="button"
                    aria-label={allOutOfStock ? 'Producto agotado' : `Agregar ${product.name} al carrito`}
                >
                    <ShoppingBag size={15} />
                    {allOutOfStock ? 'Agotado' : 'Agregar al carrito'}
                </button>
            </div>
        </article>
    );
};

export default ProductCard;
