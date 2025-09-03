import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const RecipeHero = ({ 
  recipe, 
  servings, 
  onServingsChange, 
  onToggleFavorite, 
  onShare,
  onStartCookMode 
}) => {
  const handleServingsChange = (increment) => {
    const newServings = Math.max(1, servings + increment);
    onServingsChange(newServings);
  };

  return (
    <div className="relative h-80 lg:h-96 overflow-hidden rounded-b-3xl">
      <Image
        src={recipe?.image}
        alt={recipe?.title}
        className="w-full h-full object-cover"
      />
      {/* Glass Morphism Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="space-y-4">
          {/* Recipe Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
            {recipe?.title}
          </h1>
          
          {/* Recipe Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={16} color="white" />
              <span className="text-sm font-medium">{recipe?.cookTime}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Icon name="ChefHat" size={16} color="white" />
              <div className="flex space-x-1">
                {[1, 2, 3]?.map((level) => (
                  <div
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      level <= recipe?.difficulty 
                        ? 'bg-primary' :'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Icon name="Zap" size={16} color="white" />
              <span className="text-sm font-medium">{recipe?.calories} kcal</span>
            </div>
          </div>
          
          {/* Servings Control & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm text-white/90 font-medium">Porzioni:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleServingsChange(-1)}
                  disabled={servings <= 1}
                  className="w-8 h-8 text-white hover:bg-white/20"
                >
                  <Icon name="Minus" size={16} />
                </Button>
                <span className="text-white font-semibold min-w-[2rem] text-center">
                  {servings}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleServingsChange(1)}
                  className="w-8 h-8 text-white hover:bg-white/20"
                >
                  <Icon name="Plus" size={16} />
                </Button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                className="w-10 h-10 text-white hover:bg-white/20"
              >
                <Icon 
                  name={recipe?.isFavorite ? "Heart" : "Heart"} 
                  size={20}
                  color={recipe?.isFavorite ? "var(--color-error)" : "white"}
                />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onShare}
                className="w-10 h-10 text-white hover:bg-white/20"
              >
                <Icon name="Share" size={20} />
              </Button>
            </div>
          </div>
          
          {/* Cook Mode Button */}
          <Button
            variant="success"
            onClick={onStartCookMode}
            className="w-full kitchen-safe bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Icon name="Play" size={20} className="mr-2" />
            Inizia Modalità Cucina
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeHero;