import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCatalog } from '../../utils/catalog';

import { ensureCatalogLoaded, loadCatalogFromLocal, CATALOG_KEYS as CK } from '../../lib/catalogLoader';

import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';

import SearchHeader from './components/SearchHeader';
import FilterChips from './components/FilterChips';
import SortOptions from './components/SortOptions';
import AdvancedFilters from './components/AdvancedFilters';
import RecipeGrid from './components/RecipeGrid';

// inline image map (stessa chiave usata in cook mode)
const __IMG_KEY = 'eatrio:recipeImages';
const __strip = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const __rKey = (t) =>
  __strip(String(t || ''))
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const __getImg = (title, fallback) => {
  try {
    const map = JSON.parse(localStorage.getItem(__IMG_KEY) || '{}');
    return map[__rKey(title)] || fallback || '';
  } catch {
    return fallback || '';
  }
};
const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=900&fit=crop';

/* ===================== EMBEDDED DATA (usati se non c'è nulla in localStorage) ===================== */
const EMBEDDED_INGREDIENTS = [
  { id: 'ing_pollo', name: 'Pollo', default_unit: 'kg', aliases: ['petto di pollo', 'cosce di pollo', 'fusi di pollo'] },
  { id: 'ing_cipolla', name: 'Cipolla', default_unit: 'pz', aliases: ['cipolle', 'cipollotto'] },
  { id: 'ing_passata', name: 'Passata di pomodoro', default_unit: 'g', aliases: ['passata', 'salsa di pomodoro', 'polpa di pomodoro', 'pomodori pelati'] },
  { id: 'ing_olive', name: 'Olive', default_unit: 'g', aliases: ['olive verdi', 'olive nere', 'olive denocciolate'] },
  { id: 'ing_olio_evo', name: 'Olio extravergine di oliva', default_unit: 'ml', aliases: ['olio evo', 'olio di oliva', 'extravergine'] },
  { id: 'ing_alloro', name: 'Alloro', default_unit: 'pz', aliases: ['foglie di alloro'] },
  { id: 'ing_riso_carnaroli', name: 'Riso Carnaroli', default_unit: 'g', aliases: ['riso', 'arborio', 'vialone nano'] },
  { id: 'ing_funghi_porcini', name: 'Funghi Porcini', default_unit: 'g', aliases: ['porcini', 'funghi'] },
  { id: 'ing_brodo_veg', name: 'Brodo vegetale', default_unit: 'ml', aliases: ['brodo'] },
  { id: 'ing_burro', name: 'Burro', default_unit: 'g', aliases: [] },
  { id: 'ing_parmigiano', name: 'Parmigiano', default_unit: 'g', aliases: ['parmigiano reggiano', 'grana padano', 'grana'] },
  { id: 'ing_vino_bianco', name: 'Vino bianco', default_unit: 'ml', aliases: [] },
  { id: 'ing_spaghetti', name: 'Spaghetti', default_unit: 'g', aliases: ['pasta lunga'] },
  { id: 'ing_guanciale', name: 'Guanciale', default_unit: 'g', aliases: [] },
  { id: 'ing_uova', name: 'Uova', default_unit: 'pz', aliases: ['uovo'] },
  { id: 'ing_pecorino', name: 'Pecorino Romano', default_unit: 'g', aliases: ['pecorino'] },
  { id: 'ing_pepe', name: 'Pepe nero', default_unit: 'g', aliases: ['pepe'] },
  { id: 'ing_pasta', name: 'Pasta', default_unit: 'g', aliases: ['penne', 'fusilli', 'rigatoni'] },
  { id: 'ing_pomodoro', name: 'Pomodoro', default_unit: 'g', aliases: ['polpa di pomodoro', 'pelati'] },
  { id: 'ing_sale', name: 'Sale', default_unit: 'g', aliases: [] },
  { id: 'ing_farina00', name: 'Farina 00', default_unit: 'g', aliases: ['farina'] },
  { id: 'ing_zucchero', name: 'Zucchero', default_unit: 'g', aliases: [] },
  { id: 'ing_lievito_dolci', name: 'Lievito per dolci', default_unit: 'g', aliases: ['baking powder'] },
  { id: 'ing_basilico', name: 'Basilico', default_unit: 'pz', aliases: ['foglie di basilico'] },
  { id: 'ing_mozzarella', name: 'Mozzarella', default_unit: 'g', aliases: ['mozzarella fiordilatte'] },
  { id: 'ing_quinoa', name: 'Quinoa', default_unit: 'g', aliases: [] },
  { id: 'ing_verdure_miste', name: 'Verdure miste', default_unit: 'g', aliases: ['verdure di stagione', 'ortaggi misti'] },
  { id: 'ing_savoiardi', name: 'Savoiardi', default_unit: 'g', aliases: [] },
  { id: 'ing_mascarpone', name: 'Mascarpone', default_unit: 'g', aliases: [] },
  { id: 'ing_caffe', name: 'Caffè', default_unit: 'ml', aliases: ['espresso', 'caffè espresso'] },
  { id: 'ing_cacao', name: 'Cacao amaro', default_unit: 'g', aliases: ['cacao'] },
  { id: 'ing_lenticchie', name: 'Lenticchie secche', default_unit: 'g', aliases: ['lenticchie'] },
  { id: 'ing_carota', name: 'Carota', default_unit: 'pz', aliases: ['carote'] },
  { id: 'ing_sedano', name: 'Sedano', default_unit: 'pz', aliases: [] },
  { id: 'ing_banana', name: 'Banana', default_unit: 'pz', aliases: [] },
  { id: 'ing_frutti_bosco', name: 'Frutti di bosco', default_unit: 'g', aliases: [] },
  { id: 'ing_granola', name: 'Granola', default_unit: 'g', aliases: [] },
];

const EMBEDDED_RECIPES = [/* ... come prima, invariato ... */];

/* ===================== Catalog loader (solo dentro questo file) ===================== */
const CATALOG_KEYS = {
  ingredients: 'eatrio:catalog:ingredients',
  recipes: 'eatrio:catalog:recipes',
  ingredientPrices: 'eatrio:catalog:ingredientPrices',
  ingredientNutrition: 'eatrio:catalog:ingredientNutrition',
};

// Legge da localStorage; se vuoto inizializza con gli embedded
function loadCatalog() {
  let ingredients = [];
  let recipes = [];
  try {
    const i = JSON.parse(localStorage.getItem(CATALOG_KEYS.ingredients) || 'null');
    const r = JSON.parse(localStorage.getItem(CATALOG_KEYS.recipes) || 'null');
    ingredients = Array.isArray(i) && i.length ? i : EMBEDDED_INGREDIENTS;
    recipes = Array.isArray(r) && r.length ? r : EMBEDDED_RECIPES;
    if (!i) localStorage.setItem(CATALOG_KEYS.ingredients, JSON.stringify(ingredients));
    if (!r) localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(recipes));
  } catch {
    ingredients = EMBEDDED_INGREDIENTS;
    recipes = EMBEDDED_RECIPES;
  }
  return { ingredients, recipes };
}
const loadIngredientPrices = () => {
  try { return JSON.parse(localStorage.getItem(CATALOG_KEYS.ingredientPrices) || '{}'); }
  catch { return {}; }
};
const loadIngredientNutrition = () => {
  try { return JSON.parse(localStorage.getItem(CATALOG_KEYS.ingredientNutrition) || '{}'); }
  catch { return {}; }
};

/* ========= NEW: seed forzato + scorciatoia reset ========= */
function seedCatalogHard(setCatalog) {
  try {
    localStorage.setItem(CATALOG_KEYS.ingredients, JSON.stringify(EMBEDDED_INGREDIENTS));
    localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(EMBEDDED_RECIPES));
  } catch {}
  setCatalog({ ingredients: EMBEDDED_INGREDIENTS, recipes: EMBEDDED_RECIPES });
}

function useEmergencyResetShortcut(setCatalog) {
  useEffect(() => {
    const onKey = (e) => {
      if (!e.altKey || !e.shiftKey) return;
      if ((e.key || '').toLowerCase() !== '0') return;
      try {
        localStorage.removeItem(CATALOG_KEYS.ingredients);
        localStorage.removeItem(CATALOG_KEYS.recipes);
      } catch {}
      seedCatalogHard(setCatalog);
      alert('Catalogo resettato e ricaricato (embedded).');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCatalog]);
}

// Hotkey: Alt+I / Alt+R / Alt+U / Alt+A / Alt+E
function useAdminImportShortcuts(setIngredients, setRecipes) {
  useEffect(() => {
    const handler = async(e) => {
      if (!e.altKey) return;

      if (e.key.toLowerCase() === 'e') {
        try {
          const rec = JSON.parse(localStorage.getItem(CATALOG_KEYS.recipes) || '[]');
          const data = rec.map(r => ({ id: r.id, title: r.title ?? '' }));
          const json = JSON.stringify(data, null, 2);
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(json);
            alert(`Esportate ${data.length} ricette (id + title) negli appunti.\nIncolla qui in chat e ti genero gli step.`);
          } else {
            window.prompt('Copia questo JSON e incollalo qui in chat:', json);
          }
        } catch {
          alert('Export fallito: non riesco a leggere il catalogo.');
        }
        return;
      }

      if (e.key.toLowerCase() === 'a') {
        const txt = window.prompt('Incolla JSON ALL-IN-ONE ({recipes, ingredients} o array di ricette):');
        if (!txt) return;
        try {
          const parsed = JSON.parse(txt);
          if (Array.isArray(parsed)) {
            localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(parsed));
            setRecipes(parsed);
          } else if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.ingredients)) {
              localStorage.setItem(CATALOG_KEYS.ingredients, JSON.stringify(parsed.ingredients));
              setIngredients(parsed.ingredients);
            }
            if (Array.isArray(parsed.recipes)) {
              localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(parsed.recipes));
              setRecipes(parsed.recipes);
            }
          }
          alert('Catalogo aggiornato (import all-in-one).');
        } catch {
          alert('JSON non valido');
        }
        return;
      }

      if (e.key.toLowerCase() === 'i') {
        const txt = window.prompt('Incolla JSON ingredients (array):');
        if (!txt) return;
        try {
          const parsed = JSON.parse(txt);
          localStorage.setItem(CATALOG_KEYS.ingredients, JSON.stringify(parsed));
          setIngredients(parsed);
          alert('Ingredients aggiornati');
        } catch {
          alert('JSON non valido');
        }
        return;
      }

      if (e.key.toLowerCase() === 'r') {
        const txt = window.prompt('Incolla JSON recipes (array):');
        if (!txt) return;
        try {
          const parsed = JSON.parse(txt);
          localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(parsed));
          setRecipes(parsed);
          alert('Recipes aggiornate');
        } catch {
          alert('JSON non valido');
        }
        return;
      }

      if (e.key.toLowerCase() === 'u') {
        const txt = window.prompt('Incolla PATCH ricette (oggetto o array):');
        if (!txt) return;
        try {
          const patch = JSON.parse(txt);
          const patches = Array.isArray(patch) ? patch : [patch];
          const curr = JSON.parse(localStorage.getItem(CATALOG_KEYS.recipes) || '[]');
          const next = curr.map((r) => {
            const p = patches.find((x) => x.id === r.id);
            return p ? { ...r, ...p } : r;
          });
          localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(next));
          setRecipes(next);
          alert('Ricette aggiornate (patch applicata).');
        } catch {
          alert('JSON non valido');
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setIngredients, setRecipes]);
}

