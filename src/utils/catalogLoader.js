// src/utils/catalogLoader.js
// Carica (seed) i file JSON in /public/data nel localStorage, una sola volta.
// Forza refresh: ensureCatalogLoaded({ force: true })

export const CATALOG_KEYS = {
  ingredients: 'eatrio:catalog:ingredients',
  recipes: 'eatrio:catalog:recipes',
  ingredientPrices: 'eatrio:catalog:ingredientPrices',
  ingredientNutrition: 'eatrio:catalog:ingredientNutrition',
  seededFlag: 'eatrio:catalog:_seeded_v1', // cambia _v1 se cambi i file di data
};

async function fetchJsonOrNull(url) {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Carica i JSON da /public/data nel localStorage se non già presenti.
 * Ritorna 'loaded' (appena caricati), 'cached' (già presenti), o 'partial' (caricati parzialmente).
 */
export async function ensureCatalogLoaded(opts = {}) {
  const basePath = opts.basePath || '/data';
  const force = !!opts.force;

  const alreadySeeded = localStorage.getItem(CATALOG_KEYS.seededFlag) === '1';
  if (alreadySeeded && !force) return 'cached';

  const [ingredients, recipes, prices, nutrition] = await Promise.all([
    fetchJsonOrNull(`${basePath}/ingredients.json`),
    fetchJsonOrNull(`${basePath}/recipes.json`),
    fetchJsonOrNull(`${basePath}/prices.json`),
    fetchJsonOrNull(`${basePath}/nutrition.json`),
  ]);

  let wroteSomething = false;
  let wroteAll = true;

  if (Array.isArray(ingredients) && ingredients.length) {
    localStorage.setItem(CATALOG_KEYS.ingredients, JSON.stringify(ingredients));
    wroteSomething = true;
  } else { wroteAll = false; }

  if (Array.isArray(recipes) && recipes.length) {
    localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(recipes));
    wroteSomething = true;
  } else { wroteAll = false; }

  if (prices && typeof prices === 'object') {
    localStorage.setItem(CATALOG_KEYS.ingredientPrices, JSON.stringify(prices));
    wroteSomething = true;
  } else { wroteAll = false; }

  if (nutrition && typeof nutrition === 'object') {
    localStorage.setItem(CATALOG_KEYS.ingredientNutrition, JSON.stringify(nutrition));
    wroteSomething = true;
  } else { wroteAll = false; }

  if (wroteAll) {
    localStorage.setItem(CATALOG_KEYS.seededFlag, '1');
    return 'loaded';
  }
  if (wroteSomething) return 'partial';
  return 'cached';
}

export function clearCatalog() {
  try {
    localStorage.removeItem(CATALOG_KEYS.ingredients);
    localStorage.removeItem(CATALOG_KEYS.recipes);
    localStorage.removeItem(CATALOG_KEYS.ingredientPrices);
    localStorage.removeItem(CATALOG_KEYS.ingredientNutrition);
    localStorage.removeItem(CATALOG_KEYS.seededFlag);
  } catch {}
}

export function loadCatalogFromLocalStorage() {
  let ingredients = [];
  let recipes = [];
  try {
    const i = JSON.parse(localStorage.getItem(CATALOG_KEYS.ingredients) || '[]');
    const r = JSON.parse(localStorage.getItem(CATALOG_KEYS.recipes) || '[]');
    ingredients = Array.isArray(i) ? i : [];
    recipes    = Array.isArray(r) ? r : [];
  } catch {}
  return { ingredients, recipes };
}
