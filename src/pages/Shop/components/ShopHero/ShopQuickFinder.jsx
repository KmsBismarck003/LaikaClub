import React, { useState, useEffect } from 'react';
import { Filter, RotateCcw, Sparkles } from 'lucide-react';

/**
 * ShopQuickFinder - Quick product search/filter bento card (Proposal 1 & 2 Fusion)
 * Allows rapid selection of Category and Event/Collection with direct catalog jump.
 */
const ShopQuickFinder = ({
    categories = [],
    events = [],
    activeCategory = 'all',
    selectedEventId = 'all',
    onApplyFilter,
    onResetFilter
}) => {
    const [localCategory, setLocalCategory] = useState(activeCategory);
    const [localEventId, setLocalEventId] = useState(selectedEventId);

    // Sync with parent props if changed externally
    useEffect(() => {
        setLocalCategory(activeCategory);
    }, [activeCategory]);

    useEffect(() => {
        setLocalEventId(selectedEventId);
    }, [selectedEventId]);

    const handleApply = (e) => {
        e.preventDefault();
        if (onApplyFilter) {
            onApplyFilter({
                category: localCategory,
                eventId: localEventId
            });
        }

        // Smooth scroll to catalog toolbar
        const toolbar = document.querySelector('.shop-toolbar') || document.querySelector('.shop-marketplace-layout');
        if (toolbar) {
            toolbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleReset = (e) => {
        e.preventDefault();
        setLocalCategory('all');
        setLocalEventId('all');
        if (onResetFilter) {
            onResetFilter();
        }
    };

    const isFiltered = localCategory !== 'all' || localEventId !== 'all';

    return (
        <div className="shop-quick-finder">
            <div className="shop-quick-finder__header">
                <div className="shop-quick-finder__title-group">
                    <span className="shop-quick-finder__eyebrow">
                        <Sparkles size={12} />
                        BUSCADOR RÁPIDO
                    </span>
                    <h3 className="shop-quick-finder__title">ENCUENTRA TU PRODUCTO</h3>
                </div>
                {isFiltered && (
                    <button
                        type="button"
                        className="shop-quick-finder__reset-btn"
                        onClick={handleReset}
                        title="Restablecer filtros"
                    >
                        <RotateCcw size={13} />
                        <span>Limpiar</span>
                    </button>
                )}
            </div>

            <form className="shop-quick-finder__form" onSubmit={handleApply}>
                <div className="shop-quick-finder__field">
                    <label htmlFor="quick-category-select" className="shop-quick-finder__label">
                        Categoría
                    </label>
                    <div className="shop-quick-finder__select-wrapper">
                        <select
                            id="quick-category-select"
                            className="shop-quick-finder__select"
                            value={localCategory}
                            onChange={(e) => setLocalCategory(e.target.value)}
                        >
                            <option value="all">Todas las categorías</option>
                            {categories.map((cat) => {
                                const val = typeof cat === 'string' ? cat : cat.key;
                                const label = typeof cat === 'string' ? cat : cat.name;
                                return (
                                    <option key={val} value={val}>
                                        {label.charAt(0).toUpperCase() + label.slice(1)}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                <div className="shop-quick-finder__field">
                    <label htmlFor="quick-event-select" className="shop-quick-finder__label">
                        Evento o Colección
                    </label>
                    <div className="shop-quick-finder__select-wrapper">
                        <select
                            id="quick-event-select"
                            className="shop-quick-finder__select"
                            value={localEventId}
                            onChange={(e) => setLocalEventId(e.target.value)}
                        >
                            <option value="all">Todos los eventos / Colecciones</option>
                            {events.map((evt) => (
                                <option key={evt.id} value={evt.id}>
                                    {evt.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="shop-quick-finder__submit-btn"
                >
                    <Filter size={16} />
                    <span>FILTRAR CATÁLOGO</span>
                </button>
            </form>
        </div>
    );
};

export default ShopQuickFinder;
