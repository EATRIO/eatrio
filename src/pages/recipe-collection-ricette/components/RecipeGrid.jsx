import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

/* ==== Catalog keys (fallback se _meta non presente) ==== */
const CATALOG_KEYS = {
  ingredientPrices: 'eatrio:catalog:ingredientPrices',
  ingredientNutrition: 'eatrio:catalog:ingredientNutrition',
};

const loadIngredientPrices = () => {
  try { return JSON.parse(localStorage.getItem(CATALOG_KEYS.ingredientPrices) || '{}'); }
  catch { return {}; }
};
const loadIngredientNutrition = () => {
  try { return JSON.parse(localStorage.getItem(CATALOG_KEYS.ingredientNutrition) || '{}'); }
  catch { return {}; }
};

const euroFmt = (n) =>
  `€ ${Number(n || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const toBase = (amount, fromUnit, base) => {
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
    if (['pz','uovo','uova','pezzo','pezzi'].includes(u)) return qty;
    return 0;
  }
  return 0;
};

const computeMetaFallback = (recipe, priceCatalog, kcalCatalog) => {
  const ings = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const servings = Number(recipe?.servings) || 4;

  let totalKcal = 0, hasKcal = false;
  const cost = { coop: 0, conad: 0, esselunga: 0 }, hasPrice = { coop: false, conad: false, esselunga: false };

  for (const ing of ings) {
    const id = ing.ingredient_id || ing.ingredientId;
    const amount = Number(ing.amount || 0);
    const unit = ing.unit || 'pz';
    if (!id) continue;

    const kcalInfo = kcalCatalog[id];
    if (kcalInfo) {
      const base = kcalInfo.unitBase || 'kg';
      const need = toBase(amount, unit, base);
      if (need > 0) { totalKcal += need * Number(kcalInfo.kcalPerUnit || 0); hasKcal = true; }
    }

    const priceInfo = priceCatalog[id];
    if (priceInfo) {
      const base = priceInfo.unitBase || 'kg';
      const need = toBase(amount, unit, base);
      if (need > 0) {
        const r = priceInfo.retailers || {};
        for (const shop of ['coop', 'conad', 'esselunga']) {
          const unitPrice = r[shop] ?? priceInfo.avg ?? null;
          if (unitPrice != null) { cost[shop] += need * Number(unitPrice); hasPrice[shop] = true; }
        }
      }
    }
  }

  const shops = Object.keys(hasPrice).filter((k) => hasPrice[k]);
  const avgTotal = shops.length
    ? Math.round((shops.reduce((s, k) => s + cost[k], 0) / shops.length) * 100) / 100
    : (recipe?.costData && Number(recipe.costData.average)) ?? Number(recipe?.estimatedCost) ?? null;

  const kcalTotal = hasKcal
    ? Math.round(totalKcal)
    : (Number(recipe?.calories) || Number(recipe?.nutrition?.calories) || null);

  const perServing = (v) => (typeof v === 'number' ? Math.round((v / servings) * 10) / 10 : null);

  return {
    servings,
    costAvgTotal: typeof avgTotal === 'number' ? avgTotal : null,
    costPerServing: perServing(avgTotal),
    kcalTotal: typeof kcalTotal === 'number' ? kcalTotal : null,
    kcalPerServing: perServing(kcalTotal),
  };
};

const RecipeCard = ({ recipe, onOpen }) => {
  const time = recipe?.cookingTime || recipe?.cookTime || 0;
  const availability = Number.isFinite(recipe?.ingredientAvailability) ? recipe.ingredientAvailability : null;

  // preferisci i meta calcolati a monte; fallback locale se mancano
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === CATALOG_KEYS.ingredientPrices || e.key === CATALOG_KEYS.ingredientNutrition) {
        setTick((t) => t + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const priceCatalog = useMemo(() => loadIngredientPrices(), [tick]);
  const kcalCatalog  = useMemo(() => loadIngredientNutrition(), [tick]);

  const meta = useMemo(() => {
    if (recipe?._meta) return recipe._meta;
    return computeMetaFallback(recipe, priceCatalog, kcalCatalog);
  }, [recipe, priceCatalog, kcalCatalog]);

  const hasKcal = typeof meta?.kcalPerServing === 'number';
  const hasCost = typeof meta?.costPerServing === 'number';

  return (
    <button
      onClick={onOpen}
      className="group text-left w-full rounded-xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow"
      title={recipe?.title}
    >
      <div className="relative aspect-[4/3]">
        <img
          src={recipe?.image}
          alt={recipe?.title}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

        {/* badge minuti (sx) */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-sm">
            {time} min
          </span>
        </div>

        {/* % dispensa (dx) */}
        {Number.isFinite(availability) && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-sm">
              {availability}% dispensa
            </span>
          </div>
        )}

        {/* Titolo + sottoriga: prezzo/kcal a porzione + #porzioni */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow line-clamp-2">
            {recipe?.title}
          </h3>
          {(hasKcal || hasCost) && (
            <div className="mt-0.5 text-[11px] sm:text-xs text-white/85 drop-shadow">
              {hasCost && <span>{euroFmt(meta.costPerServing)} / porzione</span>}
              {hasCost && hasKcal && <span> • </span>}
              {hasKcal && <span>{meta.kcalPerServing} kcal / porzione</span>}
              <span> · {meta.servings} porz</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

const RecipeGrid = ({ recipes = [], onFavoriteToggle, loading }) => {
  const navigate = useNavigate();
  const open = (r) => navigate('/recipe-detail-cook-mode', { state: { recipe: r } });

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!recipes.length) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-xl">
        <Icon name="Info" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
        <p className="text-muted-foreground">Nessuna ricetta trovata.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {recipes.map((r) => (
        <RecipeCard
          key={r.id || r.title}
          recipe={r}
          onOpen={() => open(r)}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;
