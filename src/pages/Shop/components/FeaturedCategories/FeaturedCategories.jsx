import React, { useMemo } from 'react';
import { 
    Layers, 
    Shirt, 
    Tag, 
    Trophy, 
    Coffee, 
    ShoppingBag, 
    Sparkles 
} from 'lucide-react';
import './FeaturedCategories.css';

/**
 * Helper to match category string with appropriate Lucide SVG icon
 */
const getCategoryIcon = (categoryKey) => {
    const key = (categoryKey || '').toLowerCase();
    switch (key) {
        case 'all':
            return <Layers size={18} />;
        case 'ropa':
            return <Shirt size={18} />;
        case 'accesorios':
            return <Tag size={18} />;
        case 'coleccionables':
            return <Trophy size={18} />;
        case 'vasos':
            return <Coffee size={18} />;
        default:
            return <ShoppingBag size={18} />;
    }
};

/**
 * FeaturedCategories - Horizontal category card ribbon (Proposal 1 & 2 Fusion)
 * Displays dynamic categories with live counts computed from actual product list.
 */
const FeaturedCategories = ({
    categories = [],
    activeCategory = 'all',
    onSelectCategory,
    products = []
}) => {
    // Dynamically calculate product counts per category from the real products array
    const categoriesWithCounts = useMemo(() => {
        // Count for all
        const totalCount = products.length;

        // Map count per category
        const counts = {};
        products.forEach(p => {
            const cat = (p.category || 'otros').toLowerCase();
            counts[cat] = (counts[cat] || 0) + 1;
        });

        // If categories prop is array of strings or objects, normalize:
        const list = [
            {
                key: 'all',
                name: 'Todos',
                count: totalCount,
                description: 'Ver catálogo completo'
            }
        ];

        // Known order or detected categories from products
        const uniqueKeys = new Set(
            categories.map(c => typeof c === 'string' ? c.toLowerCase() : c.key?.toLowerCase()).filter(Boolean)
        );

        // Also add any categories found in products that might not be in the list
        Object.keys(counts).forEach(k => uniqueKeys.add(k));

        uniqueKeys.forEach(k => {
            if (k === 'all') return;
            const count = counts[k] || 0;
            // Capitalize display name
            const name = k.charAt(0).toUpperCase() + k.slice(1);
            list.push({
                key: k,
                name: name,
                count: count,
                description: `${count} artículo${count === 1 ? '' : 's'}`
            });
        });

        return list;
    }, [categories, products]);

    return (
        <section className="featured-categories" aria-label="Categorías de productos">
            <div className="featured-categories__header">
                <div className="featured-categories__title-wrap">
                    <span className="featured-categories__eyebrow">
                        <Sparkles size={13} />
                        EXPLORA POR SECCIÓN
                    </span>
                    <h3 className="featured-categories__title">CATEGORÍAS DESTACADAS</h3>
                </div>
                <span className="featured-categories__total-badge">
                    {products.length} productos en catálogo
                </span>
            </div>

            <div className="featured-categories__row">
                {categoriesWithCounts.map((cat) => {
                    const isActive = activeCategory.toLowerCase() === cat.key.toLowerCase();
                    return (
                        <button
                            key={cat.key}
                            type="button"
                            className={`featured-categories__card ${isActive ? 'featured-categories__card--active' : ''}`}
                            onClick={() => onSelectCategory && onSelectCategory(cat.key)}
                        >
                            <div className="featured-categories__icon-wrap">
                                {getCategoryIcon(cat.key)}
                            </div>
                            <div className="featured-categories__info">
                                <span className="featured-categories__name">{cat.name}</span>
                                <span className="featured-categories__count">
                                    {cat.count} {cat.count === 1 ? 'artículo' : 'artículos'}
                                </span>
                            </div>
                            {isActive && <div className="featured-categories__active-bar" />}
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default FeaturedCategories;
