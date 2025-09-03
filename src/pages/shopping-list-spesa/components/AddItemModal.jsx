import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AddItemModal = ({ isOpen, onClose, onAddItem }) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pz');
  const [aisle, setAisle] = useState('Altro');
  const [isLoading, setIsLoading] = useState(false);

  const unitOptions = [
    { value: 'pz', label: 'Pezzi' },
    { value: 'kg', label: 'Chilogrammi' },
    { value: 'g', label: 'Grammi' },
    { value: 'l', label: 'Litri' },
    { value: 'ml', label: 'Millilitri' },
    { value: 'confezioni', label: 'Confezioni' }
  ];

  const aisleOptions = [
    { value: 'Frutta e Verdura', label: 'Frutta e Verdura' },
    { value: 'Latticini', label: 'Latticini' },
    { value: 'Dispensa', label: 'Dispensa' },
    { value: 'Carne e Pesce', label: 'Carne e Pesce' },
    { value: 'Surgelati', label: 'Surgelati' },
    { value: 'Bevande', label: 'Bevande' },
    { value: 'Altro', label: 'Altro' }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!itemName?.trim()) return;

    setIsLoading(true);
    
    // Simulate API call for price estimation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newItem = {
      id: Date.now()?.toString(),
      name: itemName?.trim(),
      quantity: parseFloat(quantity),
      unit,
      aisle,
      purchased: false,
      prices: {
        coop: Math.random() * 5 + 1,
        conad: Math.random() * 5 + 1,
        esselunga: Math.random() * 5 + 1,
        average: Math.random() * 5 + 1
      },
      priceConfidence: {
        coop: 'medium',
        conad: 'medium',
        esselunga: 'medium',
        average: 'high'
      },
      addedManually: true,
      dateAdded: new Date()?.toISOString()
    };

    onAddItem(newItem);
    
    // Reset form
    setItemName('');
    setQuantity('1');
    setUnit('pz');
    setAisle('Altro');
    setIsLoading(false);
    onClose();
  };

  const handleQuickAdd = (name, defaultUnit = 'pz') => {
    setItemName(name);
    setUnit(defaultUnit);
  };

  const quickItems = [
    { name: 'Latte', unit: 'l', aisle: 'Latticini' },
    { name: 'Pane', unit: 'pz', aisle: 'Dispensa' },
    { name: 'Uova', unit: 'confezioni', aisle: 'Latticini' },
    { name: 'Pomodori', unit: 'kg', aisle: 'Frutta e Verdura' },
    { name: 'Pasta', unit: 'confezioni', aisle: 'Dispensa' },
    { name: 'Olio d\'oliva', unit: 'l', aisle: 'Dispensa' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center">
      <div className="w-full max-w-md bg-card rounded-t-lg lg:rounded-lg border border-border max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            Aggiungi Articolo
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="kitchen-safe"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Quick Add Buttons */}
          <div>
            <p className="text-sm font-medium text-card-foreground mb-2">
              Aggiungi rapidamente:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickItems?.map((item) => (
                <button
                  key={item?.name}
                  onClick={() => handleQuickAdd(item?.name, item?.unit)}
                  className="p-2 text-sm bg-muted/20 hover:bg-muted/40 rounded-lg text-left transition-colors"
                >
                  {item?.name}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome articolo"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e?.target?.value)}
              placeholder="es. Pomodori San Marzano"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Quantità"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e?.target?.value)}
                min="0.1"
                step="0.1"
                required
              />

              <Select
                label="Unità"
                options={unitOptions}
                value={unit}
                onChange={setUnit}
              />
            </div>

            <Select
              label="Sezione"
              options={aisleOptions}
              value={aisle}
              onChange={setAisle}
            />

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                variant="default"
                loading={isLoading}
                className="flex-1"
              >
                Aggiungi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;