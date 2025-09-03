import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const QuickPantryAddition = ({ 
  onAddIngredients, 
  onVoiceInput, 
  onBarcodeScanner,
  className = '' 
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!inputText?.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI parsing of free text input
    const parsedIngredients = parseIngredientsFromText(inputText);
    
    try {
      await onAddIngredients?.(parsedIngredients);
      setInputText('');
    } catch (error) {
      console.error('Error adding ingredients:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseIngredientsFromText = (text) => {
    // Mock AI parsing - in real app this would call an AI service
    const commonIngredients = [
      { pattern: /pomodori?/i, name: 'Pomodori', unit: 'kg', defaultQuantity: 0.5 },
      { pattern: /pasta/i, name: 'Pasta', unit: 'g', defaultQuantity: 500 },
      { pattern: /latte/i, name: 'Latte', unit: 'l', defaultQuantity: 1 },
      { pattern: /pane/i, name: 'Pane', unit: 'pz', defaultQuantity: 1 },
      { pattern: /uova?/i, name: 'Uova', unit: 'pz', defaultQuantity: 6 },
      { pattern: /formaggio/i, name: 'Formaggio', unit: 'g', defaultQuantity: 200 },
      { pattern: /olio/i, name: 'Olio d\'oliva', unit: 'ml', defaultQuantity: 500 },
      { pattern: /aglio/i, name: 'Aglio', unit: 'spicchi', defaultQuantity: 3 },
      { pattern: /cipolla/i, name: 'Cipolla', unit: 'pz', defaultQuantity: 1 },
      { pattern: /basilico/i, name: 'Basilico', unit: 'g', defaultQuantity: 20 }
    ];

    const found = [];
    commonIngredients?.forEach(ingredient => {
      if (ingredient?.pattern?.test(text)) {
        found?.push({
          id: Date.now() + Math.random(),
          name: ingredient?.name,
          quantity: ingredient?.defaultQuantity,
          unit: ingredient?.unit,
          location: 'pantry',
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0]
        });
      }
    });

    return found?.length > 0 ? found : [
      {
        id: Date.now(),
        name: text?.trim(),
        quantity: 1,
        unit: 'pz',
        location: 'pantry',
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0]
      }
    ];
  };

  const handleVoiceInput = () => {
    onVoiceInput?.();
  };

  const handleBarcodeScanner = () => {
    onBarcodeScanner?.();
  };

  return (
    <div className={`bg-card rounded-lg p-4 space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="Plus" size={20} color="var(--color-primary)" />
        <h2 className="text-lg font-semibold text-card-foreground">
          Aggiungi alla dispensa
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="Es: 2 pomodori, pasta, latte fresco..."
            value={inputText}
            onChange={(e) => setInputText(e?.target?.value)}
            className="pr-12"
            disabled={isProcessing}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            disabled={!inputText?.trim() || isProcessing}
          >
            {isProcessing ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <Icon name="Send" size={16} />
            )}
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleVoiceInput}
            className="flex-1"
          >
            <Icon name="Mic" size={16} className="mr-2" />
            Voce
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleBarcodeScanner}
            className="flex-1"
          >
            <Icon name="Scan" size={16} className="mr-2" />
            Barcode
          </Button>
        </div>
      </form>
      <div className="bg-muted/20 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Icon name="Lightbulb" size={16} color="var(--color-warning)" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Suggerimento
            </p>
            <p className="text-xs text-muted-foreground">
              Scrivi gli ingredienti in linguaggio naturale. L'AI riconoscerà automaticamente quantità e tipologie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPantryAddition;