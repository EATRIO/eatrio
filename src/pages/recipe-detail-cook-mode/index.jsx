import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import CookModeOverlay from '../../components/ui/CookModeOverlay';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// sezioni “ricche”
import RecipeHero from './components/RecipeHero';
import IngredientsList from './components/IngredientsList';
import CookingInstructions from './components/CookingInstructions';
import NutritionInfo from './components/NutritionInfo';
import CostEstimation from './components/CostEstimation';

/* =======================
   DISPENSA & MATCHING
   ======================= */
const loadPantry = () => {
  try {
    const raw = localStorage.getItem('eatrio:pantry');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// normalizza: minuscolo, toglie articoli/preposizioni comuni, spazi multipli
const keyOf = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/\b(di|del|della|dello|dei|degli|delle|al|allo|alla|ai|agli|alle|lo|la|il|i|gli|le)\b/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// alias/sinonimi semplici
const ALIASES = {
  pollo: ['petto di pollo', 'cosce di pollo', 'fusi di pollo', 'suprema di pollo'],
  cipolla: ['cipolle'],
  pomodoro: ['pomodori', 'passata di pomodoro', 'polpa di pomodoro'],
  funghi: ['porcini', 'champignon', 'funghi porcini'],
  parmigiano: ['parmigiano reggiano', 'grana padano'],
};

const expands = (name) => {
  const k = keyOf(name);
  const list = [k];
  Object.entries(ALIASES).forEach(([root, arr]) => {
    if (k === keyOf(root) || arr.map(keyOf).includes(k)) {
      list.push(keyOf(root), ...arr.map(keyOf));
    }
  });
  return Array.from(new Set(list));
};

// match “inclusivo”: token simili o alias
const nameMatches = (pantryName, ingName) => {
  const p = keyOf(pantryName);
  const candidates = expands(ingName);
  return candidates.some((c) => p.includes(c) || c.includes(p));
};

// unit convert (g↔kg, ml↔l)
const toSameUnit = (qty, fromU, toU) => {
  const f = (fromU || '').toLowerCase();
  const t = (toU || '').toLowerCase();
  if (f === t) return qty;
  if (f === 'g' && t === 'kg') return qty / 1000;
  if (f === 'kg' && t === 'g') return qty * 1000;
  if (f === 'ml' && t === 'l') return qty / 1000;
  if (f === 'l' && t === 'ml') return qty * 1000;
  return qty;
};

// quanto ho/quanto manca
const checkPantryFor = (pantry, name, needQty, needUnit) => {
  let haveQty = 0;
  pantry.forEach((p) => {
    if (nameMatches(p?.name, name)) {
      haveQty += toSameUnit(Number(p?.quantity || 0), p?.unit, needUnit);
    }
  });
  const missing = Math.max(0, (Number(needQty) || 0) - haveQty);
  return { availableQty: haveQty, missingQty: missing, available: missing <= 0.0001 };
};

/* =======================
   SOSTITUZIONI
   ======================= */
const SUBS = {
  'funghi porcini': [{ name: 'champignon', ratio: 1.3, note: 'Usane un po’ di più' }],
  'passata di pomodoro': [{ name: 'polpa di pomodoro', ratio: 1.0 }],
  'cipolla': [{ name: 'scalogno', ratio: 0.7 }, { name: 'porro', ratio: 1.2 }],
  'parmigiano': [{ name: 'grana padano', ratio: 1.0 }],
  'riso carnaroli': [{ name: 'arborio', ratio: 1.0 }],
  'pollo': [{ name: 'fusi di pollo', ratio: 1.0 }],
};

/* ==============
   VARI HELPERS
   ============== */
const cap = (s) => (s || '').replace(/\b\w/g, (m) => m.toUpperCase());

/**
 * Costruisce ricetta “ricca” (ingredienti+step)
 * + arricchisce con availability dispensa + proposte sostituzioni.
 */
const buildRichRecipe = (base) => {
  if (!base) return null;

  const title = base.title || 'Ricetta';
  const t = title.toLowerCase();
  const servings = base.servings || 4;
  const cookingTime = base.cookingTime || base.cookTime || 20;
  const description =
    base.description || `Ricetta semplice e gustosa: ${title}. Perfetta per un pasto veloce.`;

  // ingredienti “di base” se non forniti
  let ingredients = base.ingredients;
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    if (t.includes('carbonara')) {
      ingredients = [
        { id: 1, name: 'Spaghetti', amount: 360, unit: 'g' },
        { id: 2, name: 'Guanciale', amount: 120, unit: 'g' },
        { id: 3, name: 'Uova', amount: 4, unit: 'pz' },
        { id: 4, name: 'Pecorino Romano', amount: 60, unit: 'g' },
        { id: 5, name: 'Pepe nero', amount: 2, unit: 'g' },
      ];
    } else if (t.includes('risotto') || t.includes('funghi')) {
      ingredients = [
        { id: 1, name: 'Riso Carnaroli', amount: 320, unit: 'g' },
        { id: 2, name: 'Funghi Porcini', amount: 300, unit: 'g' },
        { id: 3, name: 'Brodo vegetale', amount: 1, unit: 'l' },
        { id: 4, name: 'Cipolla', amount: 1, unit: 'pz' },
        { id: 5, name: 'Burro', amount: 40, unit: 'g' },
        { id: 6, name: 'Parmigiano', amount: 60, unit: 'g' },
        { id: 7, name: 'Vino bianco', amount: 80, unit: 'ml' },
      ];
    } else if (t.includes('pollo')) {
      ingredients = [
        { id: 1, name: 'Pollo', amount: 1, unit: 'kg' },
        { id: 2, name: 'Passata di pomodoro', amount: 400, unit: 'g' },
        { id: 3, name: 'Olive', amount: 120, unit: 'g' },
        { id: 4, name: 'Cipolla', amount: 1, unit: 'pz' },
        { id: 5, name: 'Olio EVO', amount: 30, unit: 'ml' },
        { id: 6, name: 'Alloro', amount: 2, unit: 'pz' },
      ];
    } else if (t.includes('lenticchie') || t.includes('zuppa')) {
      // ✅ Zuppa di Lenticchie
      ingredients = [
        { id: 1, name: 'Lenticchie secche', amount: 300, unit: 'g' },
        { id: 2, name: 'Carota', amount: 1, unit: 'pz' },
        { id: 3, name: 'Sedano', amount: 1, unit: 'pz' },
        { id: 4, name: 'Cipolla', amount: 1, unit: 'pz' },
        { id: 5, name: 'Passata di pomodoro', amount: 200, unit: 'g' },
        { id: 6, name: 'Brodo vegetale', amount: 1, unit: 'l' },
        { id: 7, name: 'Olio EVO', amount: 30, unit: 'ml' },
        { id: 8, name: 'Sale', amount: 5, unit: 'g' },
      ];
    } else if (t.includes('torta') || t.includes('dolce') || t.includes('biscotti') || t.includes('tiramis')) {
      // ramo dolci (no passata!)
      ingredients = [
        { id: 1, name: 'Farina 00', amount: 300, unit: 'g' },
        { id: 2, name: 'Zucchero', amount: 150, unit: 'g' },
        { id: 3, name: 'Uova', amount: 3, unit: 'pz' },
        { id: 4, name: 'Burro', amount: 120, unit: 'g' },
        { id: 5, name: 'Lievito per dolci', amount: 16, unit: 'g' },
      ];
    } else {
      ingredients = [
        { id: 1, name: 'Pasta', amount: 320, unit: 'g' },
        { id: 2, name: 'Pomodoro', amount: 400, unit: 'g' },
        { id: 3, name: 'Olio EVO', amount: 20, unit: 'ml' },
        { id: 4, name: 'Sale', amount: 5, unit: 'g' },
      ];
    }
  }

  // step “di base” se non forniti
  let steps = base.steps;
  if (!Array.isArray(steps) || steps.length === 0) {
    steps = [
      {
        id: 1,
        title: 'Preparazione ingredienti',
        description:
          'Pesa e prepara tutti gli ingredienti. Porta a bollore acqua/brodo se necessari.',
        type: 'prep',
        duration: '5 min',
        tips: 'Mise en place: ti farà risparmiare tempo durante la cottura.',
      },
      {
        id: 2,
        title: 'Cottura base',
        description:
          'Avvia la cottura seguendo la ricetta. Mescola di tanto in tanto e regola di sale.',
        type: 'cook',
        duration: `${Math.max(5, Math.round(cookingTime * 0.6))} min`,
        timerMinutes: Math.max(5, Math.round(cookingTime * 0.6)),
        tips: 'Fiamma media: evita di bruciare gli aromi.',
      },
      {
        id: 3,
        title: 'Finitura e impiattamento',
        description:
          'Terminata la cottura, spegni il fuoco e rifinisci con condimenti. Impiatta subito.',
        type: 'mix',
        duration: `${Math.max(2, Math.round(cookingTime * 0.2))} min`,
        tips: 'Piatti caldi migliorano la resa finale.',
      },
    ];
  }

  // nutrizione/costi default se non presenti
  const nutrition =
    base.nutrition || {
      calories: base.calories || 400,
      protein: base.protein || 15,
      carbs: base.carbs || 55,
      fats: base.fats || 12,
      fiber: base.fiber || 4,
      sodium: base.sodium || 600,
    };

  const costData =
    base.costData || {
      coop: base.priceComparison?.coop ?? base.estimatedCost ?? 8.5,
      conad: base.priceComparison?.conad ?? (base.estimatedCost ? base.estimatedCost * 1.05 : 8.9),
      esselunga: base.priceComparison?.esselunga ?? (base.estimatedCost ? base.estimatedCost * 1.03 : 8.7),
      average:
        base.priceComparison?.avg ??
        (base.estimatedCost ??
          ((base.priceComparison?.coop ?? 8.5) +
            (base.priceComparison?.conad ?? 8.9) +
            (base.priceComparison?.esselunga ?? 8.7)) /
            3),
    };

  /* ---- Arricchimento con DISPENSA e SOSTITUZIONI ---- */
  const pantry = loadPantry();
  const enrichedIngredients = (ingredients || []).map((ing, idx) => {
    const { availableQty, missingQty, available } = checkPantryFor(
      pantry,
      ing.name,
      Number(ing.amount || 0),
      ing.unit
    );

    // proposta sostituzione solo se manca
    const subs = SUBS[keyOf(ing.name)] || [];
    const firstSub = subs[0]
      ? {
          name: subs[0].name,
          amount: Number((Number(ing.amount || 0) * (subs[0].ratio || 1)).toFixed(0)),
          unit: ing.unit,
          note: subs[0].note,
        }
      : null;

    return {
      id: ing.id ?? idx + 1,
      ...ing,
      available,
      availableQty,
      missingQty,
      substitute: ing.substitute || (available ? null : firstSub),
    };
  });

  return {
    id: base.id ?? 'tmp',
    title: cap(title),
    image:
      base.image ||
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=900&fit=crop',
    cookTime: `${cookingTime} min`,
    cookingTime: cookingTime,
    difficulty: base.difficulty ?? 2,
    calories: base.calories ?? nutrition.calories,
    servings,
    isFavorite: !!base.isFavorite,
    description,
    ingredients: enrichedIngredients,
    steps,
    nutrition,
    costData,
  };
};

const RecipeDetailCookMode = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // dal click su card
  const baseRecipe = location?.state?.recipe || null;

  // stato UI
  const [servings, setServings] = useState(baseRecipe?.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [currentCookStep, setCurrentCookStep] = useState(0);
  const [activeTimer, setActiveTimer] = useState(null);

  // sostituzioni runtime
  const [customIngredients, setCustomIngredients] = useState(null);

  const recipe = useMemo(() => buildRichRecipe({ ...baseRecipe, servings }), [baseRecipe, servings]);
  const effectiveIngredients = customIngredients || recipe?.ingredients || [];

  // fallback se entri senza stato
  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWithLogo showBackButton title="Ricetta" />
        <main className="pt-16 pb-24 lg:pb-8 lg:pl-64">
          <div className="px-4 py-10 text-center">
            <Icon name="Info" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Nessuna ricetta da mostrare</h2>
            <p className="text-muted-foreground mb-6">Apri questa pagina toccando una ricetta dall’elenco.</p>
            <Button onClick={() => navigate('/recipe-collection-ricette')} iconName="ArrowLeft" iconPosition="left">
              Torna alle Ricette
            </Button>
          </div>
        </main>
        <BottomTabNavigation />
      </div>
    );
  }

  /* ===== handlers ===== */
  const handleServingsChange = (s) => setServings(s);
  const handleToggleFavorite = () => console.log('Toggle favorite:', recipe.id);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: window.location?.href,
        });
      } catch (e) {
        console.log('share error', e);
      }
    } else {
      navigator.clipboard?.writeText(window.location?.href);
      alert('Link copiato negli appunti!');
    }
  };

  const handleStartCookMode = () => {
    setIsCookModeOpen(true);
    setCurrentCookStep(0);
  };
  const handleCloseCookMode = () => {
    setIsCookModeOpen(false);
    setActiveTimer(null);
  };
  const handleIngredientCheck = (id, checked) =>
    setCheckedIngredients((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  const handleStepCheck = (id, checked) =>
    setCheckedSteps((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  const handleStartTimer = (minutes, stepTitle) => {
    setActiveTimer({ minutes, stepTitle, startTime: Date.now() });
  };

  // Applica sostituzione per un ingrediente
  const applySubstitution = (ingredientId) => {
    const src = customIngredients ? [...customIngredients] : [...(recipe?.ingredients || [])];
    const i = src.findIndex((x) => x.id === ingredientId);
    if (i === -1) return;
    const ing = src[i];
    if (!ing.substitute) return;

    src[i] = {
      ...ing,
      name: cap(ing.substitute.name),
      amount: ing.substitute.amount,
      unit: ing.substitute.unit || ing.unit,
      available: false, // si può ricalcolare contro dispensa, step successivo
      substitute: null,
    };
    setCustomIngredients(src);
  };

  // === Aggiunta al carrello ===
  const enqueueCartItems = (items) => {
    try {
      const key = 'eatrio:cart:addQueue';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([...prev, ...items]));
    } catch {}
  };

  const handleAddSingleToCart = (ingredient) => {
    const qty = Math.max(0.1, Number(ingredient?.missingQty ?? ingredient?.amount ?? 0) || 0);
    if (!qty) return;

    enqueueCartItems([
      {
        name: cap(ingredient?.name),
        quantity: qty,
        unit: ingredient?.unit || 'pz',
      },
    ]);
    navigate('/shopping-list-spesa');
  };

  const handleAddAllMissingToCart = () => {
    const missing = (effectiveIngredients || []).filter((ing) => (ing?.missingQty || 0) > 0.0001);
    if (missing.length === 0) return;

    const payload = missing.map((ing) => ({
      name: cap(ing.name),
      quantity: Math.max(0.1, Number(ing.missingQty) || 0),
      unit: ing.unit || 'pz',
    }));

    enqueueCartItems(payload);
    navigate('/shopping-list-spesa');
  };

  /* ===== render ===== */
  const headerActions = [
    { icon: 'Share', label: 'Condividi ricetta', onClick: handleShare },
    { icon: 'Heart', label: 'Aggiungi ai preferiti', onClick: handleToggleFavorite },
  ];

  // se ci sono proposte di sostituzione, mostriamo un micro-blocco
  const suggestedSubs = (effectiveIngredients || []).filter((i) => i?.substitute);

  return (
    <div className="min-h-screen bg-background">
      <HeaderWithLogo showBackButton title={recipe.title} actions={headerActions} />

      <main className="pt-16 pb-24 lg:pb-6 lg:pl-64">
        <div className="max-w-4xl mx-auto">
          {/* HERO */}
          <RecipeHero
            recipe={recipe}
            servings={servings}
            onServingsChange={handleServingsChange}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onStartCookMode={handleStartCookMode}
          />

          <div className="p-4 space-y-8">
            {/* Descrizione */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Descrizione</h2>
              <p className="text-card-foreground leading-relaxed">{recipe.description}</p>
            </div>

            {/* Ingredienti */}
            <IngredientsList
              ingredients={effectiveIngredients}
              servings={servings}
              baseServings={recipe.servings}
              checkedIngredients={checkedIngredients}
              onIngredientCheck={handleIngredientCheck}
              onAddToShoppingList={handleAddSingleToCart}   // ✅ aggiunge davvero al carrello
              onSubstitute={applySubstitution}              // ✅ sostituzioni funzionanti
            />

            {/* Sostituzioni suggerite (se presenti) */}
            {suggestedSubs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Sostituzioni suggerite</h3>
                <div className="space-y-2">
                  {suggestedSubs.map((ing) => (
                    <div key={ing.id} className="flex items-center justify-between bg-muted/15 rounded-lg p-3">
                      <div className="text-sm">
                        <div className="font-medium">{cap(ing.name)}</div>
                        <div className="text-xs text-muted-foreground">
                          Proposta: {cap(ing.substitute.name)} — {ing.substitute.amount} {ing.substitute.unit || ing.unit}
                          {ing.substitute.note ? ` (${ing.substitute.note})` : ''}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applySubstitution(ing.id)}
                      >
                        Applica
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA: aggiungi tutti i mancanti */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Aggiungi al carrello solo gli ingredienti mancanti
              </div>
              <Button size="sm" onClick={handleAddAllMissingToCart} iconName="ShoppingCart" iconPosition="left">
                Aggiungi Mancanti
              </Button>
            </div>

            {/* Istruzioni */}
            <CookingInstructions
              steps={recipe.steps}
              checkedSteps={checkedSteps}
              onStepCheck={handleStepCheck}
              onStartTimer={handleStartTimer}
            />

            {/* Nutrizione */}
            <NutritionInfo
              nutrition={recipe.nutrition}
              servings={servings}
              baseServings={recipe.servings}
            />

            {/* Costi */}
            <CostEstimation
              costData={recipe.costData}
              servings={servings}
              baseServings={recipe.servings}
            />

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/shopping-list-spesa')}
                className="kitchen-safe"
              >
                <Icon name="ShoppingCart" size={20} className="mr-2" />
                Lista Spesa
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/recipe-collection-ricette')}
                className="kitchen-safe"
              >
                <Icon name="BookOpen" size={20} className="mr-2" />
                Altre Ricette
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Cook Mode */}
      <CookModeOverlay
        isOpen={isCookModeOpen}
        onClose={handleCloseCookMode}
        recipe={recipe}
        currentStep={currentCookStep}
        onStepChange={setCurrentCookStep}
      />

      <BottomTabNavigation />
      <FloatingActionButton onClick={() => setIsCookModeOpen(true)} />
    </div>
  );
};

export default RecipeDetailCookMode;
