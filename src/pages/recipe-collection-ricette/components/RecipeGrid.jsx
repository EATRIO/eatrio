import React from 'react';
import RecipeCard from './RecipeCard';
import Icon from '../../../components/AppIcon';


const RecipeGrid = ({ 
  recipes, 
  onFavoriteToggle, 
  loading = false,
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 })?.map((_, index) => (
          <div key={index} className="bg-card rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-muted"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recipes?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon name="Search" size={32} color="var(--color-muted-foreground)" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nessuna ricetta trovata
        </h3>
        <p className="text-muted-foreground max-w-md">
          Prova a modificare i filtri di ricerca o esplora altre categorie per trovare ricette deliziose.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {recipes?.map((recipe) => (
        <RecipeCard
          key={recipe?.id}
          recipe={recipe}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;