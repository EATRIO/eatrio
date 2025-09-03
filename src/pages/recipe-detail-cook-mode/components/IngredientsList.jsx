import React from 'react';
import Icon from '../../../components/AppIcon';

import { Checkbox } from '../../../components/ui/Checkbox';
import { useState } from 'react';

const IngredientsList = ({ 
  ingredients, 
  servings, 
  baseServings, 
  checkedIngredients, 
  onIngredientCheck, 
  onAddToShoppingList, 
  onSubstitute 
}) => {
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [sessionSubstitutions, setSessionSubstitutions] = useState({});

  // Mock pantry data for availability checking
  const mockPantryItems = {
    'riso_carnaroli': { quantity: 500, unit: 'g' },
    'brodo_vegetale': { quantity: 2, unit: 'l' },
    'cipolla': { quantity: 3, unit: 'pz' },
    'parmigiano_reggiano': { quantity: 150, unit: 'g' },
    'burro': { quantity: 100, unit: 'g' },
    'olio_extravergine': { quantity: 0.8, unit: 'l' }
  };

  // Mock substitutions data
  const mockSubstitutions = {
    'funghi_porcini': [
      { name: 'Champignon', ratio: 1.3, unit: 'g', note: 'Sapore più delicato' },
      { name: 'Funghi Shiitake', ratio: 0.8, unit: 'g', note: 'Sapore più intenso' },
      { name: 'Funghi misti', ratio: 1.2, unit: 'g', note: 'Mix di varietà' }
    ],
    'vino_bianco': [
      { name: 'Brodo vegetale', ratio: 1, unit: 'ml', note: 'Alternativa analcolica' },
      { name: 'Succo di limone', ratio: 0.3, unit: 'ml', note: 'Aggiungere acqua' }
    ],
    'parmigiano_reggiano': [
      { name: 'Grana Padano', ratio: 1, unit: 'g', note: 'Sapore simile' },
      { name: 'Pecorino Romano', ratio: 0.8, unit: 'g', note: 'Più salato' }
    ]
  };

  // Normalize units for comparison
  const normalizeQuantity = (amount, unit) => {
    const conversions = {
      'kg': { g: 1000 },
      'l': { ml: 1000 },
      'g': { kg: 0.001 },
      'ml': { l: 0.001 }
    };

    return { amount, unit, normalized: amount };
  };

  // Check ingredient availability with exact matching
  const checkIngredientAvailability = (ingredient) => {
    const ingredientId = ingredient?.name?.toLowerCase()?.replace(/\s+/g, '_');
    const pantryItem = mockPantryItems?.[ingredientId];
    
    if (!pantryItem) return false;

    const required = (ingredient?.amount * servings) / baseServings;
    const normalized = normalizeQuantity(required, ingredient?.unit);
    const available = normalizeQuantity(pantryItem?.quantity, pantryItem?.unit);

    // Simple unit matching - in real app would handle complex conversions
    if (normalized?.unit === available?.unit) {
      return available?.amount >= normalized?.amount;
    }

    return false;
  };

  // Get current ingredient (with substitution if applied)
  const getCurrentIngredient = (ingredient) => {
    const substitution = sessionSubstitutions?.[ingredient?.id];
    if (substitution) {
      return {
        ...ingredient,
        name: substitution?.name,
        amount: (ingredient?.amount * substitution?.ratio) || ingredient?.amount,
        isSubstituted: true,
        originalName: ingredient?.name
      };
    }
    return ingredient;
  };

  // Handle substitution selection
  const handleSubstitutionSelect = (ingredient, substitution) => {
    setSessionSubstitutions(prev => ({
      ...prev,
      [ingredient?.id]: substitution
    }));

    setShowSubstitutions(false);
    setSelectedIngredient(null);

    // Analytics event
    console.log('Analytics: substitution_applied', {
      original: ingredient?.name,
      substitute: substitution?.name,
      recipe_id: 'current_recipe'
    });

    // Show toast
    showToast('Sostituzione applicata');
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-success text-white px-4 py-2 rounded-lg shadow-lg z-1000';
    toast.textContent = message;
    document.body?.appendChild(toast);
    setTimeout(() => document.body?.removeChild(toast), 3000);
  };

  // Handle ingredient checkbox (for cook session)
  const handleIngredientCheck = (ingredientId, checked) => {
    onIngredientCheck(ingredientId, checked);
    
    // Show tooltip for usage tracking
    if (checked) {
      showToast('Segna come usato - sarà sottratto dalla dispensa al completamento');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Ingredienti
        </h2>
        <span className="text-sm text-muted-foreground">
          Per {servings} {servings === 1 ? 'porzione' : 'porzioni'}
        </span>
      </div>

      <div className="space-y-3">
        {ingredients?.map((ingredient) => {
          const currentIngredient = getCurrentIngredient(ingredient);
          const scaledAmount = (currentIngredient?.amount * servings) / baseServings;
          const isAvailable = checkIngredientAvailability(currentIngredient);
          const isChecked = checkedIngredients?.includes(ingredient?.id);
          const hasSubstitutions = mockSubstitutions?.[ingredient?.name?.toLowerCase()?.replace(/\s+/g, '_')];

          return (
            <div
              key={ingredient?.id}
              className={`p-4 rounded-lg border transition-all ${
                isChecked ? 'bg-muted/10 border-muted' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Checkbox for cook session usage tracking */}
                  <div className="relative group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleIngredientCheck(ingredient?.id, e?.target?.checked)}
                      className="w-5 h-5 rounded border-2 border-muted-foreground/30 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Segna come usato
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${isChecked ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>
                        {currentIngredient?.name}
                        {currentIngredient?.isSubstituted && (
                          <span className="text-xs text-warning ml-1">
                            (sostituito)
                          </span>
                        )}
                      </h4>
                      
                      {/* Availability pill */}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isAvailable 
                          ? 'bg-success/20 text-success' :'bg-destructive/20 text-destructive'
                      }`}>
                        {isAvailable ? 'Disponibile' : 'MANCANTE'}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1">
                      {scaledAmount?.toFixed(scaledAmount % 1 === 0 ? 0 : 1)} {currentIngredient?.unit}
                    </p>

                    {currentIngredient?.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentIngredient?.notes}
                      </p>
                    )}

                    {currentIngredient?.isSubstituted && (
                      <p className="text-xs text-warning mt-1">
                        Originale: {currentIngredient?.originalName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-3">
                  {/* Substitutions button */}
                  {hasSubstitutions && (
                    <button
                      onClick={() => {
                        setSelectedIngredient(ingredient);
                        setShowSubstitutions(true);
                      }}
                      className="px-3 py-1 text-xs bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors"
                    >
                      Sostituzioni
                    </button>
                  )}

                  {/* Add to shopping list button */}
                  {!isAvailable && (
                    <button
                      onClick={() => onAddToShoppingList(currentIngredient)}
                      className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      Aggiungi
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Substitutions Bottom Sheet */}
      {showSubstitutions && selectedIngredient && (
        <div className="fixed inset-0 z-1000 bg-background/80 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-md bg-card rounded-t-lg border border-border max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">
                Sostituzioni per {selectedIngredient?.name}
              </h3>
              <button
                onClick={() => {
                  setShowSubstitutions(false);
                  setSelectedIngredient(null);
                }}
                className="p-1 hover:bg-muted/20 rounded"
              >
                <Icon name="X" size={20} color="var(--color-muted-foreground)" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              {mockSubstitutions?.[selectedIngredient?.name?.toLowerCase()?.replace(/\s+/g, '_')]?.map((substitution, index) => (
                <button
                  key={index}
                  onClick={() => handleSubstitutionSelect(selectedIngredient, substitution)}
                  className="w-full p-3 text-left bg-muted/10 hover:bg-muted/20 rounded-lg border border-muted/20 transition-colors"
                >
                  <div className="font-medium text-card-foreground">
                    {substitution?.name}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Rapporto: 1:{substitution?.ratio} • {substitution?.note}
                  </div>
                  <div className="text-xs text-primary mt-1">
                    Quantità: {((selectedIngredient?.amount * substitution?.ratio * servings) / baseServings)?.toFixed(1)} {substitution?.unit}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-muted/20 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-success">
              {ingredients?.filter(ing => checkIngredientAvailability(getCurrentIngredient(ing)))?.length}
            </p>
            <p className="text-sm text-muted-foreground">Disponibili</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">
              {ingredients?.filter(ing => !checkIngredientAvailability(getCurrentIngredient(ing)))?.length}
            </p>
            <p className="text-sm text-muted-foreground">Mancanti</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientsList;