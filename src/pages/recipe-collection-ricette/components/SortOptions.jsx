import React from 'react';
import Icon from '../../../components/AppIcon';

const SortOptions = ({ 
  currentSort, 
  onSortChange, 
  className = '' 
}) => {
  const sortOptions = [
    { id: 'relevance', label: 'Rilevanza', icon: 'Star' },
    { id: 'time', label: 'Tempo di cottura', icon: 'Clock' },
    { id: 'cost', label: 'Costo', icon: 'Euro' },
    { id: 'difficulty', label: 'Difficoltà', icon: 'TrendingUp' },
    { id: 'popularity', label: 'Popolarità', icon: 'Heart' },
    { id: 'newest', label: 'Più recenti', icon: 'Calendar' }
  ];

  return (
    <div className={`flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap mr-2">
        Ordina per:
      </span>
      {sortOptions?.map((option) => {
        const isActive = currentSort === option?.id;
        return (
          <button
            key={option?.id}
            onClick={() => onSortChange(option?.id)}
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
              name={option?.icon} 
              size={16} 
              color={isActive ? 'var(--color-primary-foreground)' : 'currentColor'}
            />
            <span>{option?.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SortOptions;