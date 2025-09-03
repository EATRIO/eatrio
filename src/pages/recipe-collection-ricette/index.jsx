import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import SearchHeader from './components/SearchHeader';
import FilterChips from './components/FilterChips';
import SortOptions from './components/SortOptions';
import AdvancedFilters from './components/AdvancedFilters';
import RecipeGrid from './components/RecipeGrid';


const RecipeCollection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Mock recipe data
  const mockRecipes = [
    {
      id: 1,
      title: "Spaghetti alla Carbonara",
      description: "Classica ricetta romana con uova, pecorino e guanciale",
      image: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      cookingTime: 20,
      difficulty: 2,
      servings: 4,
      calories: 520,
      protein: 22,
      carbs: 65,
      estimatedCost: 8.50,
      ingredientAvailability: 85,
      isFavorite: false,
      priceComparison: {
        coop: 8.20,
        conad: 8.50,
        esselunga: 8.80,
        avg: 8.50
      },
      dietary: ['vegetarian'],
      tools: ['stovetop'],
      mealType: ['lunch', 'dinner']
    },
    {
      id: 2,
      title: "Risotto ai Funghi Porcini",
      description: "Cremoso risotto con funghi porcini freschi e parmigiano",
      image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop",
      cookingTime: 35,
      difficulty: 3,
      servings: 4,
      calories: 420,
      protein: 18,
      carbs: 58,
      estimatedCost: 12.30,
      ingredientAvailability: 60,
      isFavorite: true,
      priceComparison: {
        coop: 12.00,
        conad: 12.30,
        esselunga: 12.80,
        avg: 12.37
      },
      dietary: ['vegetarian'],
      tools: ['stovetop'],
      mealType: ['lunch', 'dinner']
    },
    {
      id: 3,
      title: "Pollo alla Cacciatora",
      description: "Pollo in umido con pomodori, olive e erbe aromatiche",
      image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
      cookingTime: 45,
      difficulty: 2,
      servings: 6,
      calories: 380,
      protein: 35,
      carbs: 12,
      estimatedCost: 15.20,
      ingredientAvailability: 90,
      isFavorite: false,
      priceComparison: {
        coop: 14.80,
        conad: 15.20,
        esselunga: 15.60,
        avg: 15.20
      },
      dietary: [],
      tools: ['stovetop', 'oven'],
      mealType: ['lunch', 'dinner']
    },
    {
      id: 4,
      title: "Insalata di Quinoa e Verdure",
      description: "Fresca insalata con quinoa, verdure di stagione e vinaigrette",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
      cookingTime: 15,
      difficulty: 1,
      servings: 2,
      calories: 280,
      protein: 12,
      carbs: 45,
      estimatedCost: 6.80,
      ingredientAvailability: 75,
      isFavorite: true,
      priceComparison: {
        coop: 6.50,
        conad: 6.80,
        esselunga: 7.20,
        avg: 6.83
      },
      dietary: ['vegetarian', 'vegan', 'glutenFree'],
      tools: ['stovetop'],
      mealType: ['lunch', 'snack']
    },
    {
      id: 5,
      title: "Tiramisù Classico",
      description: "Il dolce italiano più amato con mascarpone e caffè",
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
      cookingTime: 30,
      difficulty: 2,
      servings: 8,
      calories: 450,
      protein: 8,
      carbs: 35,
      estimatedCost: 18.50,
      ingredientAvailability: 40,
      isFavorite: false,
      priceComparison: {
        coop: 18.00,
        conad: 18.50,
        esselunga: 19.20,
        avg: 18.57
      },
      dietary: ['vegetarian'],
      tools: [],
      mealType: ['dessert']
    },
    {
      id: 6,
      title: "Zuppa di Lenticchie",
      description: "Nutriente zuppa di lenticchie con verdure e spezie",
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
      cookingTime: 40,
      difficulty: 1,
      servings: 4,
      calories: 320,
      protein: 18,
      carbs: 52,
      estimatedCost: 4.20,
      ingredientAvailability: 95,
      isFavorite: true,
      priceComparison: {
        coop: 4.00,
        conad: 4.20,
        esselunga: 4.50,
        avg: 4.23
      },
      dietary: ['vegetarian', 'vegan', 'glutenFree'],
      tools: ['stovetop'],
      mealType: ['lunch', 'dinner']
    },
    {
      id: 7,
      title: "Pizza Margherita Fatta in Casa",
      description: "Pizza tradizionale con pomodoro, mozzarella e basilico",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
      cookingTime: 90,
      difficulty: 3,
      servings: 4,
      calories: 380,
      protein: 16,
      carbs: 58,
      estimatedCost: 7.80,
      ingredientAvailability: 70,
      isFavorite: false,
      priceComparison: {
        coop: 7.50,
        conad: 7.80,
        esselunga: 8.20,
        avg: 7.83
      },
      dietary: ['vegetarian'],
      tools: ['oven'],
      mealType: ['lunch', 'dinner']
    },
    {
      id: 8,
      title: "Smoothie Bowl ai Frutti di Bosco",
      description: "Colorata bowl con frutti di bosco, banana e granola",
      image: "https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      cookingTime: 10,
      difficulty: 1,
      servings: 1,
      calories: 250,
      protein: 8,
      carbs: 45,
      estimatedCost: 5.50,
      ingredientAvailability: 80,
      isFavorite: true,
      priceComparison: {
        coop: 5.20,
        conad: 5.50,
        esselunga: 5.80,
        avg: 5.50
      },
      dietary: ['vegetarian', 'vegan', 'glutenFree'],
      tools: [],
      mealType: ['breakfast', 'snack']
    }
  ];

  // Initialize favorites from mock data
  useEffect(() => {
    const favoritesSet = new Set();
    mockRecipes?.forEach(recipe => {
      if (recipe?.isFavorite) {
        favoritesSet?.add(recipe?.id);
      }
    });
    setFavorites(favoritesSet);
  }, []);

  // Filter and sort recipes
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = mockRecipes?.filter(recipe => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery?.toLowerCase();
        if (!recipe?.title?.toLowerCase()?.includes(query) && 
            !recipe?.description?.toLowerCase()?.includes(query)) {
          return false;
        }
      }

      // Quick filters
      if (activeFilters?.quick && recipe?.cookingTime > 30) return false;
      if (activeFilters?.easy && recipe?.difficulty > 1) return false;
      if (activeFilters?.available && recipe?.ingredientAvailability < 80) return false;
      if (activeFilters?.favorites && !favorites?.has(recipe?.id)) return false;
      if (activeFilters?.vegetarian && !recipe?.dietary?.includes('vegetarian')) return false;
      if (activeFilters?.budget && recipe?.estimatedCost > 10) return false;

      // Advanced filters
      if (advancedFilters?.cookingTime) {
        const { min = 0, max = 999 } = advancedFilters?.cookingTime;
        if (recipe?.cookingTime < min || recipe?.cookingTime > max) return false;
      }

      if (advancedFilters?.calories) {
        const { min = 0, max = 9999 } = advancedFilters?.calories;
        if (recipe?.calories < min || recipe?.calories > max) return false;
      }

      if (advancedFilters?.dietary?.length > 0) {
        const hasRequiredDietary = advancedFilters?.dietary?.some(diet => 
          recipe?.dietary?.includes(diet)
        );
        if (!hasRequiredDietary) return false;
      }

      if (advancedFilters?.tools?.length > 0) {
        const hasRequiredTools = advancedFilters?.tools?.some(tool => 
          recipe?.tools?.includes(tool)
        );
        if (!hasRequiredTools) return false;
      }

      if (advancedFilters?.mealType?.length > 0) {
        const hasRequiredMealType = advancedFilters?.mealType?.some(meal => 
          recipe?.mealType?.includes(meal)
        );
        if (!hasRequiredMealType) return false;
      }

      return true;
    });

    // Sort recipes
    filtered?.sort((a, b) => {
      switch (currentSort) {
        case 'time':
          return a?.cookingTime - b?.cookingTime;
        case 'cost':
          return a?.estimatedCost - b?.estimatedCost;
        case 'difficulty':
          return a?.difficulty - b?.difficulty;
        case 'popularity':
          return (favorites?.has(b?.id) ? 1 : 0) - (favorites?.has(a?.id) ? 1 : 0);
        case 'newest':
          return b?.id - a?.id;
        case 'relevance':
        default:
          return b?.ingredientAvailability - a?.ingredientAvailability;
      }
    });

    return filtered;
  }, [searchQuery, activeFilters, advancedFilters, currentSort, favorites]);

  const handleFavoriteToggle = (recipeId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites?.has(recipeId)) {
      newFavorites?.delete(recipeId);
    } else {
      newFavorites?.add(recipeId);
    }
    setFavorites(newFavorites);
  };

  const handleFloatingActionClick = (action) => {
    if (action === 'search-recipes') {
      document.querySelector('input[type="search"]')?.focus();
    }
  };

  const handleResetFilters = () => {
    setActiveFilters({});
    setAdvancedFilters({});
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderWithLogo 
        title="Ricette" 
        actions={[
          {
            icon: 'BookOpen',
            label: 'Ricettario',
            onClick: () => navigate('/user-profile-profilo')
          }
        ]}
      />
      {/* Main Content */}
      <main className="pt-16 pb-24 lg:pb-6 lg:pl-64">
        {/* Search Header */}
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onVoiceSearch={() => handleFloatingActionClick('search-recipes')}
        />

        {/* Filter Chips */}
        <div className="px-4 py-3">
          <FilterChips
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
            onShowAdvancedFilters={() => setShowAdvancedFilters(true)}
          />
        </div>

        {/* Sort Options */}
        <div className="px-4 pb-3">
          <SortOptions
            currentSort={currentSort}
            onSortChange={setCurrentSort}
          />
        </div>

        {/* Results Count */}
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedRecipes?.length} ricette trovate
          </p>
        </div>

        {/* Recipe Grid */}
        <div className="px-4">
          <RecipeGrid
            recipes={filteredAndSortedRecipes}
            onFavoriteToggle={handleFavoriteToggle}
            loading={loading}
          />
        </div>
      </main>
      {/* Advanced Filters Overlay/Sidebar */}
      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onResetFilters={handleResetFilters}
        className="lg:fixed lg:right-4 lg:top-20 lg:bottom-4 lg:z-50"
      />
      {/* Navigation */}
      <BottomTabNavigation />
      <FloatingActionButton onClick={handleFloatingActionClick} />
    </div>
  );
};

export default RecipeCollection;