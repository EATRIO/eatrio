import React from 'react';
import Icon from '../../../components/AppIcon';

const CostEstimation = ({ costData, servings, baseServings = 4 }) => {
  const scaleFactor = servings / baseServings;
  
  const scaleCost = (cost) => {
    return (cost * scaleFactor)?.toFixed(2);
  };

  const supermarkets = [
    {
      name: 'Coop',
      cost: costData?.coop,
      logo: '🛒',
      color: 'var(--color-primary)'
    },
    {
      name: 'Conad',
      cost: costData?.conad,
      logo: '🏪',
      color: 'var(--color-accent)'
    },
    {
      name: 'Esselunga',
      cost: costData?.esselunga,
      logo: '🛍️',
      color: 'var(--color-warning)'
    },
    {
      name: 'Media',
      cost: costData?.average,
      logo: '📊',
      color: 'var(--color-secondary)'
    }
  ];

  const cheapestMarket = supermarkets?.reduce((prev, current) => 
    prev?.cost < current?.cost ? prev : current
  );

  const mostExpensiveMarket = supermarkets?.reduce((prev, current) => 
    prev?.cost > current?.cost ? prev : current
  );

  const savings = (mostExpensiveMarket?.cost - cheapestMarket?.cost) * scaleFactor;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Stima Costi
      </h2>
      <div className="bg-card rounded-lg p-4 space-y-4">
        {/* Cost Per Serving */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Costo per {servings === 1 ? 'porzione' : `${servings} porzioni`}
          </p>
        </div>
        
        {/* Supermarket Comparison */}
        <div className="space-y-3">
          {supermarkets?.map((market) => {
            const isLowest = market?.name === cheapestMarket?.name;
            const isHighest = market?.name === mostExpensiveMarket?.name;
            
            return (
              <div
                key={market?.name}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isLowest 
                    ? 'border-success/30 bg-success/10' 
                    : isHighest 
                    ? 'border-error/30 bg-error/10' :'border-border bg-muted/20'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{market?.logo}</span>
                  <div>
                    <p className="font-medium text-card-foreground">
                      {market?.name}
                    </p>
                    {isLowest && (
                      <p className="text-xs text-success font-medium">
                        Più conveniente
                      </p>
                    )}
                    {isHighest && (
                      <p className="text-xs text-error font-medium">
                        Più costoso
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-card-foreground">
                    €{scaleCost(market?.cost)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    €{(market?.cost / baseServings)?.toFixed(2)} per porzione
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Savings Info */}
        {savings > 0 && (
          <div className="bg-success/10 rounded-lg p-4 border border-success/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                <Icon name="PiggyBank" size={20} color="var(--color-success)" />
              </div>
              <div>
                <p className="font-medium text-success">
                  Risparmio Possibile
                </p>
                <p className="text-sm text-card-foreground">
                  Scegliendo {cheapestMarket?.name} invece di {mostExpensiveMarket?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-success">
                  €{savings?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Cost Breakdown */}
        <div className="border-t border-border pt-4">
          <h3 className="text-sm font-medium text-card-foreground mb-3">
            Ripartizione Costi (Media)
          </h3>
          
          <div className="space-y-2">
            {costData?.breakdown?.map((item) => (
              <div key={item?.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Icon name={item?.icon} size={14} color="var(--color-muted-foreground)" />
                  <span className="text-card-foreground">{item?.category}</span>
                </div>
                <span className="font-medium text-card-foreground">
                  €{scaleCost(item?.cost)}
                </span>
              </div>
            )) || (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Icon name="Beef" size={14} color="var(--color-muted-foreground)" />
                    <span className="text-card-foreground">Proteine</span>
                  </div>
                  <span className="font-medium text-card-foreground">
                    €{scaleCost(costData?.average * 0.4)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Icon name="Carrot" size={14} color="var(--color-muted-foreground)" />
                    <span className="text-card-foreground">Verdure</span>
                  </div>
                  <span className="font-medium text-card-foreground">
                    €{scaleCost(costData?.average * 0.3)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Icon name="Wheat" size={14} color="var(--color-muted-foreground)" />
                    <span className="text-card-foreground">Carboidrati</span>
                  </div>
                  <span className="font-medium text-card-foreground">
                    €{scaleCost(costData?.average * 0.2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Icon name="Package" size={14} color="var(--color-muted-foreground)" />
                    <span className="text-card-foreground">Altri</span>
                  </div>
                  <span className="font-medium text-card-foreground">
                    €{scaleCost(costData?.average * 0.1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostEstimation;