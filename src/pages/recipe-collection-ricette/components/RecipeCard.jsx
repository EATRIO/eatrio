// src/pages/recipe-collection-ricette/components/RecipeCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { usePantryItems, computeRecipeCompletion } from '../../../utils/pantryStorage';

const RecipeCard = ({ recipe, onFavoriteToggle, className = '' }) => {
  const navigate = useNavigate();

  // 1) Dispensa reattiva (aggiorna su 'storage' + 'pantry:updated')
  const pantryItems = usePantryItems();

  // 2) Calcolo percentuale/disponibilità usando gli ingredienti REALI della ricetta
  //    Atteso: recipe.ingredients = [{ name, quantity, unit }, ...]
  const { percent: availabilityPct } = computeRecipeCompletion(recipe, pantryItems);

  const handleCardClick = () => {
    navigate('/recipe-detail-cook-mode', { state: { recipe } });
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavoriteToggle?.(recipe?.id);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1: return 'text-success';
      case 2: return 'text-warning';
      case 3: return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 1: return 'Facile';
      case 2: return 'Medio';
      case 3: return 'Difficile';
      default: return 'N/A';
    }
  };

  const getAvailabilityColor = (percentage) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-error';
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price ?? 0);

  return (
    <div
      className={`bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer active:scale-98 flex flex-col ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe?.image}
          alt={recipe?.title}
          className="w-full h-full object-cover object-center"
          onClick={handleCardClick}
        />

        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/90 transition-colors"
          aria-label={recipe?.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        >
          <Icon
            name="Heart"
            size={20}
            color={recipe?.isFavorite ? 'var(--color-error)' : 'var(--color-muted-foreground)'}
            className={recipe?.isFavorite ? 'fill-current' : ''}
          />
        </button>

        {recipe?.estimatedCost != null && (
          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
            {formatPrice(recipe?.estimatedCost)}
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
          <span className={getAvailabilityColor(availabilityPct)}>
            {availabilityPct}% disponibile
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3
            className="text-lg font-semibold text-card-foreground line-clamp-2 mb-1 hover:underline"
            onClick={handleCardClick}
          >
            {recipe?.title}
          </h3>
          {recipe?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe?.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Icon name="Clock" size={16} color="var(--color-muted-foreground)" />
            <span className="text-muted-foreground">{recipe?.cookingTime}min</span>
          </div>

          <div className="flex items-center gap-1">
            <Icon name="ChefHat" size={16} color="var(--color-muted-foreground)" />
            <span className={getDifficultyColor(recipe?.difficulty)}>
              {getDifficultyText(recipe?.difficulty)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Icon name="Users" size={16} color="var(--color-muted-foreground)" />
            <span className="text-muted-foreground">{recipe?.servings}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
          <div>{recipe?.calories} kcal</div>
          <div>Proteine: {recipe?.protein} g</div>
          <div>Carboidrati: {recipe?.carbs} g</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="w-full sm:w-auto"
            iconName="BookOpen"
            iconPosition="left"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCardClick();
            }}
          >
            Dettagli
          </Button>

          {/* Se vuoi lasciare il tasto Carrello, qui puoi usare la tua logica attuale,
              ma non serve più alcun catalogo prezzi in questa card */}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

