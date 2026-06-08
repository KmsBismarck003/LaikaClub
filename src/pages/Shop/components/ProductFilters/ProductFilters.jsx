import React from 'react';
import { X, Tag, DollarSign, LayoutGrid, CheckCircle2, TrendingUp, Clock, ArrowUpDown } from 'lucide-react';
import './ProductFilters.css';

const CATEGORIES = [
    { id: 'all', label: 'Todos' },
    { id: 'Playeras', label: 'Playeras' },
    { id: 'Sudaderas', label: 'Sudaderas' },
    { id: 'Gorras', label: 'Gorras' },
    { id: 'Vinilos', label: 'Vinilos' },
    { id: 'Tazas', label: 'Tazas' },
    { id: 'Vasos', label: 'Vasos' },
    { id: 'Llaveros', label: 'Llaveros' },
    { id: 'Stickers', label: 'Stickers' },
    { id: 'Pósters', label: 'Pósters' },
    { id: 'Accesorios', label: 'Accesorios' },
];

const SORT_OPTIONS = [
    { id: 'popular', label: 'Más populares', icon: TrendingUp },
    { id: 'newest', label: 'Más recientes', icon: Clock },
    { id: 'price_asc', label: 'Menor precio', icon: ArrowUpDown },
    { id: 'price_desc', label: 'Mayor precio', icon: ArrowUpDown },
];

const AVAILABILITY_OPTIONS = [
    { id: 'all', label: 'Todos' },
    { id: 'in_stock', label: 'Con stock' },
    { id: 'out_of_stock', label: 'Sin stock' },
];

const ProductFilters = ({
    isOpen,
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    availability,
    setAvailability,
    priceRange,
    setPriceRange,
    maxPrice,
    activeFiltersCount,
    onResetAll,
}) => {
    if (!isOpen) return null;

    return (
        <div className="product-filters-panel" role="region" aria-label="Filtros de productos">
            {/* Header */}
            <div className="filters-panel-header">
                <h3 className="filters-panel-title">
                    Filtros
                </h3>
                {activeFiltersCount > 0 && (
                    <button
                        className="filters-reset-all"
                        onClick={onResetAll}
                        type="button"
                    >
                        <X size={14} />
                        Limpiar ({activeFiltersCount})
                    </button>
                )}
            </div>

            <div className="filters-panel-body">
                {/* CATEGORY */}
                <div className="filter-group">
                    <div className="filter-group-header">
                        <LayoutGrid size={15} />
                        <span className="filter-group-label">Categoría</span>
                    </div>
                    <div className="filter-chips-grid">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`filter-chip-v3 ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                                type="button"
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SORT */}
                <div className="filter-group">
                    <div className="filter-group-header">
                        <ArrowUpDown size={15} />
                        <span className="filter-group-label">Ordenar por</span>
                    </div>
                    <div className="sort-options-list">
                        {SORT_OPTIONS.map(option => (
                            <button
                                key={option.id}
                                className={`sort-option-btn ${sortBy === option.id ? 'active' : ''}`}
                                onClick={() => setSortBy(option.id)}
                                type="button"
                            >
                                <option.icon size={14} />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AVAILABILITY */}
                <div className="filter-group">
                    <div className="filter-group-header">
                        <CheckCircle2 size={15} />
                        <span className="filter-group-label">Disponibilidad</span>
                    </div>
                    <div className="filter-chips-grid">
                        {AVAILABILITY_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                className={`filter-chip-v3 ${availability === opt.id ? 'active' : ''}`}
                                onClick={() => setAvailability(opt.id)}
                                type="button"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRICE RANGE */}
                <div className="filter-group">
                    <div className="filter-group-header">
                        <DollarSign size={15} />
                        <span className="filter-group-label">Precio máximo</span>
                        <span className="price-range-value">${priceRange.toLocaleString('es-MX')}</span>
                    </div>
                    <div className="price-range-wrapper">
                        <input
                            type="range"
                            className="price-range-slider"
                            min={0}
                            max={maxPrice}
                            step={50}
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            aria-label="Rango de precio"
                        />
                        <div className="price-range-labels">
                            <span>$0</span>
                            <span>${maxPrice.toLocaleString('es-MX')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;
