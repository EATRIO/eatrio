import React from 'react';
import Icon from '../../../components/AppIcon';

const FilterChips = ({ 
  activeFilters, 
  onFilterChange, 
  onShowAdvancedFilters,
  className = '' 
}) => {
  const quickFilters = [
    { id: 'quick', label: 'Veloce (≤30min)', icon: 'Zap' },
    { id: 'easy', label: 'Facile', icon: 'Smile' },
    { id: 'available', label: 'Ingredienti disponibili', icon: 'Check' },
    { id: 'favorites', label: 'Preferiti', icon: 'Heart' },
    { id: 'vegetarian', label: 'Vegetariano', icon: 'Leaf' },
    { id: 'budget', label: 'Economico', icon: 'Euro' }
  ];

  const handleChipClick = (filterId) => {
    const newFilters = { ...activeFilters };
    newFilters[filterId] = !newFilters?.[filterId];
    onFilterChange(newFilters);
  };

  return (
    <div className={`flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2 ${className}`}>
      {quickFilters?.map((filter) => {
        const isActive = activeFilters?.[filter?.id];
        return (
          <button
            key={filter?.id}
            onClick={() => handleChipClick(filter?.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-all duration-150 active:scale-98
              ${isActive 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            <Icon 
              name={filter?.icon} 
              size={16} 
              color={isActive ? 'var(--color-primary-foreground)' : 'currentColor'}
            />
            <span>{filter?.label}</span>
          </button>
        );
      })}
      {/* Advanced Filters Button */}
      <button
        onClick={onShowAdvancedFilters}
        className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-150 active:scale-98"
      >
        <Icon name="SlidersHorizontal" size={16} />
        <span>Filtri</span>
      </button>
    </div>
  );
};

export default FilterChips;