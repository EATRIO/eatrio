import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { Checkbox } from '../../components/ui/Checkbox';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

// Capitalizza ogni parola (Pomodori San Marzano)
const capWords = (s) =>
  (s || '')
    .toString()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');

// Helpers prezzi
const num = (v) => (typeof v === 'number' ? v : parseFloat(v) || 0);

// € italiano “€ 1,23”
const formatEuro = (v) =>
  num(v).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

// Mostra sempre €/Kg o €/L, altrimenti €/pz o €/conf ecc.
const perUnitDisplay = (unitPrice, unit) => {
  const u = (unit || '').toLowerCase();

  if (u === 'g') return { label: '€/kg', value: unitPrice * 1000 };
  if (u === 'kg') return { label: '€/kg', value: unitPrice };

  if (u === 'ml') return { label: '€/l', value: unitPrice * 1000 };
  if (u === 'l') return { label: '€/l', value: unitPrice };

  // pz, conf, mazzo, ecc.
  return { label: `€/` + (u || 'pz'), value: unitPrice };
};

const STORAGE_KEYS = {
  cart: 'eatrio:cart',
  market: 'eatrio:market',
  search: 'eatrio:cart:search',
};

const CarrelloSpesa = () => {
  const navigate = useNavigate();
  const [selectedMarket, setSelectedMarket] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.market) || 'AVG';
    } catch {
      return 'AVG';
    }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.search) || '';
    } catch {
      return '';
    }
  });

  const markets = {
    AVG: { label: 'AVG', fullName: 'Media', color: 'text-primary' },
    Coop: { label: 'Coop', fullName: 'Coop', color: 'text-blue-500' },
    Conad: { label: 'Conad', fullName: 'Conad', color: 'text-red-500' },
    Essel: { label: 'Essel', fullName: 'Esselunga', color: 'text-green-500' },
  };

  const [shoppingItems, setShoppingItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.cart);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: '1',
        name: 'Pomodori San Marzano',
        quantity: 1,
        unit: 'kg',
        checked: false,
        prices: { AVG: 3.5, Coop: 3.5, Conad: 3.2, Essel: 3.8 },
        fromRecipe: 'Pasta al Pomodoro',
        dateAdded: '2025-01-09T10:30:00Z',
      },
      {
        id: '2',
        name: 'Basilico fresco',
        quantity: 1,
        unit: 'conf',
        checked: true,
        prices: { AVG: 1.2, Coop: 1.2, Conad: 1.1, Essel: 1.3 },
        fromRecipe: 'Pasta al Pomodoro',
        dateAdded: '2025-01-09T10:30:00Z',
      },
      {
        id: '3',
        name: 'Parmigiano Reggiano DOP',
        quantity: 200,
        unit: 'g',
        checked: false,
        prices: { AVG: 0.023, Coop: 0.023, Conad: 0.022, Essel: 0.025 }, // €/g realistici
        priceWarning: 'Prezzo alto per formaggio',
        fromRecipe: 'Pasta al Pomodoro',
        dateAdded: '2025-01-09T10:30:00Z',
      },
      {
        id: '4',
        name: 'Pasta Spaghetti n.5',
        quantity: 2,
        unit: 'conf',
        checked: false,
        prices: { AVG: 1.2, Coop: 1.2, Conad: 1.15, Essel: 1.25 },
        fromRecipe: 'Pasta al Pomodoro',
        dateAdded: '2025-01-09T10:30:00Z',
      },
      {
        id: '5',
        name: "Olio Extra Vergine d'Oliva",
        quantity: 1,
        unit: 'l',
        checked: false,
        prices: { AVG: 6.5, Coop: 6.5, Conad: 6.2, Essel: 6.8 },
        dateAdded: '2025-01-09T10:30:00Z',
      },
    ];
  });

  useEffect(() => {
    if (showAddModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showAddModal]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(shoppingItems));
    } catch {}
  }, [shoppingItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.market, selectedMarket);
    } catch {}
  }, [selectedMarket]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.search, searchQuery);
    } catch {}
  }, [searchQuery]);

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '1',
    unit: 'pz',
    estimatedPrice: '',
  });

  const calculateTotals = () => {
    const totals = {};
    Object.keys(markets).forEach((market) => {
      totals[market] = shoppingItems
        .filter((item) => !item?.checked)
        .reduce((sum, item) => {
          const price = item?.prices?.[market] ?? item?.prices?.AVG ?? 0;
          const q =
            typeof item?.quantity === 'number'
              ? item.quantity
              : parseFloat(item.quantity) || 0;
          return sum + price * q;
        }, 0);
    });
    return totals;
  };

  const totalCosts = calculateTotals();
  const currentTotal = totalCosts?.[selectedMarket] || 0;
  const averageTotal = totalCosts?.AVG || 0;
  const delta = selectedMarket !== 'AVG' ? currentTotal - averageTotal : 0;

  const normalizedSearch = (searchQuery || '').toLowerCase();
  const filteredItems = shoppingItems.filter(
    (item) =>
      (item?.name || '').toLowerCase().includes(normalizedSearch) ||
      (item?.fromRecipe || '').toLowerCase().includes(normalizedSearch)
  );

  const completedItems = shoppingItems.filter((i) => i?.checked).length;
  const totalItems = shoppingItems.length;

  const validatePrice = (price) => {
    const n = parseFloat(price);
    if (Number.isNaN(n) || n < 0.0005 || n > 100) {
      return 'Prezzo fuori range — inserisci un valore realistico';
    }
    return null;
  };

  const handleItemToggle = (itemId, valueOrEvent) => {
    const nextChecked =
      typeof valueOrEvent === 'boolean'
        ? valueOrEvent
        : !!valueOrEvent?.target?.checked;

    const target = shoppingItems.find((i) => i?.id === itemId);

    setShoppingItems((prev) =>
      prev.map((it) => (it?.id === itemId ? { ...it, checked: nextChecked } : it))
    );

    if (nextChecked && target) {
      console.log('Analytics: pantry_upsert_from_cart', {
        itemId,
        itemName: target?.name,
        quantity: target?.quantity,
      });
      showToast(`${target?.name} aggiunto in dispensa`);
      mockPantryUpsert(target);
    }
  };

  const mockPantryUpsert = (item) => {
    console.log('Mock pantry upsert:', {
      ingredient_id: (item?.name || '').toLowerCase().replace(/\s+/g, '_'),
      quantity: item?.quantity,
      unit: item?.unit,
      operation: 'increase',
    });
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className =
      'fixed top-20 left-1/2 transform -translate-x-1/2 bg-success text-white px-4 py-2 rounded-lg shadow-lg z-[1100]';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      try {
        document.body.removeChild(toast);
      } catch {}
    }, 3000);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const q = Math.max(0.1, parseFloat(newQuantity) || 0.1);
    setShoppingItems((prev) =>
      prev.map((it) => (it?.id === itemId ? { ...it, quantity: q } : it))
    );
  };

  const handlePriceOverride = (itemId, newPrice) => {
    const msg = validatePrice(newPrice);
    if (msg) return alert(msg);

    setShoppingItems((prev) =>
      prev.map((it) =>
        it?.id === itemId
          ? {
              ...it,
              prices: { ...it?.prices, [selectedMarket]: parseFloat(newPrice) },
              priceOverridden: true,
            }
          : it
      )
    );
  };

  const handleDeleteItem = (itemId) => {
    setShoppingItems((prev) => prev.filter((it) => it?.id !== itemId));
  };

  const handleAddItem = () => {
    if (!newItem?.name?.trim()) return;

    const msg = newItem?.estimatedPrice
      ? validatePrice(newItem?.estimatedPrice)
      : null;
    if (msg) return alert(msg);

    const basePrice = parseFloat(newItem?.estimatedPrice) || 2.5;
    const quantity = parseFloat(newItem?.quantity) || 1;

    const item = {
      id: Date.now().toString(),
      name: newItem?.name?.trim(),
      quantity,
      unit: newItem?.unit,
      checked: false,
      prices: {
        AVG: basePrice,
        Coop: +(basePrice * 0.98).toFixed(3),
        Conad: +(basePrice * 0.95).toFixed(3),
        Essel: +(basePrice * 1.05).toFixed(3),
      },
      addedManually: true,
      dateAdded: new Date().toISOString(),
    };

    setShoppingItems((prev) => [...prev, item]);

    setNewItem({ name: '', quantity: '1', unit: 'pz', estimatedPrice: '' });
    setShowAddModal(false);
    console.log('Analytics: add_to_cart', { from_recipe: false, manual: true });
  };

  const handleAddMissingFromRecipe = () => {
    console.log('Analytics: add_to_cart', { from_recipe: true });
    alert('Funzionalità disponibile dopo integrazione ricette');
  };

  const handleClearCompleted = () => {
    setShoppingItems((prev) => prev.filter((it) => !it?.checked));
  };

  const headerActions = [
    {
      icon: 'Search',
      label: 'Cerca articoli',
      onClick: () => {
        const el = document.getElementById('search-input');
        if (el) el.focus();
      },
    },
    {
      icon: 'Plus',
      label: 'Aggiungi articolo',
      onClick: () => setShowAddModal(true),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderWithLogo title="Carrello" actions={headerActions} />

      {/* Search Bar */}
      <div className="fixed top-16 left-0 right-0 z-[90] bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="relative">
            <Icon
              name="Search"
              size={20}
              color="var(--color-muted-foreground)"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              id="search-input"
              type="text"
              placeholder="Cerca articoli o ricette..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Icon name="X" size={16} color="var(--color-muted-foreground)" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Market Selector */}
      <div className="fixed top-[120px] left-0 right-0 z-[80] bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Selettore Mercato:</span>
            <div className="flex space-x-2">
              {Object.entries(markets).map(([key, market]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMarket(key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMarket === key
                      ? `bg-primary text-primary-foreground`
                      : 'bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {market.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[200px] pb-[220px]">
        <div className="px-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-lg p-4 text-center border border-border">
              <p className="text-2xl font-bold text-card-foreground">{totalItems}</p>
              <p className="text-sm text-muted-foreground">Totale</p>
            </div>
            <div className="bg-card rounded-lg p-4 text-center border border-border">
              <p className="text-2xl font-bold text-success">{completedItems}</p>
              <p className="text-sm text-muted-foreground">Completati</p>
            </div>
            <div className="bg-card rounded-lg p-4 text-center border border-border">
              <p className="text-2xl font-bold text-warning">{totalItems - completedItems}</p>
              <p className="text-sm text-muted-foreground">Rimanenti</p>
            </div>
          </div>

          {/* Add from Recipe CTA */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">Aggiungi da Ricette</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Seleziona una ricetta per aggiungere automaticamente gli ingredienti mancanti
                </p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddMissingFromRecipe}
                iconName="BookOpen"
                iconPosition="left"
              >
                Scegli Ricetta
              </Button>
            </div>
          </div>

          {/* Empty states */}
          {filteredItems.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              <Icon
                name="ShoppingCart"
                size={64}
                color="var(--color-muted-foreground)"
                className="mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">Carrello vuoto</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Aggiungi articoli manualmente o scegli una ricetta per iniziare la spesa
              </p>
              <Button
                variant="default"
                onClick={() => setShowAddModal(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Aggiungi Articolo
              </Button>
            </div>
          )}

          {filteredItems.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Icon
                name="Search"
                size={64}
                color="var(--color-muted-foreground)"
                className="mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nessun risultato trovato</h3>
              <p className="text-muted-foreground mb-4">Nessun articolo corrisponde a "{searchQuery}"</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Cancella ricerca
              </Button>
            </div>
          )}

          {/* Items */}
          {filteredItems.length > 0 && (
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              {filteredItems.map((item) => (
                <div key={item?.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={!!item?.checked}
                      onCheckedChange={(val) => handleItemToggle(item?.id, val)}
                      onChange={(e) => handleItemToggle(item?.id, e)}
                      className="flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium text-card-foreground truncate ${
                              item?.checked ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {capWords(item?.name)}
                          </h4>

                          {item?.fromRecipe && (
                            <p className="text-xs text-primary mt-1">
                              Da ricetta: {item?.fromRecipe}
                            </p>
                          )}

                          {item?.priceWarning && (
                            <p className="text-xs text-warning mt-1 flex items-center">
                              <Icon name="AlertTriangle" size={12} className="mr-1" />
                              {item?.priceWarning}
                            </p>
                          )}

                          {item?.addedManually && (
                            <span className="inline-block text-xs px-2 py-0.5 bg-muted/30 text-muted-foreground rounded-full mt-1">
                              Aggiunto manualmente
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-3">
                          <button
                            onClick={() => handleDeleteItem(item?.id)}
                            className="p-1 hover:bg-destructive/10 rounded text-destructive"
                          >
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Quantità & Prezzo */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item?.id,
                                (parseFloat(item?.quantity) || 0) - 0.5
                              )
                            }
                            className="w-8 h-8 rounded bg-muted/20 hover:bg-muted/40 flex items-center justify-center"
                            disabled={(parseFloat(item?.quantity) || 0) <= 0.5}
                          >
                            <Icon name="Minus" size={14} />
                          </button>
                          <div className="min-w-20 text-center">
                            <span className="text-sm font-medium">{item?.quantity}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              {item?.unit}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item?.id,
                                (parseFloat(item?.quantity) || 0) + 0.5
                              )
                            }
                            className="w-8 h-8 rounded bg-muted/20 hover:bg-muted/40 flex items-center justify-center"
                          >
                            <Icon name="Plus" size={14} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          {(() => {
                            const unitPrice =
                              num(item?.prices?.[selectedMarket] ?? item?.prices?.AVG ?? 0);
                            const qty = num(item?.quantity);
                            const total = unitPrice * qty;
                            const per = perUnitDisplay(unitPrice, item?.unit);

                            return (
                              <>
                                <div className="text-sm font-semibold text-card-foreground">
                                  {formatEuro(total)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {`${formatEuro(per.value)} ${per.label}`}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {totalItems > 0 && (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClearCompleted}
                disabled={completedItems === 0}
                className="flex-1"
              >
                Cancella Completati
              </Button>
              <Button
                variant="default"
                onClick={() => alert('Condivisione lista')}
                className="flex-1"
                iconName="Share"
                iconPosition="left"
              >
                Condividi Lista
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Totale */}
      {totalItems > 0 && (
        <div className="fixed bottom-24 left-0 right-0 bg-card border-t border-border p-4 z-[95]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Totale ({selectedMarket}):</div>
              <div className="text-xl font-bold text-card-foreground">
                {formatEuro(currentTotal)}
                {delta !== 0 && (
                  <span
                    className={`text-sm ml-2 ${
                      delta > 0 ? 'text-destructive' : 'text-success'
                    }`}
                  >
                    (ΔAVG {formatEuro(delta)})
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="default"
              size="lg"
              onClick={() => alert('Checkout simulato')}
              disabled={totalItems - completedItems === 0}
            >
              Procedi ({totalItems - completedItems} articoli)
            </Button>
          </div>
        </div>
      )}

      {/* Modal Aggiungi */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[1000] bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-md bg-card rounded-t-lg lg:rounded-lg border border-border max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-card-foreground">Aggiungi Articolo</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <Input
                label="Nome articolo"
                type="text"
                value={newItem?.name}
                onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="es. Pomodori San Marzano"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Quantità"
                  type="number"
                  value={newItem?.quantity}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: e.target.value }))}
                  min="0.1"
                  step="0.1"
                  required
                />

                <Select
                  label="Unità"
                  options={[
                    { value: 'pz', label: 'Pezzi' },
                    { value: 'kg', label: 'Kg' },
                    { value: 'g', label: 'Grammi' },
                    { value: 'l', label: 'Litri' },
                    { value: 'ml', label: 'ml' },
                    { value: 'conf', label: 'Confezioni' },
                  ]}
                  value={newItem?.unit}
                  onChange={(value) => setNewItem((prev) => ({ ...prev, unit: value }))}
                />
              </div>

              <Input
                label="Prezzo stimato (opzionale)"
                type="number"
                value={newItem?.estimatedPrice}
                onChange={(e) => setNewItem((prev) => ({ ...prev, estimatedPrice: e.target.value }))}
                placeholder="es. 2.50"
                min="0.001"
                max="100"
                step="0.001"
              />
            </div>

            <div className="p-4 border-t border-border bg-card sticky bottom-0">
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Annulla
                </Button>
                <Button
                  variant="default"
                  onClick={handleAddItem}
                  className="flex-1"
                  disabled={!newItem?.name?.trim()}
                >
                  Aggiungi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomTabNavigation />
      <FloatingActionButton onClick={() => setShowAddModal(true)} />
    </div>
  );
};

export default CarrelloSpesa;
