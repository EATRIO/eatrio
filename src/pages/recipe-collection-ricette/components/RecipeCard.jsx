import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

/** ================================
 *  DEBUG
 *  ================================ */
const DEBUG = true;
const dlog = (...a) => { if (DEBUG) console.log('[RecipeCard]', ...a); };

/** ================================
 *  STORAGE KEYS
 *  ================================ */
const STORAGE = {
  pantry: 'eatrio:pantry:v2',
  cart: 'eatrio:cart',
  market: 'eatrio:market', // non usato qui, ma tenuto per compatibilità
};

/** ================================
 *  ALIASES / MATCHING
 *  ================================ */
// mappa "chiave canonica" → sinonimi/alias che possiamo incontrare
const ALIASES = {
  spaghetti: ['spaghetti', 'spaghetto', 'pasta', 'pasta barilla', 'pasta di semola'],
  riso: ['riso', 'riso carnaroli', 'riso arborio'],
  farina: ['farina'],
  lievito: ['lievito', 'lievito di birra', 'lievito secco'],
  uova: ['uova', 'uovo'],
  uova_tiramisu: ['uova', 'uovo'],
  pecorino: ['pecorino'],
  parmigiano: ['parmigiano', 'parmigiano reggiano'],
  guanciale: ['guanciale'],
  pepe: ['pepe', 'pepe nero'],
  pollo: ['pollo'],
  olive: ['olive', 'olive nere', 'olive verdi'],
  pomodori: ['pomodori', 'pomodoro'],
  pomodoro: ['pomodoro', 'pomodori'],
  passata: ['passata', 'passata di pomodoro', 'passata di pomodori'],
  cipolla: ['cipolla', 'cipolle'],
  carota: ['carota', 'carote'],
  sedano: ['sedano'],
  quinoa: ['quinoa'],
  verdure: ['verdure', 'verdure di stagione', 'zucchine', 'peperoni', 'insalata'],
  vinaigrette: ['vinaigrette', 'condimento'],
  olio: ['olio', 'olio evo', 'olio extravergine', 'olio extravergine di oliva'],
  aceto: ['aceto', 'aceto di vino', 'aceto balsamico'],
  savoiardi: ['savoiardi'],
  mascarpone: ['mascarpone'],
  caffe: ['caffè', 'caffe'],
  cacao: ['cacao', 'cacao amaro'],
  lenticchie: ['lenticchie'],
  aglio: ['aglio', 'spicchio di aglio', 'spicchi di aglio'],
  alloro: ['alloro', 'foglia alloro'],
  mozzarella: ['mozzarella', 'mozzarella fior di latte', 'mozzarella di bufala'],
  basilico: ['basilico', 'mazzo di basilico', 'basilico fresco'],
  frutti_bosco: ['frutti di bosco', 'frutti_bosco', 'mirtilli', 'lamponi', 'fragole'],
  latte: ['latte'],
  yogurt: ['yogurt'],
  granola: ['granola'],
  porcini: ['porcini', 'funghi porcini', 'funghi'],
  burro: ['burro'],
  brodo: ['brodo'],
};

// utilità
const norm = (s) => (s || '').toLowerCase().trim();

const findCanonicalKeyFromName = (name) => {
  const n = norm(name);
  // 1) match via alias "includes"
  for (const [key, aliases] of Object.entries(ALIASES)) {
    if (aliases.some(a => n.includes(norm(a)))) return key;
  }
  // 2) fallback: normalizza togliendo articoli comuni
  return n
    .replace(/di\s+/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_]/gu, '');
};

const matchPantryByKey = (pantryItemName, canonicalKey) => {
  const n = norm(pantryItemName);
  const aliases = ALIASES[canonicalKey] || [canonicalKey];
  return aliases.some(a => n.includes(norm(a)));
};

/** ================================
 *  UNIT CONVERSION
 *  ================================ */
const toBase = (qty, unit) => {
  const q = Number(qty) || 0;
  const u = norm(unit);
  if (u === 'g')  return { qty: q / 1000, unit: 'kg' };
  if (u === 'kg') return { qty: q, unit: 'kg' };
  if (u === 'ml') return { qty: q / 1000, unit: 'l'  };
  if (u === 'l')  return { qty: q, unit: 'l'  };
  return { qty: q, unit: 'pz' }; // fallback
};