/* ===================== Pantry + matcher (allineati al Cook Mode) ===================== */
const PANTRY_KEY = 'eatrio:pantry';
const loadPantry = () => {
  try {
    const raw = localStorage.getItem(PANTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const stripAccents = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const normalizeText = (s) => {
  let x = stripAccents(String(s).toLowerCase());
  x = x
    .replace(/[\d.,]+ ?(kg|g|gr|l|ml|cl|pz|pezzi|pezzo|uova|uovo)\b/g, ' ')
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(
      /\b(qb|q\.b\.|bio|fresco|fresca|fresche|freschi|tritato|tritata|a|dadini|di|del|della|dello|dei|degli|delle|al|allo|alla|ai|agli|alle|lo|la|il|i|gli|le|con|senza|ed|e|oppure)\b/g,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = x.split(' ').filter(Boolean).map((t) => {
    if (t === 'uova') return 'uovo';
    if (t === 'cipolle') return 'cipolla';
    if (t.endsWith('e') && t.length > 3) return t.slice(0, -1);
    if (t.endsWith('i') && t.length > 3) return t.slice(0, -1) + 'o';
    return t;
  });
  return tokens.join(' ');
};

const ALIASES = {
  'olio extravergine di oliva': ['olio evo', "olio extravergine d oliva", 'extravergine', 'olio di oliva'],
  'passata di pomodoro': ['passata', 'salsa di pomodoro', 'polpa di pomodoro', 'pomodoro passato', 'pomodori pelati'],
  'pomodori pelati': ['pelati', 'pomodori in scatola'],
  parmigiano: ['parmigiano reggiano', 'grana padano', 'grana'],
  'funghi porcini': ['porcini'],
  funghi: ['champignon', 'funghi porcini', 'porcini'],
  riso: ['riso carnaroli', 'arborio', 'vialone nano'],
  cipolla: ['cipolle', 'cipollotto'],
  pollo: ['petto di pollo', 'cosce di pollo', 'fusi di pollo'],
};

const canonicalFromNormalized = (norm) => {
  for (const [canon, list] of Object.entries(ALIASES)) {
    const c = normalizeText(canon);
    if (norm === c) return canon;
    for (const a of list) {
      if (norm === normalizeText(a)) return canon;
    }
  }
  return norm;
};

const tokenSetScore = (a, b) => {
  const A = new Set(a.split(' ').filter(Boolean));
  const B = new Set(b.split(' ').filter(Boolean));
  if (!A.size || !B.size) return 0;
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / Math.max(A.size, B.size);
};

const nameMatches = (pantryName, ingName) => {
  const p = normalizeText(pantryName);
  const n = normalizeText(ingName);
  const canon = normalizeText(canonicalFromNormalized(n));
  if (p === canon) return true;

  for (const [canonName, list] of Object.entries(ALIASES)) {
    const canonN = normalizeText(canonName);
    const aliases = list.map(normalizeText);
    if (canon === canonN || aliases.includes(canon)) {
      if (p === canonN || aliases.includes(p)) return true;
    }
  }
  return tokenSetScore(p, canon) >= 0.5;
};

const toSameUnit = (qty, fromU, toU) => {
  const map = {
    g: { base: 'g', factor: 1 },
    gr: { base: 'g', factor: 1 },
    kg: { base: 'g', factor: 1000 },
    ml: { base: 'ml', factor: 1 },
    cl: { base: 'ml', factor: 10 },
    l: { base: 'ml', factor: 1000 },
    pz: { base: 'pz', factor: 1 },
    pezzo: { base: 'pz', factor: 1 },
    pezzi: { base: 'pz', factor: 1 },
    uovo: { base: 'pz', factor: 1 },
    uova: { base: 'pz', factor: 1 },
  };
  const norm = (u) => (u || '').toLowerCase();
  const f = map[norm(fromU)] || null;
  const t = map[norm(toU)] || null;
  const q = Number(qty || 0);
  if (!f || !t) return q;
  if (f.base === t.base) {
    const toBase = q * f.factor;
    return toBase / t.factor;
  }
  return q;
};

const checkPantryFor = (pantry, name, needQty, needUnit) => {
  const need = Number(needQty);
  const safeNeed = Number.isFinite(need) && need > 0 ? need : 1;
  const unit = needUnit || 'pz';

  let haveQty = 0;
  for (const p of pantry) {
    if (nameMatches(p?.name, name)) {
      haveQty += toSameUnit(Number(p?.quantity || 0), p?.unit, unit);
    }
  }
  const missing = Math.max(0, safeNeed - haveQty);
  return {
    availableQty: haveQty,
    missingQty: missing,
    coverage: Math.max(0, Math.min(1, haveQty / safeNeed)),
  };
};

const computeAvailabilityPercent = (recipe, pantry) => {
  const ings = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  if (!ings.length) return 0;
  let sum = 0;
  for (const ing of ings) {
    const needQty = Number(ing.amount) > 0 ? Number(ing.amount) : 1;
    const unit = ing.unit || 'pz';
    const { coverage } = checkPantryFor(pantry, ing.name || ing.ingredient_id || '', needQty, unit);
    sum += Math.max(0, Math.min(1, coverage));
  }
  return Math.max(0, Math.min(100, Math.round((sum / ings.length) * 100)));
};

/* ===================== Meta calcolata (costo/kcal) ===================== */
const euro = (n) =>
  Number(n || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const toBasePrice = (amount, fromUnit, base) => {
  const u = (fromUnit || '').toLowerCase();
  const qty = Number(amount || 0);
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  if (base === 'kg') {
    if (u === 'kg') return qty;
    if (u === 'g' || u === 'gr') return qty / 1000;
    return 0;
  }
  if (base === 'l') {
    if (u === 'l') return qty;
    if (u === 'ml') return qty / 1000;
    if (u === 'cl') return qty / 100;
    return 0;
  }
  if (base === 'pz') {
    if (['pz', 'uovo', 'uova', 'pezzo', 'pezzi'].includes(u)) return qty;
    return 0;
  }
  return 0;
};

const computeRecipeMeta = (recipe, priceCatalog, kcalCatalog) => {
  const ings = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const servings = Number(recipe?.servings) || 4;

  let totalKcal = 0;
  let hasAnyKcal = false;
  const cost = { coop: 0, conad: 0, esselunga: 0 };
  const hasPrice = { coop: false, conad: false, esselunga: false };

  for (const ing of ings) {
    const id = ing.ingredient_id || ing.ingredientId;
    const amount = Number(ing.amount || 0);
    const unit = ing.unit || 'pz';
    if (!id) continue;

    const kcalInfo = kcalCatalog[id];
    if (kcalInfo) {
      const base = kcalInfo.unitBase || 'kg';
      const need = toBasePrice(amount, unit, base);
      if (need > 0) {
        totalKcal += need * Number(kcalInfo.kcalPerUnit || 0);
        hasAnyKcal = true;
      }
    }

    const priceInfo = priceCatalog[id];
    if (priceInfo) {
      const base = priceInfo.unitBase || 'kg';
      const need = toBasePrice(amount, unit, base);
      if (need > 0) {
        const r = priceInfo.retailers || {};
        for (const shop of ['coop', 'conad', 'esselunga']) {
          const unitPrice = r[shop] ?? priceInfo.avg ?? null;
          if (unitPrice != null) {
            cost[shop] += need * Number(unitPrice);
            hasPrice[shop] = true;
          }
        }
      }
    }
  }

  const shops = Object.keys(hasPrice).filter((k) => hasPrice[k]);
  const avgTotal = shops.length
    ? Math.round((shops.reduce((s, k) => s + cost[k], 0) / shops.length) * 100) / 100
    : (recipe?.costData && Number(recipe.costData.average)) ?? Number(recipe?.estimatedCost) ?? null;

  const kcalTotal = hasAnyKcal
    ? Math.round(totalKcal)
    : (Number(recipe?.calories) || Number(recipe?.nutrition?.calories) || null);

  const perServing = (val) => (typeof val === 'number' ? Math.round((val / servings) * 10) / 10 : null);

  return {
    servings,
    costAvgTotal: typeof avgTotal === 'number' ? avgTotal : null,
    costPerServing: perServing(avgTotal),
    kcalTotal: typeof kcalTotal === 'number' ? kcalTotal : null,
    kcalPerServing: perServing(kcalTotal),
  };
};

/* ===================== COMPONENTE PAGINA ===================== */
const RecipeCollection = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Catalogo embedded o localStorage
  const { ingredients, recipes, prices, nutrition, loading, error, reload } = useCatalog(true);


  // 🔧 Auto-seed all’avvio se vuoto + scorciatoia di emergenza
  useEffect(() => {
    if (!recipes || recipes.length === 0) {
      seedCatalogHard(setCatalog);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEmergencyResetShortcut(setCatalog);

  // Hotkey admin per importare/esportare
  useAdminImportShortcuts(
    (ing) => setCatalog((prev) => ({ ...prev, ingredients: ing })),
    (rec) => setCatalog((prev) => ({ ...prev, recipes: rec }))
  );

  // Snapshot dispensa con auto-refresh
  const [pantry, setPantry] = useState(() => loadPantry());
  useEffect(() => {
    const refresh = () => setPantry(loadPantry());
    const onStorage = (e) => { if (!e || e.key === PANTRY_KEY) refresh(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('storage', onStorage);
    const t = setTimeout(refresh, 50);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('storage', onStorage);
      clearTimeout(t);
    };
  }, []);

  // Rileva aggiornamenti da altre pagine/tab (immagini + cataloghi + meta)
  const [bump, setBump] = useState(0);
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if ([
        __IMG_KEY,
        CATALOG_KEYS.recipes,
        CATALOG_KEYS.ingredients,
        CATALOG_KEYS.ingredientPrices,
        CATALOG_KEYS.ingredientNutrition,
      ].includes(e.key)) {
        setBump((t) => t + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Inizializza preferiti
  useEffect(() => {
    const favoritesSet = new Set();
    (recipes || []).forEach((r) => { if (r?.isFavorite) favoritesSet.add(r.id); });
    setFavorites(favoritesSet);
  }, [recipes]);

  // Carica/aggiorna il catalogo dai JSON pubblici all’avvio
useEffect(() => {
  let mounted = true;
  (async () => {
    const fromRemote = await ensureCatalogLoaded(false); // scarica se necessario
    if (!mounted) return;
    setCatalog(prev => ({
      ...prev,
      ingredients: fromRemote.ingredients || prev.ingredients || [],
      recipes: fromRemote.recipes || prev.recipes || [],
    }));
  })();

  // Se un'altra tab aggiorna i cataloghi, ci sincronizziamo
  const onStorage = (e) => {
    if (!e) return;
    if ([CK.ingredients, CK.recipes, CK.ingredientPrices, CK.ingredientNutrition].includes(e.key)) {
      const latest = loadCatalogFromLocal();
      setCatalog(prev => ({ ...prev, ingredients: latest.ingredients, recipes: latest.recipes }));
    }
  };
  window.addEventListener('storage', onStorage);

  return () => { mounted = false; window.removeEventListener('storage', onStorage); };
}, []);


  // Calcolo disponibilità + meta costo/kcal

  const priceCatalog = prices;       // viene dall’hook
  const kcalCatalog  = nutrition;    // viene dall’hook

  const priceCatalog = useMemo(() => loadIngredientPrices(), [bump]);
  const kcalCatalog  = useMemo(() => loadIngredientNutrition(), [bump]);

  const recipesWithMeta = useMemo(() => {
    return (recipes || []).map((r) => {
      const ingredientAvailability = computeAvailabilityPercent(r, pantry);
      const _meta = computeRecipeMeta(r, priceCatalog, kcalCatalog);
      return { ...r, ingredientAvailability, _meta };
    });
  }, [recipes, pantry, priceCatalog, kcalCatalog]);

  // Filtri + Sort (usano i meta calcolati)
  const getCostForSort = (r) =>
    (r?._meta?.costPerServing ?? r?._meta?.costAvgTotal ?? r?.estimatedCost ?? Number.POSITIVE_INFINITY);
  const getKcalForFilter = (r) =>
    (r?._meta?.kcalPerServing ?? r?.calories ?? r?.nutrition?.calories ?? Number.POSITIVE_INFINITY);

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipesWithMeta.filter((recipe) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !recipe.title?.toLowerCase()?.includes(q) &&
          !recipe.description?.toLowerCase()?.includes(q)
        ) return false;
      }
      if (activeFilters?.quick && recipe?.cookingTime > 30) return false;
      if (activeFilters?.easy && recipe?.difficulty > 1) return false;
      if (activeFilters?.available && recipe?.ingredientAvailability < 80) return false;
      if (activeFilters?.favorites && !favorites?.has(recipe?.id)) return false;
      if (activeFilters?.vegetarian && !recipe?.dietary?.includes('vegetarian')) return false;
      if (activeFilters?.budget) {
        const cps = getCostForSort(recipe);
        if (!Number.isFinite(cps) || cps > 3.0) return false; // ≤ €3 a porzione
      }

      if (advancedFilters?.cookingTime) {
        const { min = 0, max = 999 } = advancedFilters.cookingTime;
        if ((recipe.cookingTime || 0) < min || (recipe.cookingTime || 0) > max) return false;
      }
      if (advancedFilters?.calories) {
        const { min = 0, max = 9999 } = advancedFilters.calories;
        const kcal = getKcalForFilter(recipe);
        if (kcal < min || kcal > max) return false; // kcal per porzione
      }
      if (advancedFilters?.dietary?.length > 0) {
        const hasDiet = advancedFilters.dietary.some((d) => recipe.dietary?.includes(d));
        if (!hasDiet) return false;
      }
      if (advancedFilters?.tools?.length > 0) {
        const hasTools = advancedFilters.tools.some((t) => recipe.tools?.includes(t));
        if (!hasTools) return false;
      }
      if (advancedFilters?.mealType?.length > 0) {
        const hasMeal = advancedFilters.mealType.some((m) => recipe.mealType?.includes(m));
        if (!hasMeal) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      switch (currentSort) {
        case 'time':
          return (a.cookingTime || 0) - (b.cookingTime || 0);
        case 'cost': {
          const ac = getCostForSort(a);
          const bc = getCostForSort(b);
          return ac - bc;
        }
        case 'difficulty':
          return (a.difficulty || 0) - (b.difficulty || 0);
        case 'popularity':
          return (favorites.has(b.id) ? 1 : 0) - (favorites.has(a.id) ? 1 : 0);
        case 'newest':
          return (b.id || 0) - (a.id || 0);
        case 'relevance':
        default:
          return (b.ingredientAvailability || 0) - (a.ingredientAvailability || 0);
      }
    });

    return filtered;
  }, [recipesWithMeta, searchQuery, activeFilters, advancedFilters, currentSort, favorites]);

  // override immagine condiviso + passo i meta già calcolati
  const recipesForGrid = useMemo(() => {
    return filteredAndSortedRecipes.map((r) => ({
      ...r,
      image: __getImg(r.title, r.image || DEFAULT_COVER),
    }));
  }, [filteredAndSortedRecipes, bump]);

  const handleFavoriteToggle = (recipeId) => {
    const next = new Set(favorites);
    if (next.has(recipeId)) next.delete(recipeId);
    else next.add(recipeId);
    setFavorites(next);
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
      <HeaderWithLogo
        title="Ricette"
        motto="Pianifica. Cucina. Risparmia."
        variant="solid"
        actions={[{ icon: 'BookOpen', label: 'Ricettario', onClick: () => navigate('/user-profile-profilo') }]}
      />

      <main className="pt-16 pb-24 lg:pb-6 lg:pl-64">
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onVoiceSearch={() => handleFloatingActionClick('search-recipes')}
        />

        <div className="px-4 py-3">
          <FilterChips
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
            onShowAdvancedFilters={() => setShowAdvancedFilters(true)}
          />
        </div>

        <div className="px-4 pb-3">
          <SortOptions currentSort={currentSort} onSortChange={setCurrentSort} />
        </div>

        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground">{filteredAndSortedRecipes.length} ricette trovate</p>
          <p className="text-xs text-muted-foreground mt-1">
            (Tip admin: <kbd>Alt</kbd>+<kbd>I</kbd> importa ingredienti • <kbd>Alt</kbd>+<kbd>R</kbd> importa ricette • <kbd>Alt</kbd>+<kbd>U</kbd> patch • <kbd>Alt</kbd>+<kbd>A</kbd> all-in-one • <kbd>Alt</kbd>+<kbd>E</kbd> esporta id+titolo • <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>0</kbd> reset/seed)
          </p>
        </div>

        {/* Fallback quando è tutto vuoto: bottone "Carica ricette base" */}
        {filteredAndSortedRecipes.length === 0 && (
          <div className="px-4 pb-6">
            <div className="border border-dashed border-border rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Non trovo ricette su questo dispositivo.
              </p>
              <button
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:bg-muted/30"
                onClick={() => seedCatalogHard(setCatalog)}
              >
                Carica ricette base
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Tip (desktop): <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>0</kbd> per reset/seed forzato.
              </p>
            </div>
          </div>
        )}

        <div className="px-4">
          <RecipeGrid recipes={recipesForGrid} onFavoriteToggle={handleFavoriteToggle} loading={loading} />
        </div>
      </main>

      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onResetFilters={handleResetFilters}
        className="lg:fixed lg:right-4 lg:top-20 lg:bottom-4 lg:z-50"
      />

      <BottomTabNavigation />
      <FloatingActionButton onClick={handleFloatingActionClick} />
    </div>
  );
};

if (loading) {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWithLogo title="Ricette" />
      <main className="pt-16 pb-24 lg:pb-6 lg:pl-64">
        <div className="px-4 py-10 text-center text-muted-foreground">Carico il catalogo…</div>
      </main>
      <BottomTabNavigation />
    </div>
  );
}
if (error) {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWithLogo title="Ricette" />
      <main className="pt-16 pb-24 lg:pb-6 lg:pl-64">
        <div className="px-4 py-10 text-center text-red-500">
          Errore nel caricare il catalogo. <button onClick={reload} className="underline">Riprova</button>
        </div>
      </main>
      <BottomTabNavigation />
    </div>
  );
}


export default RecipeCollection;

