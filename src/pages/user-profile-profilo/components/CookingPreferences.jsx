import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CookingPreferences = ({ preferences, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const skillLevels = [
    { value: 'novice', label: 'Principiante - Ricette semplici e veloci' },
    { value: 'intermediate', label: 'Intermedio - Tecniche di base' },
    { value: 'advanced', label: 'Avanzato - Tecniche complesse' },
    { value: 'expert', label: 'Esperto - Sfide culinarie' }
  ];

  const timeRanges = [
    { value: '15', label: 'Fino a 15 minuti - Pasti veloci' },
    { value: '30', label: 'Fino a 30 minuti - Pranzi/cene normali' },
    { value: '60', label: 'Fino a 1 ora - Cucina elaborata' },
    { value: 'unlimited', label: 'Senza limiti di tempo' }
  ];

  const kitchenTools = [
    { id: 'oven', label: 'Forno', icon: 'Oven' },
    { id: 'microwave', label: 'Microonde', icon: 'Microwave' },
    { id: 'airFryer', label: 'Friggitrice ad aria', icon: 'Wind' },
    { id: 'slowCooker', label: 'Pentola a cottura lenta', icon: 'Clock' },
    { id: 'blender', label: 'Frullatore', icon: 'Blend' },
    { id: 'foodProcessor', label: 'Robot da cucina', icon: 'Cog' },
    { id: 'grill', label: 'Griglia/Piastra', icon: 'Flame' },
    { id: 'steamer', label: 'Vaporiera', icon: 'Cloud' }
  ];

  const handleSkillChange = (value) => {
    onUpdate({
      ...preferences,
      skillLevel: value
    });
  };

  const handleTimeChange = (value) => {
    onUpdate({
      ...preferences,
      maxCookingTime: value
    });
  };

  const handleToolChange = (toolId, checked) => {
    const updatedTools = {
      ...preferences?.availableTools,
      [toolId]: checked
    };
    onUpdate({
      ...preferences,
      availableTools: updatedTools
    });
  };

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <Icon name="ChefHat" size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Preferenze di Cucina</h3>
            <p className="text-sm text-muted-foreground">
              Livello {preferences?.skillLevel || 'non impostato'} • Max {preferences?.maxCookingTime || '30'} min
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
        <div className="mt-6 space-y-6">
          {/* Skill Level */}
          <div>
            <Select
              label="Livello di abilità culinaria"
              description="Seleziona il tuo livello per ricette appropriate"
              options={skillLevels}
              value={preferences?.skillLevel || 'intermediate'}
              onChange={handleSkillChange}
            />
          </div>

          {/* Cooking Time */}
          <div>
            <Select
              label="Tempo di cottura preferito"
              description="Tempo massimo che vuoi dedicare alla cucina"
              options={timeRanges}
              value={preferences?.maxCookingTime || '30'}
              onChange={handleTimeChange}
            />
          </div>

          {/* Kitchen Tools */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Strumenti disponibili in cucina</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {kitchenTools?.map((tool) => (
                <div key={tool?.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/10 transition-colors">
                  <Icon name={tool?.icon} size={18} color="var(--color-muted-foreground)" />
                  <Checkbox
                    label={tool?.label}
                    checked={preferences?.availableTools?.[tool?.id] || false}
                    onChange={(e) => handleToolChange(tool?.id, e?.target?.checked)}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookingPreferences;