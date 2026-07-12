import React from 'react';
import { Icon } from '../../../../components';
import './CategoryFilter.css';

const CATEGORIES = [
  { id: 'all',      name: 'Todos',      icon: 'grid'     },
  { id: 'concert',  name: 'Conciertos', icon: 'music'    },
  { id: 'sport',    name: 'Deportes',   icon: 'sport'    },
  { id: 'theater',  name: 'Teatro',     icon: 'theater'  },
  { id: 'festival', name: 'Festivales', icon: 'festival' },
  { id: 'family',   name: 'Familiares', icon: 'heart'    },
  { id: 'other',    name: 'Otros',      icon: 'sparkles' },
];

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="category-filter">

      {/* Category chips */}
      <div className="cf-chips" role="group" aria-label="Filtrar por categoría">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            id={`category-chip-${cat.id}`}
            className={`cf-chip ${selectedCategory === cat.id ? 'cf-chip--active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
            aria-pressed={selectedCategory === cat.id}
          >
            <Icon name={cat.icon} size={14} />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
