// src/lib/catalogLoader.js
export const CATALOG_KEYS = {
  ingredients: 'eatrio:catalog:ingredients',
  recipes: 'eatrio:catalog:recipes',
  ingredientPrices: 'eatrio:catalog:ingredientPrices',
  ingredientNutrition: 'eatrio:catalog:ingredientNutrition',
  lastSync: 'eatrio:catalog:lastSync',
  source: 'eatrio:catalog:source',
};

async function fetchJson(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}

export function loadCatalogFromLocal() {
  const safe = (k, fall) => {
    try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v ?? fall; }
    catch { return fall; }
  };
  return {
    ingredients: safe(CATALOG_KEYS.ingredients, []),
    recipes: safe(CATALOG_KEYS.recipes, []),
    prices: safe(CATALOG_KEYS.ingredientPrices, {}),
    nutrition: safe(CATALOG_KEYS.ingredientNutrition, {}),
  };
}

/**
 * Scarica i JSON da /public/data e li mette in localStorage.
 * Se sono già presenti e non forzi, non fa nulla.
 */
export async function ensureCatalogLoaded(forceRefresh = false) {
  const current = loadCatalogFromLocal();
  const hasRecipes = Array.isArray(current.recipes) && current.recipes.length > 0;

  if (hasRecipes && !forceRefresh) return current;

  try {
    const [ingredients, recipes, prices, nutrition] = await Promise.all([
      fetchJson('/data/ingredients.json'),
      fetchJson('/data/recipes.json'),
      fetchJson('/data/prices.json'),
      fetchJson('/data/nutrition.json'),
    ]);

    localStorage.setItem(CATALOG_KEYS.ingredients, JSON.stringify(ingredients || []));
    localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(recipes || []));
    localStorage.setItem(CATALOG_KEYS.ingredientPrices, JSON.stringify(prices || {}));
    localStorage.setItem(CATALOG_KEYS.ingredientNutrition, JSON.stringify(nutrition || {}));
    localStorage.setItem(CATALOG_KEYS.source, 'remote-json');
    localStorage.setItem(CATALOG_KEYS.lastSync, new Date().toISOString());

    return { ingredients, recipes, prices, nutrition };
  } catch (e) {
    // fallback: usa quello che c'è già (se c’è)
    return current;
  }
}
