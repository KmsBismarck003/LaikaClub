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

    return (
        <div className="product-results-v2">
            <div className="grid-dense-v2">
                {currentProducts.map(p => (
                    <div key={p.id} className="pro-card-v2" onClick={() => handleQuickView(p)}>
                        <div className="p-card-image">
                            {p.isOfficial && <span className="brand-tag">TOUR OFICIAL</span>}
                            {p.isNew && <span className="p-new-badge">NUEVO</span>}
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
                            <img src={p.image_url} alt={p.name} />
                            
                            <div className="p-card-overlay">
                                <button className="quick-btn" onClick={(e) => { e.stopPropagation(); handleQuickView(p); }}>
                                    Ver Detalle
                                </button>
                            </div>
                        </div>
                        <div className="p-card-body">
                            <h4 className="p-title">{p.name}</h4>
                            <div className="p-price">${(p.variants?.[0]?.price || 0).toFixed(2)}</div>
                            
                            <div className="p-official-extras">
                                <div className="color-indicators">
                                    <span className="color-dot active"></span>
                                    <span className="color-dot"></span>
                                    <span className="color-dot"></span>
                                </div>
                            </div>
                            
                            <div className="p-variants-quick">
                                <select onClick={e => e.stopPropagation()} defaultValue="">
                                    <option value="" disabled>Color / Talla</option>
                                    {p.variants?.map(v => (
                                        <option key={v.id} value={v.id}>{v.color} - {v.size}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                className="add-to-cart-outline-btn secondary-premium"
                                onClick={(e) => handleAddToCart(e, p, p.variants?.[0])}
                            >
                                <ShoppingBag size={14} />
                                AGREGAR AL CARRITO
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {totalProductsCount === 0 && (
                <div className="no-res-v2">
                    <Search size={48} />
                    <h3>No se encontraron productos</h3>
                    <button className="laika-btn secondary" onClick={onResetFilters}>RESETEAR FILTROS</button>
                </div>
            )}

            {/* PAGINATION UI FIXED PLACEMENT */}
            {totalPages > 1 && (
                <div className="shop-pagination-v2">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="pag-btn side-nav"
                    >
                        &larr; ANTERIOR
                    </button>
                    
                    <div className="pag-nums">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`pag-btn num ${currentPage === i + 1 ? 'active' : ''}`}
                            >
                                {String(i + 1).padStart(2, '0')}
                            </button>
                        ))}
                    </div>

                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="pag-btn side-nav"
                    >
                        SIGUIENTE &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
