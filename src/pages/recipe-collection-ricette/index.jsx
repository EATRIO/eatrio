// src/pages/recipe-collection-ricette/index.jsx
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

import { useCatalog, forceReloadCatalog } from '../../utils/catalog';

/* ===================== inline image override (condiviso con Cook Mode) ===================== */
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

/* ===================== Pantry + matcher (allineati al Cook Mode) ===================== */
const PANTRY_KEY = 'eatrio:pantry';
const loadPantry = () => {
  try { return JSON.parse(localStorage.getItem(PANTRY_KEY) || '[]'); } catch { return []; }
};

const stripAccents = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const normalizeText = (s) => {
  let x = stripAccents(String(s).toLowerCase());
  x = x
    .replace(/[\d.,]+ ?(kg|g|gr|l|ml|cl|pz|pezzi|pezzo|uova|uovo)\b/g, ' ')
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\b(qb|q\.b\.|bio|fresco|fresca|fresche|freschi|tritato|tritata|a|dadini|di|del|della|dello|dei|degli|delle|al|allo|alla|ai|agli|alle|lo|la|il|i|gli|le|con|senza|ed|e|oppure)\b/g, ' ')
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
    for (const a of list) if (norm === normalizeText(a)) return canon;
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

    const kcalInfo = kcalCatalog?.[id];
    if (kcalInfo) {
      const base = kcalInfo.unitBase || 'kg';
      const need = toBasePrice(amount, unit, base);
      if (need > 0) {
        totalKcal += need * Number(kcalInfo.kcalPerUnit || 0);
        hasAnyKcal = true;
      }
    }

    const priceInfo = priceCatalog?.[id];
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
  const [favorites, setFavorites] = useState(new Set());

  // Catalogo (da public/catalog.json + localStorage) via hook
  const { recipes, prices, nutrition, loading, error, reload } = useCatalog(true);

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

  // Rileva aggiornamenti immagini da altre pagine/tab
  const [imgBump, setImgBump] = useState(0);
  useEffect(() => {
    const onStorage = (e) => { if (!e || e.key === __IMG_KEY) setImgBump((t) => t + 1); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Inizializza preferiti
  useEffect(() => {
    const favoritesSet = new Set();
    (recipes || []).forEach((r) => { if (r?.isFavorite) favoritesSet.add(r.id); });
    setFavorites(favoritesSet);
  }, [recipes]);

  // Hotkeys: export id+title (Alt+E) e force reload da /public/data (Alt+Shift+0)
useEffect(() => {
  const handler = async (e) => {
    if (!e.altKey) return;

    // Alt + E = esporta id + titolo in clipboard
    if ((e.key || '').toLowerCase() === 'e') {
      try {
        const data = (recipes || []).map(r => ({ id: r.id, title: r.title ?? '' }));
        const json = JSON.stringify(data, null, 2);
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(json);
          alert(`Esportate ${data.length} ricette (id + title) negli appunti.`);
        } else {
          window.prompt('Copia questo JSON:', json);
        }
      } catch {
        alert('Export fallito.');
      }
      return;
    }

    // Alt + Shift + 0 = forza reload dei JSON da /public/data
    if (e.shiftKey && (e.key === '0')) {
      try {
        await forceReloadCatalog(); // <-- importato da ../../utils/catalog
        await reload();             // <-- già esposto dall'hook useCatalog
        alert('Catalogo ricaricato dal file pubblico.');
      } catch {
        alert('Reload fallito.');
      }
    }
  };

  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [recipes, reload]);


  // Calcolo disponibilità + meta costo/kcal
  const priceCatalog = prices;     // dal hook
  const kcalCatalog  = nutrition;  // dal hook

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
        if (!recipe.title?.toLowerCase()?.includes(q) && !recipe.description?.toLowerCase()?.includes(q)) {
          return false;
        }
      }
      if (activeFilters?.quick && (recipe?.cookingTime || 0) > 30) return false;
      if (activeFilters?.easy && (recipe?.difficulty || 0) > 1) return false;
      if (activeFilters?.available && (recipe?.ingredientAvailability || 0) < 80) return false;
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
          // se l'id non è numerico, l’ordinamento per newest ha poco senso ma manteniamo compatibilità
          return String(b.id || '').localeCompare(String(a.id || ''));
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
  }, [filteredAndSortedRecipes, imgBump]);

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

  /* ====== loading / error states (DENTRO al componente) ====== */
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
            Errore nel caricare il catalogo.{' '}
            <button onClick={reload} className="underline">Riprova</button>
          </div>
        </main>
        <BottomTabNavigation />
      </div>
    );
  }

  /* ====== UI principale ====== */
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
            (Tip admin: <kbd>Alt</kbd>+<kbd>E</kbd> esporta id+titolo • <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>0</kbd> forza reload catalogo)
          </p>
        </div>

        {/* Fallback quando è tutto vuoto: bottone "Ricarica dal catalogo" */}
        {filteredAndSortedRecipes.length === 0 && (
          <div className="px-4 pb-6">
            <div className="border border-dashed border-border rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Non trovo ricette su questo dispositivo.
              </p>
              <button
                className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-border hover:bg-muted/30"
                onClick={reload}
              >
                Ricarica dal catalogo
              </button>
            </div>
          </div>
        )}

        <div className="px-4">
          <RecipeGrid
            recipes={recipesForGrid}
            onFavoriteToggle={handleFavoriteToggle}
            loading={false}
          />
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

export default RecipeCollection;