/** ================================
 *  PANTRY READ (v2 + fallback legacy)
 *  ================================ */
const readPantryOnce = () => {
  try {
    const v2 = JSON.parse(localStorage.getItem(STORAGE.pantry) || '[]');
    if (Array.isArray(v2) && v2.length) return v2;
    const legacyItems = JSON.parse(localStorage.getItem('eatrio:pantryItems') || '[]');
    if (Array.isArray(legacyItems) && legacyItems.length) return legacyItems;
    const legacy = JSON.parse(localStorage.getItem('eatrio:pantry') || '[]');
    return Array.isArray(legacy) ? legacy : [];
  } catch {
    return [];
  }
};

/** ================================
 *  RECIPE NORMALIZATION
 *  ================================ */
// Supporta sia recipes con {ingredient_id, name, amount, unit} sia eventuali {name, qty, unit}
const normalizeRecipeIngredients = (recipe) => {
  const src = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const out = src.map((ing) => {
    const name = ing?.name || ing?.ingredient_name || ing?.ingredient || ing?.ingredient_id || '';
    const canonical = findCanonicalKeyFromName(name);
    const qty = ing?.amount ?? ing?.qty ?? ing?.quantity ?? 0;
    const unit = norm(ing?.unit || 'pz');
    const optional = Boolean(ing?.optional);
    return { key: canonical, qty: Number(qty) || 0, unit, optional, originalName: name };
  });
  return out;
};

/** ================================
 *  MISSING CALC
 *  ================================ */
const computeMissing = (pantry, ingredients /* normalized */) => {
  const missing = [];

  ingredients.forEach(ing => {
    if (ing.optional) return;

    let available = 0;
    const baseTarget = toBase(ing.qty, ing.unit).unit;

    pantry.forEach(p => {
      if (!p?.name) return;
      if (!matchPantryByKey(p.name, ing.key)) return;
      const pb = toBase(p.quantity, p.unit);
      if (pb.unit === baseTarget) available += pb.qty;
    });

    const need = toBase(ing.qty, ing.unit).qty;
    const lack = Math.max(0, need - available);
    if (lack > 0) {
      // presentiamo nella stessa "scala" dell’input se possibile
      let qty = lack;
      let unit = baseTarget;
      if (ing.unit === 'g'  && baseTarget === 'kg') { qty = Math.round(lack * 1000); unit = 'g'; }
      if (ing.unit === 'ml' && baseTarget === 'l')  { qty = Math.round(lack * 1000); unit = 'ml'; }
      missing.push({ key: ing.key, qty, unit });
    }
  });

  return missing;
};

/** ================================
 *  UI helpers
 *  ================================ */
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

/** ================================
 *  TOAST
 *  ================================ */
const showToast = (msg) => {
  const t = document.createElement('div');
  t.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-success text-white px-4 py-2 rounded-lg shadow z-[1000]';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { try { document.body.removeChild(t); } catch {} }, 2200);
};

/** ================================
 *  COMPONENT
 *  ================================ */
