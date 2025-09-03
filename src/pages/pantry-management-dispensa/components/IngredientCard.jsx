import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const IngredientCard = ({ 
  ingredient, 
  onEdit, 
  onMarkUsed, 
  onDelete, 
  isSelected = false, 
  onSelect,
  selectionMode = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getExpirationStatus = (expirationDate) => {
    if (!expirationDate) return { status: 'none', color: 'text-muted-foreground' };
    
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', color: 'text-error', days: Math.abs(diffDays) };
    if (diffDays <= 3) return { status: 'expiring', color: 'text-warning', days: diffDays };
    if (diffDays <= 7) return { status: 'soon', color: 'text-accent', days: diffDays };
    return { status: 'fresh', color: 'text-success', days: diffDays };
  };

  const getStorageIcon = (location) => {
    switch (location) {
      case 'fridge': return 'Refrigerator';
      case 'freezer': return 'Snowflake';
      case 'pantry': return 'Home';
      default: return 'Package';
    }
  };

  const getStorageLabel = (location) => {
    switch (location) {
      case 'fridge': return 'Frigo';
      case 'freezer': return 'Freezer';
      case 'pantry': return 'Dispensa';
      default: return 'Altro';
    }
  };

  const expirationInfo = getExpirationStatus(ingredient?.expirationDate);

  const handleCardPress = () => {
    if (selectionMode) {
      onSelect?.(ingredient?.id);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleLongPress = () => {
    if (!selectionMode) {
      onSelect?.(ingredient?.id);
    }
  };

  return (
    <div 
      className={`
        bg-card rounded-lg border transition-all duration-150 active:scale-98
        ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-border/60'}
        ${selectionMode ? 'cursor-pointer' : ''}
      `}
      onClick={handleCardPress}
      onContextMenu={(e) => {
        e?.preventDefault();
        handleLongPress();
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {selectionMode && (
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}
                `}>
                  {isSelected && (
                    <Icon name="Check" size={12} color="var(--color-primary-foreground)" />
                  )}
                </div>
              )}
              <h3 className="text-lg font-semibold text-card-foreground truncate">
                {ingredient?.name}
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-sm text-muted-foreground">
              <span className="font-medium">
                {ingredient?.quantity} {ingredient?.unit}
              </span>
              <div className="flex items-center space-x-1">
                <Icon name={getStorageIcon(ingredient?.location)} size={14} />
                <span>{getStorageLabel(ingredient?.location)}</span>
              </div>
            </div>
          </div>

          {/* Expiration Badge */}
          {ingredient?.expirationDate && (
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${expirationInfo?.status === 'expired' ? 'bg-error/20 text-error' : ''}
              ${expirationInfo?.status === 'expiring' ? 'bg-warning/20 text-warning' : ''}
              ${expirationInfo?.status === 'soon' ? 'bg-accent/20 text-accent' : ''}
              ${expirationInfo?.status === 'fresh' ? 'bg-success/20 text-success' : ''}
            `}>
              {expirationInfo?.status === 'expired' 
                ? `Scaduto ${expirationInfo?.days}g fa`
                : expirationInfo?.status === 'expiring'
                ? `Scade in ${expirationInfo?.days}g`
                : expirationInfo?.status === 'soon'
                ? `${expirationInfo?.days} giorni`
                : `${expirationInfo?.days} giorni`
              }
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && !selectionMode && (
          <div className="space-y-3 pt-3 border-t border-border">
            {ingredient?.category && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Tag" size={14} />
                <span>Categoria: {ingredient?.category}</span>
              </div>
            )}
            
            {ingredient?.notes && (
              <div className="text-sm text-card-foreground">
                <p className="font-medium mb-1">Note:</p>
                <p className="text-muted-foreground">{ingredient?.notes}</p>
              </div>
            )}

            {ingredient?.purchaseDate && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Calendar" size={14} />
                <span>Acquistato: {new Date(ingredient.purchaseDate)?.toLocaleDateString('it-IT')}</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {!selectionMode && (
          <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e?.stopPropagation();
                onEdit?.(ingredient);
              }}
              iconName="Edit2"
              iconSize={16}
            >
              Modifica
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e?.stopPropagation();
                onMarkUsed?.(ingredient);
              }}
              iconName="Check"
              iconSize={16}
            >
              Usato
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e?.stopPropagation();
                onDelete?.(ingredient);
              }}
              iconName="Trash2"
              iconSize={16}
              className="text-error hover:text-error hover:bg-error/10"
            >
              Elimina
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientCard;