import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Input from '../../../components/ui/Input';

const DietaryPreferences = ({ preferences, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customRestrictions, setCustomRestrictions] = useState(preferences?.customRestrictions || '');

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetariano', icon: 'Leaf' },
    { id: 'vegan', label: 'Vegano', icon: 'Sprout' },
    { id: 'glutenFree', label: 'Senza glutine', icon: 'Wheat' },
    { id: 'lactoseFree', label: 'Senza lattosio', icon: 'Milk' },
    { id: 'nutFree', label: 'Senza frutta secca', icon: 'Nut' },
    { id: 'lowSodium', label: 'Basso contenuto di sodio', icon: 'Droplets' }
  ];

  const handlePreferenceChange = (id, checked) => {
    const updatedPreferences = {
      ...preferences,
      [id]: checked
    };
    onUpdate(updatedPreferences);
  };

  const handleCustomRestrictionsChange = (e) => {
    const value = e?.target?.value;
    setCustomRestrictions(value);
    onUpdate({
      ...preferences,
      customRestrictions: value
    });
  };

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Icon name="Apple" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Preferenze Alimentari</h3>
            <p className="text-sm text-muted-foreground">
              {Object.values(preferences)?.filter(Boolean)?.length} restrizioni attive
            </p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          color="var(--color-muted-foreground)" 
        />
      </button>
      {isExpanded && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dietaryOptions?.map((option) => (
              <div key={option?.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/10 transition-colors">
                <Icon name={option?.icon} size={18} color="var(--color-muted-foreground)" />
                <Checkbox
                  label={option?.label}
                  checked={preferences?.[option?.id] || false}
                  onChange={(e) => handlePreferenceChange(option?.id, e?.target?.checked)}
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <Input
              label="Altre restrizioni alimentari"
              type="text"
              placeholder="Es: Evitare peperoncino, preferire pesce azzurro..."
              value={customRestrictions}
              onChange={handleCustomRestrictionsChange}
              description="Specifica altre preferenze o allergie alimentari"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DietaryPreferences;