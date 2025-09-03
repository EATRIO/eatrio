import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddIngredientModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'g',
    location: 'pantry',
    category: '',
    expirationDate: '',
    notes: ''
  });

  const [inputMethod, setInputMethod] = useState('manual'); // manual, voice, barcode

  const units = [
    { value: 'g', label: 'Grammi (g)' },
    { value: 'kg', label: 'Chilogrammi (kg)' },
    { value: 'ml', label: 'Millilitri (ml)' },
    { value: 'l', label: 'Litri (l)' },
    { value: 'pz', label: 'Pezzi (pz)' },
    { value: 'confezioni', label: 'Confezioni' },
    { value: 'cucchiai', label: 'Cucchiai' },
    { value: 'cucchiaini', label: 'Cucchiaini' }
  ];

  const locations = [
    { value: 'pantry', label: 'Dispensa' },
    { value: 'fridge', label: 'Frigo' },
    { value: 'freezer', label: 'Freezer' }
  ];

  const categories = [
    { value: 'verdure', label: 'Verdure' },
    { value: 'frutta', label: 'Frutta' },
    { value: 'carne', label: 'Carne' },
    { value: 'pesce', label: 'Pesce' },
    { value: 'latticini', label: 'Latticini' },
    { value: 'cereali', label: 'Cereali' },
    { value: 'legumi', label: 'Legumi' },
    { value: 'condimenti', label: 'Condimenti' },
    { value: 'spezie', label: 'Spezie' },
    { value: 'dolci', label: 'Dolci' },
    { value: 'bevande', label: 'Bevande' },
    { value: 'altro', label: 'Altro' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData?.name?.trim() || !formData?.quantity) return;

    const newIngredient = {
      id: Date.now()?.toString(),
      ...formData,
      quantity: parseFloat(formData?.quantity),
      purchaseDate: new Date()?.toISOString()?.split('T')?.[0],
      addedAt: new Date()?.toISOString()
    };

    onAdd?.(newIngredient);
    handleReset();
    onClose?.();
  };

  const handleReset = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: 'g',
      location: 'pantry',
      category: '',
      expirationDate: '',
      notes: ''
    });
    setInputMethod('manual');
  };

  const handleVoiceInput = () => {
    // Mock voice input functionality
    const mockVoiceResult = "2 kg di pomodori";
    setFormData(prev => ({
      ...prev,
      name: 'Pomodori',
      quantity: '2',
      unit: 'kg'
    }));
  };

  const handleBarcodeInput = () => {
    // Mock barcode scanning functionality
    const mockBarcodeResult = {
      name: 'Pasta Barilla',
      category: 'cereali',
      unit: 'g'
    };
    setFormData(prev => ({
      ...prev,
      ...mockBarcodeResult,
      quantity: '500'
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-4 top-20 bottom-20 lg:inset-x-auto lg:left-1/2 lg:top-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-md lg:h-auto">
        <div className="bg-card rounded-lg shadow-xl h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-card-foreground">
              Aggiungi Ingrediente
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
              iconSize={20}
            />
          </div>

          {/* Input Method Selector */}
          <div className="p-4 border-b border-border">
            <div className="flex space-x-2">
              <Button
                variant={inputMethod === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMethod('manual')}
                iconName="Edit"
                iconSize={16}
              >
                Manuale
              </Button>
              <Button
                variant={inputMethod === 'voice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setInputMethod('voice');
                  handleVoiceInput();
                }}
                iconName="Mic"
                iconSize={16}
              >
                Vocale
              </Button>
              <Button
                variant={inputMethod === 'barcode' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setInputMethod('barcode');
                  handleBarcodeInput();
                }}
                iconName="Scan"
                iconSize={16}
              >
                Barcode
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-4">
              <Input
                label="Nome Ingrediente"
                type="text"
                placeholder="es. Pomodori, Pasta, Latte..."
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Quantità"
                  type="number"
                  placeholder="0"
                  value={formData?.quantity}
                  onChange={(e) => handleInputChange('quantity', e?.target?.value)}
                  required
                  min="0"
                  step="0.1"
                />

                <Select
                  label="Unità"
                  options={units}
                  value={formData?.unit}
                  onChange={(value) => handleInputChange('unit', value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Posizione"
                  options={locations}
                  value={formData?.location}
                  onChange={(value) => handleInputChange('location', value)}
                />

                <Select
                  label="Categoria"
                  options={categories}
                  value={formData?.category}
                  onChange={(value) => handleInputChange('category', value)}
                  placeholder="Seleziona categoria"
                />
              </div>

              <Input
                label="Data di Scadenza"
                type="date"
                value={formData?.expirationDate}
                onChange={(e) => handleInputChange('expirationDate', e?.target?.value)}
                description="Opzionale - per tracciare la freschezza"
              />

              <Input
                label="Note"
                type="text"
                placeholder="Note aggiuntive (opzionale)"
                value={formData?.notes}
                onChange={(e) => handleInputChange('notes', e?.target?.value)}
                description="es. marca, provenienza, ricette consigliate"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="p-4 border-t border-border flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              fullWidth
            >
              Annulla
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              fullWidth
              disabled={!formData?.name?.trim() || !formData?.quantity}
            >
              Aggiungi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddIngredientModal;