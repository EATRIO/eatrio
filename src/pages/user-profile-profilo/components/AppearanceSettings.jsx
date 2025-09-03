import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const AppearanceSettings = ({ settings, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const themeOptions = [
    { value: 'dark', label: 'Tema scuro', description: 'Ideale per cucinare di sera' },
    { value: 'light', label: 'Tema chiaro', description: 'Perfetto per cucinare di giorno' },
    { value: 'auto', label: 'Automatico', description: 'Segue le impostazioni del sistema' }
  ];

  const languageOptions = [
    { value: 'it', label: 'Italiano' },
    { value: 'en', label: 'English' }
  ];

  const handleThemeChange = (value) => {
    onUpdate({
      ...settings,
      theme: value
    });
  };

  const handleLanguageChange = (value) => {
    onUpdate({
      ...settings,
      language: value
    });
  };

  const handleAnimationChange = (checked) => {
    onUpdate({
      ...settings,
      enableAnimations: checked
    });
  };

  const handleHapticsChange = (checked) => {
    onUpdate({
      ...settings,
      enableHaptics: checked
    });
  };

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
            <Icon name="Palette" size={20} color="var(--color-secondary)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Aspetto</h3>
            <p className="text-sm text-muted-foreground">
              Tema {settings?.theme || 'dark'} • {settings?.language || 'it'}
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
          {/* Theme Selection */}
          <div>
            <Select
              label="Tema dell'app"
              description="Scegli l'aspetto che preferisci"
              options={themeOptions}
              value={settings?.theme || 'dark'}
              onChange={handleThemeChange}
            />
          </div>

          {/* Language Selection */}
          <div>
            <Select
              label="Lingua"
              description="Seleziona la lingua dell'interfaccia"
              options={languageOptions}
              value={settings?.language || 'it'}
              onChange={handleLanguageChange}
            />
          </div>

          {/* Animation Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/10 transition-colors">
              <Icon name="Zap" size={18} color="var(--color-muted-foreground)" />
              <Checkbox
                label="Abilita animazioni"
                description="Animazioni fluide per una migliore esperienza"
                checked={settings?.enableAnimations !== false}
                onChange={(e) => handleAnimationChange(e?.target?.checked)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/10 transition-colors">
              <Icon name="Smartphone" size={18} color="var(--color-muted-foreground)" />
              <Checkbox
                label="Feedback tattile"
                description="Vibrazioni per confermare le azioni"
                checked={settings?.enableHaptics !== false}
                onChange={(e) => handleHapticsChange(e?.target?.checked)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppearanceSettings;