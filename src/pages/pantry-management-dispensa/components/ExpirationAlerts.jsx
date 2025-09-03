import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExpirationAlerts = ({ ingredients, onDismiss, onViewItem }) => {
  const getExpiringItems = () => {
    const today = new Date();
    return ingredients?.filter(item => {
      if (!item?.expirationDate) return false;
      const expiry = new Date(item.expirationDate);
      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return diffDays <= 3; // Show items expiring in 3 days or less
    })?.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));
  };

  const expiringItems = getExpiringItems();

  if (expiringItems?.length === 0) return null;

  const getAlertType = (expirationDate) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { type: 'expired', color: 'bg-error/10 border-error/20 text-error' };
    if (diffDays === 0) return { type: 'today', color: 'bg-warning/10 border-warning/20 text-warning' };
    return { type: 'soon', color: 'bg-accent/10 border-accent/20 text-accent' };
  };

  return (
    <div className="px-4 py-3">
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={20} color="var(--color-warning)" />
            <h3 className="font-semibold text-card-foreground">
              Avvisi Scadenza
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            iconName="X"
            iconSize={16}
          />
        </div>

        <div className="space-y-2">
          {expiringItems?.slice(0, 3)?.map((item) => {
            const alertInfo = getAlertType(item?.expirationDate);
            const today = new Date();
            const expiry = new Date(item.expirationDate);
            const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            
            return (
              <div
                key={item?.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${alertInfo?.color}
                `}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item?.name}</p>
                  <p className="text-sm opacity-80">
                    {diffDays < 0 
                      ? `Scaduto ${Math.abs(diffDays)} giorni fa`
                      : diffDays === 0
                      ? 'Scade oggi'
                      : `Scade in ${diffDays} giorni`
                    }
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewItem?.(item)}
                  iconName="Eye"
                  iconSize={16}
                >
                  Vedi
                </Button>
              </div>
            );
          })}
        </div>

        {expiringItems?.length > 3 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              +{expiringItems?.length - 3} altri elementi in scadenza
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpirationAlerts;