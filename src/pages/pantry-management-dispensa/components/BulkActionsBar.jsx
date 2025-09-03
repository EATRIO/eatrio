import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionsBar = ({ 
  selectedCount, 
  onMoveToLocation, 
  onMarkAsUsed, 
  onDelete, 
  onCancel 
}) => {
  const [showLocationMenu, setShowLocationMenu] = React.useState(false);

  const locations = [
    { id: 'pantry', label: 'Dispensa', icon: 'Home' },
    { id: 'fridge', label: 'Frigo', icon: 'Refrigerator' },
    { id: 'freezer', label: 'Freezer', icon: 'Snowflake' }
  ];

  const handleMoveToLocation = (locationId) => {
    onMoveToLocation?.(locationId);
    setShowLocationMenu(false);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 z-90">
      <div className="glass-morphism rounded-lg p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">
                {selectedCount}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {selectedCount} elemento{selectedCount !== 1 ? 'i' : ''} selezionat{selectedCount !== 1 ? 'i' : 'o'}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            iconName="X"
            iconSize={16}
          >
            Annulla
          </Button>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {/* Move to Location */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLocationMenu(!showLocationMenu)}
              iconName="Move"
              iconSize={16}
            >
              Sposta
            </Button>
            
            {showLocationMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-popover border border-border rounded-lg shadow-lg min-w-32">
                {locations?.map((location) => (
                  <button
                    key={location?.id}
                    onClick={() => handleMoveToLocation(location?.id)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-muted/20 first:rounded-t-lg last:rounded-b-lg transition-colors duration-150"
                  >
                    <Icon name={location?.icon} size={14} />
                    <span>{location?.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mark as Used */}
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAsUsed}
            iconName="Check"
            iconSize={16}
          >
            Usato
          </Button>

          {/* Delete */}
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            iconName="Trash2"
            iconSize={16}
            className="text-error hover:text-error hover:bg-error/10 border-error/20"
          >
            Elimina
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;