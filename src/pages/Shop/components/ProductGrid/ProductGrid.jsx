import React, { memo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductGrid.css';

const EmptyState = ({ onResetFilters }) => (
    <div className="product-grid__empty">
        <div className="empty-icon-wrap">
            <Search size={40} strokeWidth={1.5} />
        </div>
        <h3 className="empty-title">Sin resultados</h3>
        <p className="empty-description">
            No encontramos productos que coincidan con tu búsqueda o filtros actuales.
        </p>
        <button
            className="empty-reset-btn"
            onClick={onResetFilters}
            type="button"
        >
            Limpiar filtros
        </button>
    </div>
);

const ProductGrid = memo(({
    currentProducts,
    totalProductsCount,
    handleQuickView,
    handleAddToCart,
    onResetFilters,
    currentPage,
    totalPages,
    handlePageChange,
}) => {
    if (totalProductsCount === 0) {
        return <EmptyState onResetFilters={onResetFilters} />;
    }

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages = [];
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        return pages;
    };

    return (
        <div className="product-grid">
            <div className="product-grid__items">
                {currentProducts.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={handleQuickView}
                        onAddToCart={handleAddToCart}
                    />
                ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <nav className="product-grid__pagination" aria-label="Navegación de páginas">
                    <button
                        className="pagination-nav-btn"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-label="Página anterior"
                        type="button"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="pagination-pages">
                        {getPageNumbers().map((page, i) => (
                            page === '...' ? (
                                <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
                            ) : (
                                <button
                                    key={page}
                                    className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                    type="button"
                                    aria-label={`Ir a página ${page}`}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                    </div>

                    <button
                        className="pagination-nav-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        aria-label="Página siguiente"
                        type="button"
                    >
                        <ChevronRight size={18} />
                    </button>
                </nav>
            )}
        </div>
    );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
