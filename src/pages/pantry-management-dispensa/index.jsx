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

const PANTRY_STORAGE_KEYS = {
  ui: 'eatrio:pantryUI',              // { location, search }
  items: 'eatrio:pantryItems',        // array pantryItems
  addModalOpen: 'eatrio:pantry:addModal', // opzionale
};

const PantryManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [activeLocation, setActiveLocation] = useState(() => {
  try { return JSON.parse(localStorage.getItem(PANTRY_STORAGE_KEYS.ui) || '{}').location ?? 'all'; }
  catch { return 'all'; }
});
const [searchTerm, setSearchTerm] = useState(() => {
  try { return JSON.parse(localStorage.getItem(PANTRY_STORAGE_KEYS.ui) || '{}').search ?? ''; }
  catch { return ''; }
});
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);

  // Mock pantry data
  // SEED usato solo alla primissima apertura (se non c'è nulla in localStorage)
const SEED_PANTRY = [
  { id: '1', name: 'Pomodori San Marzano', quantity: 2, unit: 'kg', location: 'pantry', category: 'verdure', expirationDate: '2025-01-03', purchaseDate: '2024-12-28', notes: 'Perfetti per sugo', addedAt: '2024-12-28T10:00:00Z' },
  { id: '2', name: 'Mozzarella di Bufala', quantity: 250, unit: 'g', location: 'fridge', category: 'latticini', expirationDate: '2025-01-02', purchaseDate: '2024-12-30', notes: 'DOP Campania', addedAt: '2024-12-30T15:30:00Z' },
  { id: '3', name: 'Pasta Barilla Spaghetti', quantity: 1, unit: 'kg', location: 'pantry', category: 'cereali', expirationDate: '2026-06-15', purchaseDate: '2024-12-25', addedAt: '2024-12-25T12:00:00Z' },
  { id: '4', name: 'Basilico Fresco', quantity: 1, unit: 'mazzo', location: 'fridge', category: 'spezie', expirationDate: '2025-01-04', purchaseDate: '2024-12-31', notes: 'Biologico', addedAt: '2024-12-31T09:15:00Z' },
  { id: '5', name: 'Parmigiano Reggiano', quantity: 300, unit: 'g', location: 'fridge', category: 'latticini', expirationDate: '2025-03-15', purchaseDate: '2024-12-20', notes: '24 mesi stagionatura', addedAt: '2024-12-20T14:45:00Z' },
  { id: '6', name: 'Olio Extravergine', quantity: 750, unit: 'ml', location: 'pantry', category: 'condimenti', expirationDate: '2025-12-31', purchaseDate: '2024-11-15', notes: 'Toscano IGP', addedAt: '2024-11-15T16:20:00Z' },
  { id: '7', name: 'Gelato Vaniglia', quantity: 500, unit: 'ml', location: 'freezer', category: 'dolci', expirationDate: '2025-06-30', purchaseDate: '2024-12-29', addedAt: '2024-12-29T18:00:00Z' },
  { id: '8', name: 'Pane Integrale', quantity: 1, unit: 'pagnotta', location: 'pantry', category: 'cereali', expirationDate: '2025-01-01', purchaseDate: '2024-12-30', notes: 'Fatto in casa', addedAt: '2024-12-30T07:30:00Z' },
];

const [pantryItems, setPantryItems] = useState(() => {
  try {
    const raw = localStorage.getItem(PANTRY_STORAGE_KEYS.items);
    return raw ? JSON.parse(raw) : SEED_PANTRY;
  } catch {
    return SEED_PANTRY;
  }
});
// Persisti UI (tab + ricerca)
useEffect(() => {
  try {
    localStorage.setItem(
      PANTRY_STORAGE_KEYS.ui,
      JSON.stringify({ location: activeLocation, search: searchTerm })
    );
  } catch {}
}, [activeLocation, searchTerm]);

// Persisti gli items
useEffect(() => {
  try {
    localStorage.setItem(PANTRY_STORAGE_KEYS.items, JSON.stringify(pantryItems));
  } catch {}
}, [pantryItems]);


  // Filter items based on location and search
  const filteredItems = pantryItems?.filter(item => {
    const matchesLocation = activeLocation === 'all' || item?.location === activeLocation;
    const matchesSearch = !searchTerm || 
      item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      item?.category?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      item?.notes?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });

  // Salva la dispensa su localStorage ad ogni modifica
useEffect(() => {
  try {
    localStorage.setItem('eatrio:pantry', JSON.stringify(pantryItems));
  } catch {}
}, [pantryItems]);


  // Header actions
  const headerActions = [
    {
      icon: 'Filter',
      label: 'Filtri avanzati',
      onClick: () => {
        // Mock filter functionality
        console.log('Opening advanced filters');
      }
    },
    {
      icon: 'MoreVertical',
      label: 'Menu opzioni',
      onClick: () => {
        // Mock menu functionality
        console.log('Opening options menu');
      }
    }
  ];

  // Handle item selection
  const handleItemSelect = (itemId) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedItems([itemId]);
    } else {
      setSelectedItems(prev => 
        prev?.includes(itemId) 
          ? prev?.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    }
  };

  // Handle bulk actions
  const handleBulkMoveToLocation = (locationId) => {
    setPantryItems(prev => 
      prev?.map(item => 
        selectedItems?.includes(item?.id) 
          ? { ...item, location: locationId }
          : item
      )
    );
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleBulkMarkAsUsed = () => {
    setPantryItems(prev => 
      prev?.filter(item => !selectedItems?.includes(item?.id))
    );
    setSelectionMode(false);
    setSelectedItems([]);
  };

  const handleBulkDelete = () => {
    setPantryItems(prev => 
      prev?.filter(item => !selectedItems?.includes(item?.id))
    );
    setSelectionMode(false);
    setSelectedItems([]);
  };

  // Handle individual item actions
  const handleEditItem = (item) => {
    console.log('Editing item:', item);
    // Mock edit functionality
  };

  const handleMarkItemUsed = (item) => {
    setPantryItems(prev => prev?.filter(i => i?.id !== item?.id));
  };

  const handleDeleteItem = (item) => {
    setPantryItems(prev => prev?.filter(i => i?.id !== item?.id));
  };

  // Handle adding new ingredient
  const handleAddIngredient = (newIngredient) => {
    setPantryItems(prev => [newIngredient, ...prev]);
  };

  // Handle floating action button
  const handleFloatingAction = (action) => {
    if (action === 'add-ingredient') {
      setShowAddModal(true);
    }
  };

  // Handle view item from alerts
  const handleViewItemFromAlert = (item) => {
    setActiveLocation(item?.location);
    setSearchTerm(item?.name);
  };

  // Cancel selection mode when no items selected
  useEffect(() => {
    if (selectedItems?.length === 0 && selectionMode) {
      setSelectionMode(false);
    }
  }, [selectedItems?.length, selectionMode]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderWithLogo
        title="Dispensa" motto="Pianifica. Cucina. Risparmia." 
        actions={headerActions}
      />
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
                  : activeLocation === 'all' ?'La tua dispensa è vuota. Aggiungi il primo ingrediente!'
                    : `Nessun ingrediente in ${activeLocation === 'pantry' ? 'dispensa' : activeLocation === 'fridge' ? 'frigo' : 'freezer'}`
                }
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
