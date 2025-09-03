import React from 'react';
import Icon from '../../../components/AppIcon';

const SupermarketTabs = ({ selectedMarket, onMarketChange, totalCosts }) => {
  const supermarkets = [
    {
      id: 'coop',
      name: 'Coop',
      icon: 'Store',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'conad',
      name: 'Conad',
      icon: 'ShoppingBag',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      id: 'esselunga',
      name: 'Esselunga',
      icon: 'Building2',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'average',
      name: 'Media',
      icon: 'Calculator',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="glass-morphism px-4 py-3 border-b border-border">
      <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar">
        {supermarkets?.map((market) => {
          const isSelected = selectedMarket === market?.id;
          const cost = totalCosts?.[market?.id] || 0;
          
          return (
            <button
              key={market?.id}
              onClick={() => onMarketChange(market?.id)}
              className={`
                flex-shrink-0 flex flex-col items-center space-y-1 px-4 py-3 rounded-lg
                transition-all duration-150 min-w-20 touch-target
                ${isSelected 
                  ? `${market?.bgColor} ${market?.color} border border-current` 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                }
              `}
            >
              <Icon 
                name={market?.icon} 
                size={20} 
                color={isSelected ? 'currentColor' : 'var(--color-muted-foreground)'} 
              />
              <span className="text-xs font-medium">{market?.name}</span>
              <span className="text-xs font-semibold">
                €{cost?.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SupermarketTabs;