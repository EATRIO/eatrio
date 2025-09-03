import React from 'react';
import Icon from '../../../components/AppIcon';

const StorageLocationTabs = ({
  activeLocation,
  onLocationChange,
  className = '',
}) => {
  const locations = [
    { id: 'all',    label: 'Tutto',    icon: 'Package' },
    { id: 'pantry', label: 'Dispensa', icon: 'Home' },
    { id: 'fridge', label: 'Frigo',    icon: 'Refrigerator' },
    { id: 'freezer',label: 'Freezer',  icon: 'Snowflake' },
  ];

  return (
    <div className={`px-4 py-3 overflow-x-auto custom-scrollbar ${className}`}>
      <div className="flex space-x-2">
        {locations.map((location) => {
          const isActive = activeLocation === location.id;
          return (
            <button
              key={location.id}
              onClick={() => onLocationChange(location.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all active:scale-98 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <Icon
                name={location.icon}
                size={16}
                color={isActive ? 'var(--color-primary-foreground)' : 'currentColor'}
              />
              <span className="text-sm font-medium">{location.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StorageLocationTabs;