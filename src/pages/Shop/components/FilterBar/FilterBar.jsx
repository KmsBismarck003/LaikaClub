import React from 'react';

const FilterBar = ({ activeCategory, setActiveCategory }) => {
    const categories = ['all', 'Playeras', 'Sudaderas', 'Gorras', 'Vinilos', 'Tazas', 'Vasos', 'Llaveros', 'Stickers', 'Pósters'];

    return (
        <div className="horizontal-filter-bar">
            <div className="category-chips">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat === 'all' ? 'TODO' : cat.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;
