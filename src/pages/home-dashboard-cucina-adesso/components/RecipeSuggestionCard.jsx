import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RecipeSuggestionCard = ({ 
  recipe, 
  onFavorite, 
  onDismiss, 
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleCookNow = () => {
    navigate('/recipe-detail-cook-mode', { 
      state: { recipe, mode: 'cook' } 
    });
  };

  const handleViewDetails = () => {
    navigate('/recipe-detail-cook-mode', { 
      state: { recipe, mode: 'view' } 
    });
  };

  const getDifficultyLabel = (level) => {
    const labels = { 1: 'Facile', 2: 'Medio', 3: 'Difficile' };
    return labels?.[level] || 'Medio';
  };

  const getDifficultyColor = (level) => {
    const colors = { 1: 'text-success', 2: 'text-warning', 3: 'text-error' };
    return colors?.[level] || 'text-warning';
  };

  return (
    <div className={`glass-morphism rounded-lg overflow-hidden border border-border ${className}`}>
      {/* Recipe Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={recipe?.image}
          alt={recipe?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={() => onFavorite?.(recipe?.id)}
            className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/90 transition-colors"
            aria-label="Aggiungi ai preferiti"
          >
            <Icon 
              name={recipe?.isFavorite ? "Heart" : "Heart"} 
              size={16} 
              color={recipe?.isFavorite ? "var(--color-error)" : "var(--color-muted-foreground)"} 
            />
          </button>
          <button
            onClick={() => onDismiss?.(recipe?.id)}
            className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/90 transition-colors"
            aria-label="Nascondi ricetta"
          >
            <Icon name="X" size={16} color="var(--color-muted-foreground)" />
          </button>
        </div>
        
        {/* Available Ingredients Badge */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-xs font-medium text-primary-foreground">
              {recipe?.availableIngredientsPercentage}% disponibili
            </span>
          </div>
        </div>
      </div>
      {/* Recipe Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
            {recipe?.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe?.description}
          </p>
        </div>

        {/* Recipe Metadata */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
              <span className="text-muted-foreground">{recipe?.cookingTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="ChefHat" size={14} color="var(--color-muted-foreground)" />
              <span className={`font-medium ${getDifficultyColor(recipe?.difficulty)}`}>
                {getDifficultyLabel(recipe?.difficulty)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Users" size={14} color="var(--color-muted-foreground)" />
            <span className="text-muted-foreground">{recipe?.servings} porzioni</span>
          </div>
        </div>

        {/* Missing Ingredients */}
        {recipe?.missingIngredients && recipe?.missingIngredients?.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning mb-1">
                  Ingredienti mancanti:
                </p>
                <p className="text-xs text-muted-foreground">
                  {recipe?.missingIngredients?.slice(0, 3)?.join(', ')}
                  {recipe?.missingIngredients?.length > 3 && ` e altri ${recipe?.missingIngredients?.length - 3}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            onClick={handleViewDetails}
            className="flex-1"
          >
            <Icon name="Eye" size={16} className="mr-2" />
            Dettagli
          </Button>
          <Button
            variant="default"
            onClick={handleCookNow}
            className="flex-1"
            disabled={recipe?.availableIngredientsPercentage < 50}
          >
            <Icon name="Play" size={16} className="mr-2" />
            Cucina Ora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeSuggestionCard;