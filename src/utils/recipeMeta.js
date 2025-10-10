// src/utils/recipeMeta.js
// Funzioni per costo (€) e calorie (kcal) da singoli ingredienti.

export const euro = (n) =>
  Number(n || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function toBaseForUnit(amount, fromUnit, base) {
  const u = String(fromUnit || '').toLowerCase();
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
}

export function computeRecipeMeta(recipe, priceCatalog = {}, kcalCatalog = {}) {
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
      const need = toBaseForUnit(amount, unit, base);
      if (need > 0) {
        totalKcal += need * Number(kcalInfo.kcalPerUnit || 0);
        hasAnyKcal = true;
      }
    }

    const priceInfo = priceCatalog[id];
    if (priceInfo) {
      const base = priceInfo.unitBase || 'kg';
      const need = toBaseForUnit(amount, unit, base);
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
}
