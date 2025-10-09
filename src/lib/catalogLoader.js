// src/lib/catalogLoader.js
export const CATALOG_KEYS = {
  ingredients: 'eatrio:catalog:ingredients',
  recipes: 'eatrio:catalog:recipes',
  ingredientPrices: 'eatrio:catalog:ingredientPrices',
  ingredientNutrition: 'eatrio:catalog:ingredientNutrition',
  lastSync: 'eatrio:catalog:lastSync',
  source: 'eatrio:catalog:source',
};

function candidateUrls(relPath) {
  const baseUrl = (import.meta && import.meta.env && import.meta.env.BASE_URL) || '/';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const clean = (p) => p.replace(/\/+$/, '') + '/' + relPath.replace(/^\/+/, '');
  return [
    clean(baseUrl),                         // es: '/data/recipes.json' o '/app/data/recipes.json'
    clean('/' + relPath.replace(/^\/+/, '')), // '/data/recipes.json' assoluto
    origin ? clean(new URL('/', origin).pathname + relPath.replace(/^\/+/, '')) : null, // 'https://.../data/..'
  ].filter(Boolean);
}

async function fetchJson(relPath) {
  const urls = candidateUrls(relPath);
  let lastErr;
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      const ct = res.headers.get('content-type') || '';
      if (!ct.toLowerCase().includes('application/json')) {
        // probabilmente ha ricevuto index.html
        throw new Error(`Not JSON (${ct}) from ${url}`);
      }
      return await res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`Failed to fetch ${relPath}`);
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

// Fallback embedded minimalissimo (evita schermata vuota su device vergine)
const EMBED_FALLBACK = {
  recipes: [
    { id: 'rec_demo_fallback', title: 'Demo: Spaghetti al Pomodoro', servings: 2, ingredients: [
      { ingredient_id: 'ing_spaghetti', name: 'Spaghetti', amount: 160, unit: 'g' },
      { ingredient_id: 'ing_pomodoro', name: 'Pomodoro', amount: 200, unit: 'g' },
      { ingredient_id: 'ing_olio_evo', name: 'Olio extravergine di oliva', amount: 10, unit: 'ml' },
      { ingredient_id: 'ing_sale', name: 'Sale', amount: 5, unit: 'g' },
    ]},
  ],
  ingredients: [],
  prices: {},
  nutrition: {},
};

/**
 * Scarica i JSON da /public/data e li mette in localStorage.
 * Se sono già presenti e non forzi, non fa nulla.
 * Ritorna sempre lo stato effettivo in localStorage dopo il tentativo.
 */
export async function ensureCatalogLoaded(forceRefresh = false) {
  const current = loadCatalogFromLocal();
  const hasRecipes = Array.isArray(current.recipes) && current.recipes.length > 0;
  if (hasRecipes && !forceRefresh) return current;

  try {
    const [ingredients, recipes, prices, nutrition] = await Promise.all([
      fetchJson('data/ingredients.json'),
      fetchJson('data/recipes.json'),
      fetchJson('data/prices.json'),
      fetchJson('data/nutrition.json'),
    ]);

    localStorage.setItem(CATALOG_KEYS.ingredients, JSON.stringify(ingredients || []));
    localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(recipes || []));
    localStorage.setItem(CATALOG_KEYS.ingredientPrices, JSON.stringify(prices || {}));
    localStorage.setItem(CATALOG_KEYS.ingredientNutrition, JSON.stringify(nutrition || {}));
    localStorage.setItem(CATALOG_KEYS.source, 'remote-json');
    localStorage.setItem(CATALOG_KEYS.lastSync, new Date().toISOString());

    return { ingredients, recipes, prices, nutrition };
  } catch (e) {
    console.warn('Catalog load failed:', e?.message);
    // Se proprio tutto fallisce, carica un fallback minimale per non lasciare lo schermo vuoto
    if (!hasRecipes) {
      localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(EMBED_FALLBACK.recipes));
      localStorage.setItem(CATALOG_KEYS.ingredients, JSON.stringify(EMBED_FALLBACK.ingredients));
      localStorage.setItem(CATALOG_KEYS.ingredientPrices, JSON.stringify(EMBED_FALLBACK.prices));
      localStorage.setItem(CATALOG_KEYS.ingredientNutrition, JSON.stringify(EMBED_FALLBACK.nutrition));
      localStorage.setItem(CATALOG_KEYS.source, 'fallback-embedded');
      localStorage.setItem(CATALOG_KEYS.lastSync, new Date().toISOString());
    }
    return loadCatalogFromLocal();
  }
}
