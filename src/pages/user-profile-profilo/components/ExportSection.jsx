import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExportSection = ({ onExport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions = [
    {
      id: 'shopping-history',
      title: 'Cronologia Spesa',
      description: 'Esporta la cronologia completa degli acquisti',
      icon: 'ShoppingCart',
      format: 'CSV'
    },
    {
      id: 'recipe-collection',
      title: 'Collezione Ricette',
      description: 'Tutte le tue ricette preferite e personalizzate',
      icon: 'BookOpen',
      format: 'PDF'
    },
    {
      id: 'savings-report',
      title: 'Report Risparmi',
      description: 'Analisi dettagliata dei risparmi mensili',
      icon: 'PiggyBank',
      format: 'PDF'
    },
    {
      id: 'pantry-inventory',
      title: 'Inventario Dispensa',
      description: 'Lista completa degli ingredienti disponibili',
      icon: 'Package',
      format: 'CSV'
    }
  ];

  const handleExport = async (optionId) => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onExport?.(optionId);
      
      // Show success message (in a real app, this would be a toast notification)
      console.log(`Export ${optionId} completato con successo`);
    } catch (error) {
      console.error('Errore durante l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="glass-morphism rounded-2xl p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Icon name="Download" size={20} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Esporta Dati</h3>
            <p className="text-sm text-muted-foreground">
              Scarica i tuoi dati personali
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
          {exportOptions?.map((option) => (
            <div key={option?.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/10 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted/20 rounded-lg flex items-center justify-center">
                  <Icon name={option?.icon} size={16} color="var(--color-muted-foreground)" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{option?.title}</h4>
                  <p className="text-xs text-muted-foreground">{option?.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                  {option?.format}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(option?.id)}
                  disabled={isExporting}
                  loading={isExporting}
                  iconName="Download"
                  iconPosition="left"
                >
                  Esporta
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border">
            <div className="flex items-start space-x-2 text-xs text-muted-foreground">
              <Icon name="Info" size={14} className="mt-0.5" />
              <p>
                I dati esportati includono solo le informazioni personali e non contengono dati sensibili. 
                I file verranno scaricati automaticamente al completamento dell'elaborazione.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportSection;