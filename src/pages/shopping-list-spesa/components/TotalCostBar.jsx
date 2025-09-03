import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TotalCostBar = ({ 
  totalCost, 
  selectedMarket, 
  totalCosts, 
  itemCount, 
  completedCount,
  onExport,
  onClearCompleted 
}) => {
  const completionPercentage = itemCount > 0 ? (completedCount / itemCount) * 100 : 0;
  
  // Find best price market
  const bestMarket = Object.entries(totalCosts)?.reduce((best, [market, cost]) => {
    return cost < best?.cost ? { market, cost } : best;
  }, { market: selectedMarket, cost: totalCosts?.[selectedMarket] || 0 });

  const savings = totalCosts?.[selectedMarket] - bestMarket?.cost;
  const showSavings = savings > 0.5 && bestMarket?.market !== selectedMarket;

  const marketNames = {
    coop: 'Coop',
    conad: 'Conad',
    esselunga: 'Esselunga',
    average: 'Media'
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 z-90 px-4">
      <div className="glass-morphism rounded-lg border border-border p-4 max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-3">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Left Side - Progress Info */}
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-2xl font-bold text-foreground">
                €{totalCost?.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {completedCount}/{itemCount} articoli
              </p>
            </div>

            {/* Savings Indicator */}
            {showSavings && (
              <div className="bg-success/10 border border-success/20 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-1">
                  <Icon name="TrendingDown" size={14} color="var(--color-success)" />
                  <span className="text-sm font-medium text-success">
                    Risparmia €{savings?.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-success/80">
                  con {marketNames?.[bestMarket?.market]}
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-2">
            {completedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearCompleted}
                iconName="Trash2"
                iconPosition="left"
              >
                Pulisci
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              iconName="Share"
              iconPosition="left"
            >
              Esporta
            </Button>

            {itemCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  // Navigate to checkout or completion flow
                  console.log('Completing shopping...');
                }}
                iconName="ShoppingCart"
                iconPosition="left"
              >
                Completa
              </Button>
            )}
          </div>
        </div>

        {/* Market Comparison Quick View */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center space-x-4 text-sm">
            {Object.entries(totalCosts)?.map(([market, cost]) => (
              <div key={market} className="flex items-center space-x-1">
                <span className="text-muted-foreground">{marketNames?.[market]}:</span>
                <span className={`font-medium ${market === bestMarket?.market ? 'text-success' : 'text-foreground'}`}>
                  €{cost?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted-foreground">
            Aggiornato: {new Date()?.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalCostBar;