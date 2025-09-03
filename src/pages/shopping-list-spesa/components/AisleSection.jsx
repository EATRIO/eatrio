import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ShoppingItemCard from './ShoppingItemCard';

const AisleSection = ({ 
  aisle, 
  items, 
  selectedMarket, 
  onItemToggle, 
  onQuantityChange, 
  onPriceOverride,
  onMoveItem,
  onDeleteItem 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  const completedItems = items?.filter(item => item?.purchased)?.length;
  const totalItems = items?.length;
  const sectionTotal = items?.reduce((sum, item) => {
    const price = item?.prices?.[selectedMarket] || item?.prices?.average || 0;
    return sum + (price * item?.quantity);
  }, 0);

  const aisleIcons = {
    'Frutta e Verdura': 'Apple',
    'Latticini': 'Milk',
    'Dispensa': 'Package',
    'Carne e Pesce': 'Fish',
    'Surgelati': 'Snowflake',
    'Bevande': 'Coffee',
    'Altro': 'ShoppingCart'
  };

  const handleSelectAll = () => {
    if (selectedItems?.length === items?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items?.map(item => item?.id));
    }
  };

  const handleBulkAction = (action) => {
    selectedItems?.forEach(itemId => {
      const item = items?.find(i => i?.id === itemId);
      if (item && action === 'purchase') {
        onItemToggle(itemId, true);
      } else if (item && action === 'delete') {
        onDeleteItem(itemId);
      }
    });
    setSelectedItems([]);
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Section Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-3 flex-1 text-left touch-target"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon 
                name={aisleIcons?.[aisle?.name] || 'ShoppingCart'} 
                size={16} 
                color="var(--color-primary)" 
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-card-foreground">{aisle?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {completedItems}/{totalItems} completati • €{sectionTotal?.toFixed(2)}
              </p>
            </div>
            <Icon 
              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
              size={20} 
              color="var(--color-muted-foreground)" 
            />
          </button>
        </div>

        {/* Bulk Actions */}
        {isExpanded && items?.length > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Icon 
                name={selectedItems?.length === items?.length ? "CheckSquare" : "Square"} 
                size={16} 
              />
              <span>
                {selectedItems?.length === items?.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
              </span>
            </button>

            {selectedItems?.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('purchase')}
                  className="flex items-center space-x-1 px-3 py-1 bg-success/10 text-success rounded-lg text-sm hover:bg-success/20"
                >
                  <Icon name="Check" size={14} />
                  <span>Acquista</span>
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="flex items-center space-x-1 px-3 py-1 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20"
                >
                  <Icon name="Trash2" size={14} />
                  <span>Elimina</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Items List */}
      {isExpanded && (
        <div className="divide-y divide-border">
          {items?.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Icon name="Package" size={32} color="var(--color-muted-foreground)" className="mx-auto mb-2" />
              <p className="text-muted-foreground">Nessun articolo in questa sezione</p>
            </div>
          ) : (
            items?.map((item) => (
              <ShoppingItemCard
                key={item?.id}
                item={item}
                selectedMarket={selectedMarket}
                isSelected={selectedItems?.includes(item?.id)}
                onToggle={onItemToggle}
                onQuantityChange={onQuantityChange}
                onPriceOverride={onPriceOverride}
                onMove={onMoveItem}
                onDelete={onDeleteItem}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedItems([...selectedItems, item?.id]);
                  } else {
                    setSelectedItems(selectedItems?.filter(id => id !== item?.id));
                  }
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AisleSection;