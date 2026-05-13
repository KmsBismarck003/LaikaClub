import React from 'react';
import { X, Heart } from 'lucide-react';
import { useFavorites } from '../../../../context/FavoritesContext';

const ProductModal = ({
    selectedProduct,
    selectedVariant,
    setSelectedProduct,
    setSelectedVariant,
    handleAddToCart
}) => {
    const { toggleFavorite, isFavorite } = useFavorites();
    if (!selectedProduct) return null;

    return (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="quick-view-modal" onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={() => setSelectedProduct(null)}>
                    <X size={24}/>
                </button>
                
                <div className="modal-content-grid">
                    {/* LEFT: IMAGE VIEW */}
                    <div className="modal-image-col">
                        <div className="modal-img-container">
                            <img src={selectedProduct.image_url} alt={selectedProduct.name} />
                        </div>
                    </div>

                    {/* RIGHT: INDUSTRIAL DETAILS */}
                    <div className="modal-info-col">
                        <div className="modal-header-meta">
                            <span className="modal-brand-tag">{selectedProduct.brand?.toUpperCase() || 'EQUIPO OFICIAL'}</span>
                            {selectedProduct.isNew && <span className="modal-new-tag">NUEVO LANZAMIENTO</span>}
                        </div>

                        <h2 className="modal-title">{selectedProduct.name}</h2>
                        <div className="modal-price-tier">
                            ${(selectedVariant?.price || selectedProduct.variants?.[0]?.price || 0).toFixed(2)}
                        </div>

                        <p className="modal-description">{selectedProduct.description}</p>
                        
                        <div className="modal-variants-section">
                            <label className="variant-label">SELECCIONAR ESPECIFICACIONES</label>
                            <div className="variants-industrial-grid">
                                {selectedProduct.variants?.map(v => (
                                    <button 
                                        key={v.id} 
                                        className={`variant-pill ${selectedVariant?.id === v.id ? 'active' : ''}`}
                                        onClick={() => setSelectedVariant(v)}
                                    >
                                        {v.size || v.color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions-tier">
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <button 
                                    className="add-to-cart-outline-btn secondary-premium large" 
                                    onClick={() => handleAddToCart(null, selectedProduct, selectedVariant)}
                                    style={{ flex: 1 }}
                                >
                                    AGREGAR AL CARRITO
                                </button>
                                <button 
                                    className={`modal-wishlist-btn ${isFavorite(selectedProduct.id) ? 'active' : ''}`}
                                    onClick={() => toggleFavorite(selectedProduct)}
                                    style={{
                                        width: '54px', height: '54px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                            <p className="modal-availability-hint">DISPONIBLE PARA ENVÍO INMEDIATO</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
