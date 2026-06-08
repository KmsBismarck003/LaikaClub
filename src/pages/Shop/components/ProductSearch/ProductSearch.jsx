import React, { useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import './ProductSearch.css';

const ProductSearch = ({
    searchTerm,
    onSearchChange,
    onClear,
    totalResults,
    onToggleFilters,
    filtersOpen
}) => {
    const inputRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="shop-search-container">
            <div className="shop-search-bar">
                <Search className="search-icon-prefix" size={20} />
                <input
                    ref={inputRef}
                    type="text"
                    className="shop-search-input"
                    placeholder="Buscar productos, categorías, colecciones..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    aria-label="Buscar productos"
                    id="shop-search-input"
                />
                {searchTerm && (
                    <button
                        className="search-clear-btn"
                        onClick={onClear}
                        aria-label="Limpiar búsqueda"
                        type="button"
                    >
                        <X size={16} />
                    </button>
                )}
                <div className="search-kbd-hint">
                    <kbd>Ctrl</kbd><kbd>K</kbd>
                </div>
            </div>

            <button
                className={`shop-filters-toggle ${filtersOpen ? 'active' : ''}`}
                onClick={onToggleFilters}
                type="button"
                aria-label="Mostrar filtros"
                id="shop-filters-toggle-btn"
            >
                <SlidersHorizontal size={18} />
                <span>Filtros</span>
                {filtersOpen && <span className="filters-active-dot" />}
            </button>

            {totalResults !== undefined && (
                <div className="search-results-count">
                    <span>{totalResults}</span>
                    <span className="count-label">
                        {totalResults === 1 ? 'producto' : 'productos'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProductSearch;
