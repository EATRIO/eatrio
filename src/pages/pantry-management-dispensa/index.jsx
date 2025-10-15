import React, { useEffect, useState, useMemo } from 'react';
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

// ------------------------------
// Util: identifica l'utente corrente
// Integra qui con il tuo sistema di auth (es. Supabase/Firebase/sessione)
const getCurrentUserId = (): string => {
  // Esempi:
  // return auth.currentUser?.uid || 'guest';
  // return session?.user?.id || 'guest';
  return 'guest';
};

const buildPantryKeys = (userId: string) => ({
  ui: `eatrio:${userId}:pantryUI`,
  items: `eatrio:${userId}:pantryItems:v1`,
  addModalOpen: `eatrio:${userId}:pantry:addModal`,
});
// ------------------------------

const PantryManagement: React.FC = () => {
  // Id utente + chiavi namespaced
  const userId = getCurrentUserId();
  const PANTRY_KEYS = useMemo(() => buildPantryKeys(userId), [userId]);

  // Stato UI (tab attivo + ricerca), persistenza per-utente
  const [activeLocation, setActiveLocation] = useState<'all' | 'pantry' | 'fridge' | 'freezer'>(() => {
    try {
      const ui = JSON.parse(localStorage.getItem(PANTRY_KEYS.ui) || '{}');
      return ui.location ?? 'all';
    } catch {
      return 'all';
    }
  });

  const [searchTerm, setSearchTerm] = useState<string>(() => {
    try {
      const ui = JSON.parse(localStorage.getItem(PANTRY_KEYS.ui) || '{}');
      return ui.search ?? '';
    } catch {
      return '';
    }
  });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);

  // Dispensa per-utente: nasce vuota se non c'è nulla in localStorage
  type PantryItem = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    location: 'pantry' | 'fridge' | 'freezer';
    category?: string;
    expirationDate?: string; // ISO yyyy-mm-dd
    purchaseDate?: string;   // ISO yyyy-mm-dd
    notes?: string;
    addedAt?: string;        // ISO timestamp
    [key: string]: any;
  };

  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    try {
      const raw = localStorage.getItem(PANTRY_KEYS.items);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persistenza UI per-utente
  useEffect(() => {
    try {
      localStorage.setItem(
        PANTRY_KEYS.ui,
        JSON.stringify({ location: activeLocation, search: searchTerm })
      );
    } catch {}
  }, [activeLocation, searchTerm, PANTRY_KEYS.ui]);

  // Persistenza items per-utente
  useEffect(() => {
    try {
      localStorage.setItem(PANTRY_KEYS.items, JSON.stringify(pantryItems));
    } catch {}
  }, [pantryItems, PANTRY_KEYS.items]);

  // Sync multi-tab (se apri due tab dello stesso utente)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PANTRY_KEYS.items && e.newValue) {
        try {
          setPantryItems(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === PANTRY_KEYS.ui && e.newValue) {
        try {
          const ui = JSON.parse(e.newValue);
          if (ui.location) setActiveLocation(ui.location);
          if (typeof ui.search === 'string') setSearchTerm(ui.search);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [PANTRY_KEYS.items, PANTRY_KEYS.ui]);

  // Filtro per tab + ricerca
  const filteredItems = pantryItems?.filter((item) => {
    const matchesLocation = activeLocation === 'all' || item?.location === activeLocation;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      !term ||
      item?.name?.toLowerCase()?.includes(term) ||
      item?.category?.toLowerCase()?.includes(term) ||
      item?.notes?.toLowerCase()?.includes(term);
    return matchesLocation && matchesSearch;
  });

  // Azioni header (placeholder)
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

  // Selezione card
  const handleItemSelect = (itemId: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedItems([itemId]);
    } else {
      setSelectedItems((prev) =>
        prev?.includes(itemId) ? prev?.filter((id) => id !== itemId) : [...prev, itemId]
      );
    }
  };

  // Bulk actions
  const handleBulkMoveToLocation = (locationId: 'pantry' | 'fridge' | 'freezer') => {
    setPantryItems((prev) =>
      prev?.map((item) =>
        selectedItems?.includes(item?.id) ? { ...item, location: locationId } : item
      )
    );
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleBulkMarkAsUsed = () => {
    setPantryItems((prev) => prev?.filter((item) => !selectedItems?.includes(item?.id)));
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleBulkDelete = () => {
    setPantryItems((prev) => prev?.filter((item) => !selectedItems?.includes(item?.id)));
    setSelectionMode(false);
    setSelectedItems([]);
  };

  // Azioni per singolo item
  const handleEditItem = (item: PantryItem) => {
    console.log('Editing item:', item);
    // TODO: apri modal di edit se/quando la implementi
  };

  const handleMarkItemUsed = (item: PantryItem) => {
    setPantryItems((prev) => prev?.filter((i) => i?.id !== item?.id));
  };

  const handleDeleteItem = (item: PantryItem) => {
    setPantryItems((prev) => prev?.filter((i) => i?.id !== item?.id));
  };

  // Aggiunta nuovo ingrediente
  const handleAddIngredient = (newIngredient: PantryItem) => {
    setPantryItems((prev) => [newIngredient, ...prev]);
  };

  // FAB
  const handleFloatingAction = (action: string) => {
    if (action === 'add-ingredient') {
      setShowAddModal(true);
    }
  };

  // Dalla sezione alert scadenze: vai all'item
  const handleViewItemFromAlert = (item: PantryItem) => {
    setActiveLocation(item?.location);
    setSearchTerm(item?.name);
  };

  // Quando non ci sono più selezionati -> chiudi selection mode
  useEffect(() => {
    if (selectedItems?.length === 0 && selectionMode) {
      setSelectionMode(false);
    }
  }, [selectedItems?.length, selectionMode]);

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

        {/* Storage Location Tabs */}
        <StorageLocationTabs
          activeLocation={activeLocation}
          onLocationChange={setActiveLocation}
        />

        {/* Expiration Alerts */}
        {showAlerts && (
          <ExpirationAlerts
            ingredients={pantryItems}
            onDismiss={() => setShowAlerts(false)}
            onViewItem={handleViewItemFromAlert}
          />
        )}

        {/* Items Grid */}
        <div className="px-4 py-4">
          {filteredItems?.length === 0 ? (
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
              {filteredItems?.map((item) => (
                <IngredientCard
                  key={item?.id}
                  ingredient={item}
                  isSelected={selectedItems?.includes(item?.id)}
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

      {/* Bulk Actions Bar */}
      {selectionMode && selectedItems?.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedItems?.length}
          onMoveToLocation={handleBulkMoveToLocation}
          onMarkAsUsed={handleBulkMarkAsUsed}
          onDelete={handleBulkDelete}
          onCancel={() => {
            setSelectionMode(false);
            setSelectedItems([]);
          }}
        />
      )}

      {/* Add Ingredient Modal */}
      <AddIngredientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddIngredient}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleFloatingAction} />

      {/* Bottom Navigation */}
      <BottomTabNavigation />
    </div>
  );
};

export default PantryManagement;

