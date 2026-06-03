import React from 'react';
import { Search, Heart, ShoppingBag } from 'lucide-react';
import { useFavorites } from '../../../../context/FavoritesContext';

const ProductGrid = ({
    currentProducts,
    totalProductsCount,
    handleQuickView,
    handleAddToCart,
    onResetFilters,
    currentPage,
    totalPages,
    handlePageChange
}) => {
    const { toggleFavorite, isFavorite } = useFavorites();

    const formatVariantName = (variant) => {
        if (!variant.attributes || Object.keys(variant.attributes).length === 0) {
            return `SKU: ${variant.sku || 'Estandar'}`;
        }
        return Object.entries(variant.attributes)
            .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
            .join(' | ');
    };

    return (
        <div className="product-results-v2">
            <div className="grid-dense-v2">
                {currentProducts.map(p => {
                    const allVariantsOutOfStock = !p.variants || p.variants.length === 0 || p.variants.every(v => v.stock <= 0);
                    const defaultVariant = p.variants?.[0];

                    return (
                        <div key={p.id} className="pro-card-v2" onClick={() => handleQuickView(p)}>
                            <div className="p-card-image">
                                {p.is_official && <span className="brand-tag">OFICIAL LAIKA</span>}
                                {allVariantsOutOfStock && <span className="p-new-badge" style={{ background: '#555' }}>AGOTADO</span>}
                                <div 
                                    className={`p-wishlist-btn ${isFavorite(p.id) ? 'active' : ''}`} 
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}
                                    style={{ 
                                        color: isFavorite(p.id) ? '#ff3c00' : 'white',
                                        background: isFavorite(p.id) ? 'rgba(255, 60, 0, 0.1)' : 'rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <Heart size={18} fill={isFavorite(p.id) ? '#ff3c00' : 'none'} />
                                </div>
                                <img src={p.image_url?.split(',')[0]} alt={p.name} />
                                
                                <div className="p-card-overlay">
                                    <button className="quick-btn" onClick={(e) => { e.stopPropagation(); handleQuickView(p); }} type="button">
                                        Ver Detalle
                                    </button>
                                </div>
                            </div>
                            <div className="p-card-body">
                                <h4 className="p-title">{p.name}</h4>
                                <div className="p-price">
                                    ${defaultVariant ? (parseFloat(defaultVariant.price) || 0).toFixed(2) : '0.00'}
                                </div>
                                
                                <div className="p-variants-quick">
                                    <select onClick={e => e.stopPropagation()} defaultValue="" disabled={allVariantsOutOfStock}>
                                        {allVariantsOutOfStock ? (
                                            <option value="">Agotado</option>
                                        ) : (
                                            <>
                                                <option value="" disabled>Seleccionar Opcion</option>
                                                {p.variants?.map(v => (
                                                    <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                                                        {formatVariantName(v)} {v.stock <= 0 ? '(Agotado)' : ''}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>

                                <button 
                                    className={`add-to-cart-outline-btn secondary-premium ${allVariantsOutOfStock ? 'disabled-btn' : ''}`}
                                    onClick={(e) => {
                                        if (allVariantsOutOfStock) return;
                                        handleAddToCart(e, p, defaultVariant);
                                    }}
                                    disabled={allVariantsOutOfStock}
                                    type="button"
                                >
                                    <ShoppingBag size={14} />
                                    {allVariantsOutOfStock ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {totalProductsCount === 0 && (
                <div className="no-res-v2">
                    <Search size={48} />
                    <h3>No se encontraron productos</h3>
                    <button className="laika-btn secondary" onClick={onResetFilters} type="button">RESETEAR FILTROS</button>
                </div>
            )}

            {/* PAGINATION UI */}
            {totalPages > 1 && (
                <div className="shop-pagination-v2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="pag-btn side-nav"
                        type="button"
                    >
                        &larr; ANTERIOR
                    </button>
                    
                    <div className="pag-nums">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`pag-btn num ${currentPage === i + 1 ? 'active' : ''}`}
                                type="button"
                            >
                                {String(i + 1).padStart(2, '0')}
                            </button>
                        ))}
                    </div>

                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="pag-btn side-nav"
                        type="button"
                    >
                        SIGUIENTE &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
