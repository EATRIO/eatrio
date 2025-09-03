import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExpiringIngredientsSection = ({ 
  ingredients = [], 
  onUseIngredient, 
  className = '' 
}) => {
  const getExpirationStatus = (daysLeft) => {
    if (daysLeft <= 1) return { color: 'text-error', bg: 'bg-error/10', label: 'Scade oggi' };
    if (daysLeft <= 3) return { color: 'text-warning', bg: 'bg-warning/10', label: `${daysLeft} giorni` };
    return { color: 'text-muted-foreground', bg: 'bg-muted/10', label: `${daysLeft} giorni` };
  };

  if (ingredients?.length === 0) {
    return (
      <div className={`bg-card rounded-lg p-6 text-center ${className}`}>
        <Icon name="CheckCircle" size={48} color="var(--color-success)" className="mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          Tutto sotto controllo!
        </h3>
        <p className="text-muted-foreground">
          Nessun ingrediente in scadenza nei prossimi giorni.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Ingredienti in scadenza
        </h2>
        <div className="flex items-center space-x-1">
          <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
          <span className="text-sm text-warning font-medium">
            {ingredients?.length} elementi
          </span>
        </div>
      </div>
      <div className="horizontal-scroll flex space-x-3 pb-2">
        {ingredients?.map((ingredient) => {
          const status = getExpirationStatus(ingredient?.daysLeft);
          
          return (
            <div
              key={ingredient?.id}
              className="flex-shrink-0 w-48 glass-morphism rounded-lg p-4 border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1 line-clamp-1">
                    {ingredient?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {ingredient?.quantity} {ingredient?.unit}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full ${status?.bg}`}>
                  <span className={`text-xs font-medium ${status?.color}`}>
                    {status?.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <Icon 
                    name={ingredient?.location === 'fridge' ? 'Refrigerator' : ingredient?.location === 'freezer' ? 'Snowflake' : 'Package'} 
                    size={14} 
                    color="var(--color-muted-foreground)" 
                  />
                  <span className="text-xs text-muted-foreground capitalize">
                    {ingredient?.location === 'fridge' ? 'Frigo' : ingredient?.location === 'freezer' ? 'Freezer' : 'Dispensa'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(ingredient.expirationDate)?.toLocaleDateString('it-IT')}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUseIngredient?.(ingredient)}
                className="w-full"
              >
                <Icon name="Plus" size={14} className="mr-2" />
                Usa ora
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpiringIngredientsSection;