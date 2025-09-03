import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const AdvancedFilters = ({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange,
  onResetFilters,
  className = '' 
}) => {
  const handleFilterChange = (category, value) => {
    const newFilters = { ...filters };
    if (category === 'cookingTime' || category === 'calories') {
      newFilters[category] = value;
    } else {
      if (!newFilters?.[category]) newFilters[category] = [];
      const index = newFilters?.[category]?.indexOf(value);
      if (index > -1) {
        newFilters?.[category]?.splice(index, 1);
      } else {
        newFilters?.[category]?.push(value);
      }
    }
    onFiltersChange(newFilters);
  };

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetariano' },
    { id: 'vegan', label: 'Vegano' },
    { id: 'glutenFree', label: 'Senza glutine' },
    { id: 'dairyFree', label: 'Senza lattosio' },
    { id: 'lowCarb', label: 'Basso contenuto di carboidrati' },
    { id: 'keto', label: 'Chetogenico' }
  ];

  const cookingTools = [
    { id: 'oven', label: 'Forno' },
    { id: 'stovetop', label: 'Piano cottura' },
    { id: 'microwave', label: 'Microonde' },
    { id: 'airFryer', label: 'Friggitrice ad aria' },
    { id: 'slowCooker', label: 'Pentola a cottura lenta' },
    { id: 'grill', label: 'Griglia' }
  ];

  const mealTypes = [
    { id: 'breakfast', label: 'Colazione' },
    { id: 'lunch', label: 'Pranzo' },
    { id: 'dinner', label: 'Cena' },
    { id: 'snack', label: 'Spuntino' },
    { id: 'dessert', label: 'Dolce' },
    { id: 'appetizer', label: 'Antipasto' }
  ];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-1000 bg-background lg:relative lg:w-80 lg:bg-card lg:rounded-lg lg:shadow-lg ${className}`}>
      {/* Mobile Header */}
      <div className="lg:hidden glass-morphism px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Filtri avanzati</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={24} />
        </Button>
      </div>
      {/* Desktop Header */}
      <div className="hidden lg:block p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">Filtri avanzati</h2>
      </div>
      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Cooking Time Range */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Tempo di cottura
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Min (minuti)"
              value={filters?.cookingTime?.min || ''}
              onChange={(e) => handleFilterChange('cookingTime', { 
                ...filters?.cookingTime, 
                min: parseInt(e?.target?.value) || 0 
              })}
              className="text-sm"
            />
            <Input
              type="number"
              label="Max (minuti)"
              value={filters?.cookingTime?.max || ''}
              onChange={(e) => handleFilterChange('cookingTime', { 
                ...filters?.cookingTime, 
                max: parseInt(e?.target?.value) || 999 
              })}
              className="text-sm"
            />
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Preferenze alimentari
          </h3>
          <div className="space-y-2">
            {dietaryOptions?.map((option) => (
              <Checkbox
                key={option?.id}
                label={option?.label}
                checked={filters?.dietary?.includes(option?.id) || false}
                onChange={(e) => handleFilterChange('dietary', option?.id)}
              />
            ))}
          </div>
        </div>

        {/* Cooking Tools */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Strumenti di cottura
          </h3>
          <div className="space-y-2">
            {cookingTools?.map((tool) => (
              <Checkbox
                key={tool?.id}
                label={tool?.label}
                checked={filters?.tools?.includes(tool?.id) || false}
                onChange={(e) => handleFilterChange('tools', tool?.id)}
              />
            ))}
          </div>
        </div>

        {/* Meal Type */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Tipo di pasto
          </h3>
          <div className="space-y-2">
            {mealTypes?.map((meal) => (
              <Checkbox
                key={meal?.id}
                label={meal?.label}
                checked={filters?.mealType?.includes(meal?.id) || false}
                onChange={(e) => handleFilterChange('mealType', meal?.id)}
              />
            ))}
          </div>
        </div>

        {/* Calorie Range */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Calorie per porzione
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              label="Min (kcal)"
              value={filters?.calories?.min || ''}
              onChange={(e) => handleFilterChange('calories', { 
                ...filters?.calories, 
                min: parseInt(e?.target?.value) || 0 
              })}
              className="text-sm"
            />
            <Input
              type="number"
              label="Max (kcal)"
              value={filters?.calories?.max || ''}
              onChange={(e) => handleFilterChange('calories', { 
                ...filters?.calories, 
                max: parseInt(e?.target?.value) || 9999 
              })}
              className="text-sm"
            />
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="p-4 border-t border-border flex space-x-3">
        <Button 
          variant="outline" 
          onClick={onResetFilters}
          className="flex-1"
        >
          Reimposta
        </Button>
        <Button 
          onClick={onClose}
          className="flex-1"
        >
          Applica filtri
        </Button>
      </div>
    </div>
  );
};

export default AdvancedFilters;