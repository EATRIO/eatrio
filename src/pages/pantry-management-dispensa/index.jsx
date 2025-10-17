import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import StorageLocationTabs from './components/StorageLocationTabs';
import SearchBar from './components/SearchBar';
import IngredientCard from './components/IngredientCard';
import BulkActionsBar from './components/BulkActionsBar';
import AddIngredientModal from './components/AddIngredientModal';
import ExpirationAlerts from './components/ExpirationAlerts';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { writePantry, PANTRY_KEY } from '../../utils/pantryStorage';

const PANTRY_STORAGE_KEYS = {
  ui: 'eatrio:pantryUI',          // { location, search }
  items: 'eatrio:pantry:v2',      // nuova chiave unica
  addModalOpen: 'eatrio:pantry:addModal',
};

const PantryManagement = () => {
  const navigate = useNavigate();

  // --- UI state (tab + ricerca), persistito ---
  const [activeLocation, setActiveLocation] = useState(() => {
    try {
      const ui = JSON.parse(localStorage.getItem(PANTRY_STORAGE_KEYS.ui) || '{}');
      return ui.location ?? 'all';
    } catch {
      return 'all';
    }
  });

  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      const ui = JSON.parse(localStorage.getItem(PANTRY_STORAGE_KEYS.ui) || '{}');
      return ui.search ?? '';
    } catch {
      return '';
    }
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);

  // --- Items: nasce vuota, con migrazione da vecchie chiavi se presenti ---
  const [pantryItems, setPantryItems] = useState(() => {
    try {
      // 1) prova chiave nuova
      const rawNew = localStorage.getItem(PANTRY_STORAGE_KEYS.items);
      if (rawNew) return JSON.parse(rawNew);

      // 2) migrazione da chiavi legacy (se esistono)
      const legacyCandidates = ['eatrio:pantryItems', 'eatrio:pantry'];
      for (const key of legacyCandidates) {
        const rawOld = localStorage.getItem(key);
        if (rawOld) {
          const parsed = JSON.parse(rawOld);
          // salva nella chiave nuova e ritorna
          localStorage.setItem(PANTRY_STORAGE_KEYS.items, JSON.stringify(parsed));
          return parsed;
        }
      }

      // 3) default: vuota
      return [];
    } catch {
      return [];
    }
  });

  // Persisti UI
  useEffect(() => {
    try {
      localStorage.setItem(
        PANTRY_STORAGE_KEYS.ui,
        JSON.stringify({ location: activeLocation, search: searchTerm })
      );
    } catch {}
  }, [activeLocation, searchTerm]);

  
  useEffect(() => {
  // garantiamo che la chiave resti quella nuova
  writePantry(pantryItems);
}, [pantryItems]);


  // --- Filtri ---
  const filteredItems = pantryItems.filter((item) => {
    const matchesLocation = activeLocation === 'all' || item?.location === activeLocation;
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !q ||
      (item?.name || '').toLowerCase().includes(q) ||
      (item?.category || '').toLowerCase().includes(q) ||
      (item?.notes || '').toLowerCase().includes(q);
    return matchesLocation && matchesSearch;
  });

  // --- Header actions (stub) ---
  const headerActions = [
    {
      icon: 'Filter',
      label: 'Filtri avanzati',
      onClick: () => {
        console.log('Opening advanced filters');
      },
    },
    {
      icon: 'MoreVertical',
      label: 'Menu opzioni',
      onClick: () => {
        console.log('Opening options menu');
      },
    },
  ];

  // --- Selezione multipla ---
  const handleItemSelect = (itemId) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedItems([itemId]);
    } else {
      setSelectedItems((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    }
  };

  const handleBulkMoveToLocation = (locationId) => {
    setPantryItems((prev) =>
      prev.map((item) =>
        selectedItems.includes(item.id) ? { ...item, location: locationId } : item
      )
    );
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleBulkMarkAsUsed = () => {
    setPantryItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleBulkDelete = () => {
    setPantryItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    setSelectionMode(false);
    setSelectedItems([]);
  };

  // --- Azioni item singolo ---
  const handleEditItem = (item) => {
    console.log('Editing item:', item);
  };

  const handleMarkItemUsed = (item) => {
    setPantryItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleDeleteItem = (item) => {
    setPantryItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  // --- Aggiunta nuovo ingrediente ---
  const handleAddIngredient = (newIngredient) => {
    setPantryItems((prev) => [newIngredient, ...prev]);
  };

  // --- FAB ---
  const handleFloatingAction = (action) => {
    if (action === 'add-ingredient') {
      setShowAddModal(true);
    }
  };

  // --- Dalle notifiche scadenza: porta al tab giusto e filtra ---
  const handleViewItemFromAlert = (item) => {
    setActiveLocation(item?.location || 'all');
    setSearchTerm(item?.name || '');
  };

  // Esci da selection mode se non ci sono selezionati
  useEffect(() => {
    if (selectedItems.length === 0 && selectionMode) {
      setSelectionMode(false);
    }
  }, [selectedItems.length, selectionMode]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderWithLogo title="Dispensa" motto="Pianifica. Cucina. Risparmia." actions={headerActions} />

      {/* Main Content */}
      <main className="pt-16 pb-20 lg:pb-6 lg:pl-64">
        {/* Search Bar */}
        <SearchBar
          value={searchTerm}
          onSearch={setSearchTerm}
          placeholder="Cerca ingredienti, categorie..."
        />

        {/* Tabs (dispensa / frigo / freezer / tutti) */}
        <StorageLocationTabs activeLocation={activeLocation} onLocationChange={setActiveLocation} />

        {/* Avvisi scadenza */}
        {showAlerts && (
          <ExpirationAlerts
            ingredients={pantryItems}
            onDismiss={() => setShowAlerts(false)}
            onViewItem={handleViewItemFromAlert}
          />
        )}

        {/* Lista / griglia */}
        <div className="px-4 py-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Package" size={32} color="var(--color-muted-foreground)" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nessun ingrediente trovato
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? `Nessun risultato per "${searchTerm}"`
                  : activeLocation === 'all'
                  ? 'La tua dispensa è vuota. Aggiungi il primo ingrediente!'
                  : `Nessun ingrediente in ${
                      activeLocation === 'pantry'
                        ? 'dispensa'
                        : activeLocation === 'fridge'
                        ? 'frigo'
                        : 'freezer'
                    }`}
              </p>
              <Button
                variant="default"
                onClick={() => setShowAddModal(true)}
                iconName="Plus"
                iconPosition="left"
              >
                Aggiungi Ingrediente
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <IngredientCard
                  key={item.id}
                  ingredient={item}
                  isSelected={selectedItems.includes(item.id)}
                  selectionMode={selectionMode}
                  onSelect={handleItemSelect}
                  onEdit={handleEditItem}
                  onMarkUsed={handleMarkItemUsed}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Barra azioni bulk */}
      {selectionMode && selectedItems.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedItems.length}
          onMoveToLocation={handleBulkMoveToLocation}
          onMarkAsUsed={handleBulkMarkAsUsed}
          onDelete={handleBulkDelete}
          onCancel={() => {
            setSelectionMode(false);
            setSelectedItems([]);
          }}
        />
      )}

      {/* Modal aggiunta */}
      <AddIngredientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddIngredient}
      />

      {/* FAB */}
      <FloatingActionButton onClick={handleFloatingAction} />

      {/* Bottom nav */}
      <BottomTabNavigation />
    </div>
  );
};

export default PantryManagement;

