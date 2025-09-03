import React from 'react';
import Icon from '../../../components/AppIcon';

const NutritionInfo = ({ nutrition, servings, baseServings = 4 }) => {
  const scaleFactor = servings / baseServings;
  
  const scaleNutrition = (value) => {
    return Math.round(value * scaleFactor);
  };

  const nutritionItems = [
    {
      label: 'Calorie',
      value: scaleNutrition(nutrition?.calories),
      unit: 'kcal',
      icon: 'Zap',
      color: 'var(--color-warning)'
    },
    {
      label: 'Proteine',
      value: scaleNutrition(nutrition?.protein),
      unit: 'g',
      icon: 'Beef',
      color: 'var(--color-error)'
    },
    {
      label: 'Carboidrati',
      value: scaleNutrition(nutrition?.carbs),
      unit: 'g',
      icon: 'Wheat',
      color: 'var(--color-accent)'
    },
    {
      label: 'Grassi',
      value: scaleNutrition(nutrition?.fats),
      unit: 'g',
      icon: 'Droplet',
      color: 'var(--color-secondary)'
    }
  ];

  const macroPercentages = {
    protein: (nutrition?.protein * 4 / nutrition?.calories) * 100,
    carbs: (nutrition?.carbs * 4 / nutrition?.calories) * 100,
    fats: (nutrition?.fats * 9 / nutrition?.calories) * 100
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Informazioni Nutrizionali
      </h2>
      <div className="bg-card rounded-lg p-4 space-y-4">
        {/* Per Serving Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Per {servings === 1 ? 'porzione' : `${servings} porzioni`}
          </p>
        </div>
        
        {/* Nutrition Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {nutritionItems?.map((item) => (
            <div key={item?.label} className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                  <Icon name={item?.icon} size={20} color={item?.color} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {item?.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item?.unit}
                </p>
              </div>
              <p className="text-sm font-medium text-card-foreground">
                {item?.label}
              </p>
            </div>
          ))}
        </div>
        
        {/* Macro Distribution */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-card-foreground">
            Distribuzione Macronutrienti
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-error" />
                <span className="text-card-foreground">Proteine</span>
              </div>
              <span className="font-medium text-card-foreground">
                {Math.round(macroPercentages?.protein)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-card-foreground">Carboidrati</span>
              </div>
              <span className="font-medium text-card-foreground">
                {Math.round(macroPercentages?.carbs)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-card-foreground">Grassi</span>
              </div>
              <span className="font-medium text-card-foreground">
                {Math.round(macroPercentages?.fats)}%
              </span>
            </div>
          </div>
          
          {/* Visual Bar */}
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
            <div 
              className="bg-error h-full"
              style={{ width: `${macroPercentages?.protein}%` }}
            />
            <div 
              className="bg-accent h-full"
              style={{ width: `${macroPercentages?.carbs}%` }}
            />
            <div 
              className="bg-secondary h-full"
              style={{ width: `${macroPercentages?.fats}%` }}
            />
          </div>
        </div>
        
        {/* Additional Info */}
        {nutrition?.fiber && (
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="Leaf" size={14} color="var(--color-success)" />
                <span className="text-card-foreground">Fibre</span>
              </div>
              <span className="font-medium text-card-foreground">
                {scaleNutrition(nutrition?.fiber)}g
              </span>
            </div>
          </div>
        )}
        
        {nutrition?.sodium && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Icon name="Droplets" size={14} color="var(--color-muted-foreground)" />
              <span className="text-card-foreground">Sodio</span>
            </div>
            <span className="font-medium text-card-foreground">
              {scaleNutrition(nutrition?.sodium)}mg
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionInfo;