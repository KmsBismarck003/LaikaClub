import React, { useState } from 'react';
import { X, Heart } from 'lucide-react';
import { useFavorites } from '../../../../context/FavoritesContext';
import ProductImageCarousel from './ProductImageCarousel';
import VariantSelector from './VariantSelector';

const ProductModal = ({
    selectedProduct,
    setSelectedProduct,
    handleAddToCart
}) => {
    const { toggleFavorite, isFavorite } = useFavorites();
    const [activeVariant, setActiveVariant] = useState(null);
    const [isOutOfStock, setIsOutOfStock] = useState(false);

    if (!selectedProduct) return null;

    const handleVariantChange = (variant, outOfStock) => {
        setActiveVariant(variant);
        setIsOutOfStock(outOfStock);
    };

    const onAddToCartClick = () => {
        if (!activeVariant || isOutOfStock) return;
        handleAddToCart(null, selectedProduct, activeVariant);
    };

    return (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="quick-view-modal" onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={() => setSelectedProduct(null)} type="button">
                    <X size={24}/>
                </button>
                
                <div className="modal-content-grid">
                    {/* LEFT: IMAGE VIEW CAROUSEL */}
                    <div className="modal-image-col">
                        <ProductImageCarousel imageUrls={selectedProduct.image_url} />
                    </div>

                    {/* RIGHT: INDUSTRIAL DETAILS */}
                    <div className="modal-info-col">
                        <div className="modal-header-meta">
                            <span className="modal-brand-tag">
                                {selectedProduct.category?.toUpperCase() || 'EQUIPO OFICIAL'}
                            </span>
                            {selectedProduct.is_official && (
                                <span className="modal-new-tag">OFICIAL LAIKA</span>
                            )}
                        </div>

                        <h2 className="modal-title">{selectedProduct.name}</h2>
                        
                        <p className="modal-description">{selectedProduct.description}</p>
                        
                        {/* SELECTOR DE VARIANTES MODULAR */}
                        <div className="modal-variants-section">
                            <VariantSelector 
                                product={selectedProduct} 
                                onVariantSelected={handleVariantChange} 
                            />
                        </div>

                        <div className="modal-actions-tier">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button 
                                    className={`add-to-cart-outline-btn secondary-premium large ${isOutOfStock ? 'disabled-btn' : ''}`}
                                    onClick={onAddToCartClick}
                                    style={{ flex: 1 }}
                                    disabled={isOutOfStock || !activeVariant}
                                    type="button"
                                >
                                    {isOutOfStock ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                                </button>
                                <button 
                                    className={`modal-wishlist-btn ${isFavorite(selectedProduct.id) ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(selectedProduct)}
                                    type="button"
                                    style={{
                                        width: '54px', height: '54px',
                                        display: 'flex', alignItems: 'center', justifyItems: 'center',
                                        alignContent: 'center', justifyContent: 'center',
                                        background: isFavorite(selectedProduct.id) ? 'rgba(255, 60, 0, 0.1)' : '#f5f5f5',
                                        border: `1px solid ${isFavorite(selectedProduct.id) ? '#ff3c00' : '#ddd'}`,
                                        color: isFavorite(selectedProduct.id) ? '#ff3c00' : '#000',
                                        borderRadius: '50%',
                                        cursor: 'pointer', transition: 'all 0.3s'
                                    }}
                                >
                                    <Heart size={20} fill={isFavorite(selectedProduct.id) ? '#ff3c00' : 'none'} />
                                </button>
                            </div>
                            <p className="modal-availability-hint">
                                {isOutOfStock ? 'No disponible temporalmente' : 'Disponible para entrega inmediata'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
