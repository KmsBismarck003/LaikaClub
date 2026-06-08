import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, Tag, Package, Calendar, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { useFavorites } from '../../../../context/FavoritesContext';
import { useAuth } from '../../../../context/AuthContext';
import { merchService } from '../../../../services/merch.service';
import ProductImageCarousel from './ProductImageCarousel';
import VariantSelector from './VariantSelector';
import StockBadge from '../StockBadge/StockBadge';
import './ProductModal.css';

const getTotalStock = (variants) =>
    (variants || []).reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0);

const formatPrice = (price) =>
    new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
    }).format(parseFloat(price) || 0);

const ProductModal = ({ selectedProduct, setSelectedProduct, handleAddToCart }) => {
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { user } = useAuth();
    const [activeVariant, setActiveVariant] = useState(null);
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [addedSuccess, setAddedSuccess] = useState(false);
    
    // Review States
    const [reviews, setReviews] = useState([]);
    const [formRating, setFormRating] = useState(5);
    const [formComment, setFormComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);

    // Sync recently viewed products to localStorage (both keys for Home and Shop)
    useEffect(() => {
        if (selectedProduct) {
            try {
                const stored = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
                const filtered = stored.filter(p => p.id !== selectedProduct.id);
                const updated = [selectedProduct, ...filtered].slice(0, 8);
                localStorage.setItem('recently_viewed_products', JSON.stringify(updated));
                localStorage.setItem('recently_viewed', JSON.stringify(updated));
                window.dispatchEvent(new Event('recentlyViewedProductsUpdated'));
                window.dispatchEvent(new Event('recentlyViewedUpdated'));
            } catch (e) {
                console.error('Failed to update recently viewed products:', e);
            }
        }
    }, [selectedProduct]);

    // Check purchase status to enable/disable review form
    useEffect(() => {
        if (selectedProduct && user) {
            merchService.checkPurchased(selectedProduct.id)
                .then(res => {
                    setHasPurchased(!!res.purchased);
                })
                .catch(err => {
                    console.error('Failed to check purchase status:', err);
                    setHasPurchased(false);
                });
        } else {
            setHasPurchased(false);
        }
    }, [selectedProduct, user]);

    // Load reviews on product change
    useEffect(() => {
        if (selectedProduct) {
            setReviews(selectedProduct.reviews || []);
            setFormRating(5);
            setFormComment('');
        } else {
            setReviews([]);
        }
    }, [selectedProduct]);

    const handleReviewSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        try {
            const res = await merchService.createReview({
                item_id: selectedProduct.id,
                rating: formRating,
                comment: formComment
            });
            if (res) {
                setFormRating(5);
                setFormComment('');
                setReviews(prev => {
                    const newReviews = [res, ...prev];
                    const avg = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
                    selectedProduct.rating = Math.round(avg * 10) / 10;
                    return newReviews;
                });
            }
        } catch (err) {
            console.error('Failed to submit review:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalStock = useMemo(() =>
        selectedProduct ? getTotalStock(selectedProduct.variants) : 0,
        [selectedProduct]);

    const maxQty = useMemo(() => {
        if (!selectedProduct || !activeVariant) return 1;
        const variantStock = parseInt(activeVariant.stock, 10) || 0;
        const limit = parseInt(selectedProduct.max_per_person, 10) || 5;
        return Math.min(variantStock, limit);
    }, [activeVariant, selectedProduct]);

    // Reset variant selection when product changes
    useEffect(() => {
        setActiveVariant(null);
        setIsOutOfStock(false);
        setQuantity(1);
        setAddedSuccess(false);
    }, [selectedProduct?.id]);

    useEffect(() => {
        setQuantity(1);
    }, [activeVariant?.id]);

    if (!selectedProduct) return null;

    const handleVariantChange = (variant, outOfStock) => {
        setActiveVariant(variant);
        setIsOutOfStock(outOfStock);
    };

    const onAddToCartClick = () => {
        if (!activeVariant || isOutOfStock) return;
        handleAddToCart(null, selectedProduct, activeVariant, quantity);
        setAddedSuccess(true);
    };

    const handleClose = () => setSelectedProduct(null);

    const tags = Array.isArray(selectedProduct.tags)
        ? selectedProduct.tags
        : (selectedProduct.tags ? [selectedProduct.tags] : []);

    if (addedSuccess) {
        return (
            <div
                className="shop-modal-overlay"
                onClick={handleClose}
                role="dialog"
                aria-modal="true"
                aria-label="Objetos Agregados"
                id="product-detail-modal"
            >
                <div
                    className="shop-modal-container success-container"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="success-content-wrapper">
                        <div className="success-icon-badge">
                            <CheckCircle2 size={48} className="success-checkmark" />
                        </div>
                        <h2 className="success-title">¡Objetos Agregados!</h2>
                        <p className="success-subtitle">Tu producto se ha añadido al carrito de compras.</p>
                        
                        <div className="success-product-preview">
                            <img src={selectedProduct.image_url?.split(',')[0]} alt={selectedProduct.name} />
                            <div className="success-product-details">
                                <span className="product-name">{selectedProduct.name}</span>
                                {activeVariant && activeVariant.attributes && (
                                    <span className="product-variant">
                                        {Object.entries(activeVariant.attributes).map(([key, val]) => `${key}: ${val}`).join(', ')}
                                    </span>
                                )}
                                <span className="product-qty">Cantidad: {quantity} pzas</span>
                                <span className="product-price">{formatPrice((parseFloat(activeVariant?.price) || parseFloat(selectedProduct.price) || 0) * quantity)}</span>
                            </div>
                        </div>

                        <div className="success-actions">
                            <button
                                className="success-btn-explore"
                                onClick={() => {
                                    setAddedSuccess(false);
                                    setSelectedProduct(null);
                                }}
                                type="button"
                            >
                                Seguir explorando
                              </button>
                            <button
                                className="success-btn-checkout"
                                onClick={() => {
                                    setAddedSuccess(false);
                                    setSelectedProduct(null);
                                    navigate('/cart');
                                }}
                                type="button"
                            >
                                Ir a pagar
                              </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="shop-modal-overlay"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label={selectedProduct.name}
            id="product-detail-modal"
        >
            <div
                className="shop-modal-container"
                onClick={e => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    className="shop-modal-close"
                    onClick={handleClose}
                    type="button"
                    aria-label="Cerrar"
                >
                    <X size={20} />
                </button>

                <div className="shop-modal-grid">
                    {/* LEFT: IMAGE GALLERY */}
                    <div className="shop-modal-gallery">
                        <ProductImageCarousel imageUrls={selectedProduct.image_url} />
                    </div>

                    {/* RIGHT: PRODUCT DETAILS */}
                    <div className="shop-modal-details">
                        {/* META HEADER */}
                        <div className="shop-modal-meta">
                            {selectedProduct.category && (
                                <span className="shop-modal-category">
                                    <Tag size={12} />
                                    {selectedProduct.category}
                                </span>
                            )}
                            {selectedProduct.is_official && (
                                <span className="shop-modal-official-badge">
                                    <CheckCircle2 size={12} />
                                    Oficial Laika
                                </span>
                            )}
                        </div>

                        <h2 className="shop-modal-title">{selectedProduct.name}</h2>

                        {/* STOCK STATUS */}
                        <div className="shop-modal-stock-row">
                            <StockBadge stock={totalStock} />
                            {totalStock > 0 && totalStock <= 5 && (
                                <span className="shop-modal-urgency">
                                    <AlertCircle size={13} />
                                    Quedan pocas unidades
                                </span>
                            )}
                        </div>

                        {/* DESCRIPTION */}
                        {selectedProduct.description && (
                            <p className="shop-modal-description">
                                {selectedProduct.description}
                            </p>
                        )}

                        {/* VARIANT SELECTOR */}
                        <div className="shop-modal-variants">
                            <VariantSelector
                                product={selectedProduct}
                                onVariantSelected={handleVariantChange}
                            />
                        </div>

                        {/* QUANTITY SELECTOR */}
                        {activeVariant && !isOutOfStock && (
                            <div className="shop-modal-qty-container">
                                <span className="qty-label">Cantidad:</span>
                                <div className="qty-selector">
                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="qty-btn"
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="qty-value">{quantity}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                                        className="qty-btn"
                                        disabled={quantity >= maxQty}
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="qty-max-hint">
                                    (Máx. {maxQty} pzas)
                                </span>
                            </div>
                        )}

                        {/* TAGS */}
                        {tags.length > 0 && (
                            <div className="shop-modal-tags">
                                <span className="shop-modal-tags-label">Etiquetas:</span>
                                {tags.map(tag => (
                                    <span key={tag} className="shop-modal-tag">{tag}</span>
                                ))}
                            </div>
                        )}

                        {/* EVENT */}
                        {selectedProduct.event_name && (
                            <div className="shop-modal-event">
                                <Calendar size={14} />
                                <span>Evento: <strong>{selectedProduct.event_name}</strong></span>
                            </div>
                        )}

                        {/* ACTIONS */}
                        <div className="shop-modal-actions">
                            <button
                                className={`shop-modal-cart-btn ${(isOutOfStock || !activeVariant) ? 'disabled' : ''}`}
                                onClick={onAddToCartClick}
                                disabled={isOutOfStock || !activeVariant}
                                type="button"
                                id="modal-add-to-cart-btn"
                            >
                                <Package size={18} />
                                {isOutOfStock ? 'Agotado' : !activeVariant ? 'Selecciona una opción' : 'Agregar al carrito'}
                            </button>

                            <button
                                className={`shop-modal-wishlist-btn ${isFavorite(selectedProduct.id) ? 'active' : ''}`}
                                onClick={() => toggleFavorite(selectedProduct)}
                                type="button"
                                aria-label="Agregar a favoritos"
                            >
                                <Heart
                                    size={20}
                                    fill={isFavorite(selectedProduct.id) ? 'currentColor' : 'none'}
                                />
                            </button>
                        </div>

                        {/* SHIPPING INFO */}
                        <div className="shop-modal-shipping">
                            {selectedProduct.is_official ? (
                                <span className="shipping-free">Envío Laika incluido</span>
                            ) : (
                                <span className="shipping-pickup">Disponible para recogida en evento</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <div className="shop-modal-reviews-section">
                    <h3 className="reviews-section-title">Opiniones de los clientes</h3>
                    <div className="reviews-summary">
                        <div className="reviews-average">
                            <span className="avg-number">
                                {selectedProduct.rating !== undefined && selectedProduct.rating !== null 
                                    ? Number(selectedProduct.rating).toFixed(1) 
                                    : '0.0'}
                            </span>
                            <div className="stars-row">
                                {[...Array(5)].map((_, i) => {
                                    const isFilled = i < Math.floor(selectedProduct.rating || 0);
                                    return <Star key={i} size={16} fill={isFilled ? "#ff9900" : "none"} color={isFilled ? "#ff9900" : "#ccc"} />;
                                })}
                            </div>
                            <span className="reviews-count">({reviews.length} calificaciones)</span>
                        </div>
                        
                        {/* REVIEW SUBMISSION FORM */}
                        {user ? (
                            hasPurchased ? (
                                <form onSubmit={handleReviewSubmit} className="review-form">
                                    <h4>Escribe tu opinión</h4>
                                    <div className="rating-picker">
                                        <span>Tu calificación:</span>
                                        <div className="stars-picker-row">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className="star-picker-btn"
                                                    onClick={() => setFormRating(star)}
                                                >
                                                    <Star
                                                        size={22}
                                                        fill={star <= formRating ? "#ff9900" : "none"}
                                                        color={star <= formRating ? "#ff9900" : "#ccc"}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="comment-input-wrapper">
                                        <textarea
                                            placeholder="Comparte tu experiencia con este producto..."
                                            value={formComment}
                                            onChange={(e) => setFormComment(e.target.value)}
                                            required
                                            rows={3}
                                        />
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="submit-review-btn">
                                        {isSubmitting ? 'Enviando...' : 'Publicar comentario'}
                                    </button>
                                </form>
                            ) : (
                                <div className="login-to-review purchase-required">
                                    <p>Solo puedes calificar u opinar sobre este producto si ya lo has comprado.</p>
                                </div>
                            )
                        ) : (
                            <div className="login-to-review">
                                <p>Debes iniciar sesión para calificar este producto.</p>
                                <button type="button" className="btn-login-redirect" onClick={() => { setSelectedProduct(null); navigate('/login'); }}>
                                    Iniciar sesión
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* REVIEWS LIST */}
                    <div className="reviews-list">
                        {reviews.length === 0 ? (
                            <p className="no-reviews">Aún no hay opiniones para este producto. ¡Sé el primero en calificarlo!</p>
                        ) : (
                            reviews.map((rev) => (
                                <div key={rev.id} className="review-item">
                                    <div className="review-header">
                                        <span className="reviewer-name">{rev.user_name}</span>
                                        <span className="review-date">{new Date(rev.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="review-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < rev.rating ? "#ff9900" : "none"}
                                                color={i < rev.rating ? "#ff9900" : "#ccc"}
                                            />
                                        ))}
                                    </div>
                                    {rev.comment && <p className="review-comment">{rev.comment}</p>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;