const RecipeCard = ({ recipe, onFavoriteToggle, className = '' }) => {
  const navigate = useNavigate();

  // dispensa locale alla card + contatore eventi per badge LIVE
  const [pantry, setPantry] = useState(() => readPantryOnce());
  const [debugTick, setDebugTick] = useState(0);

  // evento custom + storage cross-tab
  useEffect(() => {
    const refresh = () => {
      const latest = readPantryOnce();
      dlog('pantry:updated -> reload pantry, items:', latest);
      setPantry(latest);
      setDebugTick((t) => t + 1);
    };
    const onStorage = (e) => {
      if (!e) return;
      if (
        e.key === STORAGE.pantry ||
        e.key === 'eatrio:pantry' ||
        e.key === 'eatrio:pantryItems'
      ) {
        dlog('storage event on key:', e.key, '-> reload');
        refresh();
      }
    };
    dlog('MOUNT card:', recipe?.title);
    window.addEventListener('pantry:updated', refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('pantry:updated', refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [recipe?.title]);

  const handleCardClick = () => {
    navigate('/recipe-detail-cook-mode', { state: { recipe } });
  };
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavoriteToggle?.(recipe?.id);
  };

  // ==== CALCOLI + LOG ====
  const recipeIngs = normalizeRecipeIngredients(recipe);
  dlog('recipe:', recipe?.title, 'normalized ings:', recipeIngs);

  try { dlog('localStorage pantry raw:', localStorage.getItem(STORAGE.pantry)); } catch {}
  dlog('pantry parsed:', pantry);

  const missingNow = computeMissing(pantry, recipeIngs);
  dlog('missingNow:', missingNow);

  const availabilityPct = recipeIngs.length
    ? Math.round(((recipeIngs.length - missingNow.length) / recipeIngs.length) * 100)
    : (recipe?.ingredientAvailability ?? 0);
  dlog('availabilityPct:', availabilityPct);

  // === Add to cart minimale: aggiunge SOLO i mancanti (senza prezzi) ===
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!recipeIngs.length) {
      alert('Ingredienti non specificati per questa ricetta.');
      return;
    }
    const missing = computeMissing(pantry, recipeIngs);
    if (!missing.length) {
      showToast('Hai già tutti gli ingredienti 🙂');
      return;
    }
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem(STORAGE.cart) || '[]'); } catch {}
    missing.forEach((m) => {
      const name = (ALIASES[m.key]?.[0] || m.key).replace(/_/g, ' ');
      cart.push({
        id: `${m.key}_${m.unit}_${Date.now()}`,
        name,
        quantity: m.qty,
        unit: m.unit,
        checked: false,
        fromRecipe: recipe?.title,
        dateAdded: new Date().toISOString(),
      });
    });
    try { localStorage.setItem(STORAGE.cart, JSON.stringify(cart)); } catch {}
    showToast('Ingredienti mancanti aggiunti al Carrello');
  };

  return (
    <div
      className={`bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer active:scale-98 flex flex-col ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe?.image || ''}
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

        {/* prezzo stimato se presente nel JSON */}
        {recipe?.estimatedCost != null && (
          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
            {formatPrice(recipe?.estimatedCost)}
          </div>
        )}

        {/* LIVE tick + availability */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-[10px]">
          LIVE {debugTick}
        </div>

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
          {recipe?.cookingTime != null && (
            <div className="flex items-center gap-1">
              <Icon name="Clock" size={16} color="var(--color-muted-foreground)" />
              <span className="text-muted-foreground">{recipe?.cookingTime}min</span>
            </div>
          )}
          {recipe?.difficulty != null && (
            <div className="flex items-center gap-1">
              <Icon name="ChefHat" size={16} color="var(--color-muted-foreground)" />
              <span className={getDifficultyColor(recipe?.difficulty)}>
                {getDifficultyText(recipe?.difficulty)}
              </span>
            </div>
          )}
          {recipe?.servings != null && (
            <div className="flex items-center gap-1">
              <Icon name="Users" size={16} color="var(--color-muted-foreground)" />
              <span className="text-muted-foreground">{recipe?.servings}</span>
            </div>
          )}
        </div>

        {/* macro se presenti */}
        {(recipe?.calories || recipe?.protein || recipe?.carbs) && (
          <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
            {recipe?.calories != null && <div>{recipe?.calories} kcal</div>}
            {recipe?.protein != null && <div>Proteine: {recipe?.protein} g</div>}
            {recipe?.carbs != null && <div>Carboidrati: {recipe?.carbs} g</div>}
          </div>
        )}

        {/* confronto prezzi se presente (facoltativo) */}
        {recipe?.priceComparison && (
          <div className="mt-2 space-y-0.5">
            {[
              ['AVG',  recipe?.priceComparison?.avg],
              ['Coop', recipe?.priceComparison?.coop],
              ['Conad', recipe?.priceComparison?.conad],
              ['Esselunga', recipe?.priceComparison?.esselunga],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between text-[11px] px-2 py-0.5 rounded bg-muted/10"
              >
                <span className="uppercase text-muted-foreground">{label}</span>
                <span className="font-medium">
                  {value != null ? formatPrice(value) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

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
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            iconName="Plus"
            iconPosition="left"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
          >
            Aggiungi al Carrello
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

