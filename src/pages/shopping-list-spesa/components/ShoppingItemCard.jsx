import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ShoppingItemCard = ({ 
  item, 
  selectedMarket, 
  isSelected,
  onToggle, 
  onQuantityChange, 
  onPriceOverride,
  onMove,
  onDelete,
  onSelect 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [quantityInput, setQuantityInput] = useState('');

  const currentPrice = item?.prices?.[selectedMarket] || item?.prices?.average || 0;
  const itemTotal = currentPrice * item?.quantity;
  const isOverridden = item?.priceOverrides && item?.priceOverrides?.[selectedMarket];
  const confidence = item?.priceConfidence?.[selectedMarket] || 'medium';

  const confidenceColors = {
    high: 'text-success',
    medium: 'text-warning',
    low: 'text-destructive'
  };

  const confidenceLabels = {
    high: 'Prezzo confermato',
    medium: 'Prezzo stimato',
    low: 'Prezzo approssimativo'
  };

  const handlePurchaseToggle = () => {
    onToggle(item?.id, !item?.purchased);
  };

  const handleQuantityEdit = () => {
    setQuantityInput(item?.quantity?.toString());
    setEditingQuantity(true);
  };

  const handleQuantitySave = () => {
    const newQuantity = parseFloat(quantityInput);
    if (newQuantity > 0) {
      onQuantityChange(item?.id, newQuantity);
    }
    setEditingQuantity(false);
  };

  const handlePriceEdit = () => {
    setPriceInput(currentPrice?.toFixed(2));
    setEditingPrice(true);
  };

  const handlePriceSave = () => {
    const newPrice = parseFloat(priceInput);
    if (newPrice >= 0) {
      onPriceOverride(item?.id, selectedMarket, newPrice);
    }
    setEditingPrice(false);
  };

  return (
    <div className={`px-4 py-3 transition-colors duration-150 ${item?.purchased ? 'opacity-60' : ''}`}>
      <div className="flex items-center space-x-3">
        {/* Selection Checkbox */}
        <button
          onClick={() => onSelect(!isSelected)}
          className="touch-target flex items-center justify-center"
        >
          <Icon 
            name={isSelected ? "CheckSquare" : "Square"} 
            size={20} 
            color={isSelected ? "var(--color-primary)" : "var(--color-muted-foreground)"} 
          />
        </button>

        {/* Purchase Checkbox */}
        <button
          onClick={handlePurchaseToggle}
          className="touch-target flex items-center justify-center"
        >
          <Icon 
            name={item?.purchased ? "CheckCircle2" : "Circle"} 
            size={20} 
            color={item?.purchased ? "var(--color-success)" : "var(--color-muted-foreground)"} 
          />
        </button>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className={`font-medium truncate ${item?.purchased ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>
                {item?.name}
              </h4>
              
              <div className="flex items-center space-x-2 mt-1">
                {/* Quantity */}
                {editingQuantity ? (
                  <div className="flex items-center space-x-1">
                    <Input
                      type="number"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e?.target?.value)}
                      className="w-16 h-6 text-xs"
                      min="0.1"
                      step="0.1"
                    />
                    <span className="text-xs text-muted-foreground">{item?.unit}</span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleQuantitySave}
                      iconName="Check"
                      className="h-6 w-6"
                    />
                  </div>
                ) : (
                  <button
                    onClick={handleQuantityEdit}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item?.quantity} {item?.unit}
                  </button>
                )}

                {/* Price Confidence Badge */}
                <span className={`text-xs ${confidenceColors?.[confidence]}`}>
                  {confidenceLabels?.[confidence]}
                </span>

                {isOverridden && (
                  <span className="text-xs bg-warning/20 text-warning px-1 rounded">
                    Modificato
                  </span>
                )}
              </div>

              {/* Recipe Context */}
              {item?.recipeContext && (
                <p className="text-xs text-muted-foreground mt-1">
                  Per: {item?.recipeContext?.join(', ')}
                </p>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center space-x-2 ml-3">
              {/* Price */}
              <div className="text-right">
                {editingPrice ? (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground">€</span>
                    <Input
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e?.target?.value)}
                      className="w-16 h-6 text-xs"
                      min="0"
                      step="0.01"
                    />
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handlePriceSave}
                      iconName="Check"
                      className="h-6 w-6"
                    />
                  </div>
                ) : (
                  <button
                    onClick={handlePriceEdit}
                    className="text-right hover:bg-muted/20 rounded px-1"
                  >
                    <p className="text-sm font-semibold text-card-foreground">
                      €{itemTotal?.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      €{currentPrice?.toFixed(2)}/{item?.unit}
                    </p>
                  </button>
                )}
              </div>

              {/* Actions Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowActions(!showActions)}
                  className="h-8 w-8"
                >
                  <Icon name="MoreVertical" size={16} />
                </Button>

                {showActions && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onMove(item?.id);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/20 flex items-center space-x-2"
                      >
                        <Icon name="Move" size={14} />
                        <span>Sposta sezione</span>
                      </button>
                      <button
                        onClick={() => {
                          navigator.share?.({
                            text: `${item?.name} - ${item?.quantity} ${item?.unit}`
                          });
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted/20 flex items-center space-x-2"
                      >
                        <Icon name="Share" size={14} />
                        <span>Condividi</span>
                      </button>
                      <button
                        onClick={() => {
                          onDelete(item?.id);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-destructive/20 text-destructive flex items-center space-x-2"
                      >
                        <Icon name="Trash2" size={14} />
                        <span>Elimina</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingItemCard;