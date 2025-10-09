// src/utils/catalog.js
// Carica il catalogo da /public/data/*.json, lo salva in localStorage e lo espone
// come funzioni + hook React. Semplice e "a prova di device".

import { useEffect, useMemo, useState } from 'react';

export const CATALOG_KEYS = {
  ingredients: 'eatrio:catalog:ingredients',
  recipes: 'eatrio:catalog:recipes',
  prices: 'eatrio:catalog:ingredientPrices',
  nutrition: 'eatrio:catalog:ingredientNutrition',
  version: 'eatrio:catalog:version', // bumpa questo per forzare reload
};

const DATA_URLS = {
  ingredients: '/data/ingredients.json',
  recipes: '/data/recipes.json',
  prices: '/data/prices.json',
  nutrition: '/data/nutrition.json',
};

function safeParse(jsonStr, fallback) {
  try { return JSON.parse(jsonStr); } catch { return fallback; }
}

export function readCatalogFromLocal() {
  return {
    ingredients: safeParse(localStorage.getItem(CATALOG_KEYS.ingredients), []),
    recipes: safeParse(localStorage.getItem(CATALOG_KEYS.recipes), []),
    prices: safeParse(localStorage.getItem(CATALOG_KEYS.prices), {}),
    nutrition: safeParse(localStorage.getItem(CATALOG_KEYS.nutrition), {}),
    version: localStorage.getItem(CATALOG_KEYS.version) || null,
  };
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

export async function loadCatalogFromPublic() {
  // scarica in parallelo
  const [ingredients, recipes, prices, nutrition] = await Promise.all([
    fetchJSON(DATA_URLS.ingredients),
    fetchJSON(DATA_URLS.recipes),
    fetchJSON(DATA_URLS.prices),
    fetchJSON(DATA_URLS.nutrition),
  ]);

  // salva in localStorage (tutti i device avranno gli stessi URL)
  localStorage.setItem(CATALOG_KEYS.ingredients, JSON.stringify(ingredients || []));
  localStorage.setItem(CATALOG_KEYS.recipes, JSON.stringify(recipes || []));
  localStorage.setItem(CATALOG_KEYS.prices, JSON.stringify(prices || {}));
  localStorage.setItem(CATALOG_KEYS.nutrition, JSON.stringify(nutrition || {}));
  localStorage.setItem(CATALOG_KEYS.version, String(Date.now()));

  // notifica eventuali altre tab
  try {
    window.dispatchEvent(new StorageEvent('storage', { key: CATALOG_KEYS.version, newValue: String(Date.now()) }));
  } catch {}
  return { ingredients, recipes, prices, nutrition };
}

/** Carica SOLO se mancano i dati in localStorage */
export async function ensureCatalogLoaded() {
  const now = readCatalogFromLocal();
  const hasRecipes = Array.isArray(now.recipes) && now.recipes.length > 0;
  const hasIngredients = Array.isArray(now.ingredients) && now.ingredients.length > 0;
  if (hasRecipes && hasIngredients) return now;
  return loadCatalogFromPublic();
}

/** Forza ricarica manuale (ad es. bottone "Aggiorna catalogo") */
export async function forceReloadCatalog() {
  return loadCatalogFromPublic();
}

/** Hook comodo per React: legge catalogo e (se serve) lo carica */
export function useCatalog(autoLoad = true) {
  const [state, setState] = useState(() => readCatalogFromLocal());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // carico al primo giro se manca qualcosa
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!autoLoad) return;
      const needs =
        !Array.isArray(state.recipes) || state.recipes.length === 0 ||
        !Array.isArray(state.ingredients) || state.ingredients.length === 0;
      if (!needs) return;
      try {
        setLoading(true);
        await ensureCatalogLoaded();
        if (!alive) return;
        setState(readCatalogFromLocal());
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo mount

  // se qualche altra tab ricarica il catalogo, ci aggiorniamo
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === CATALOG_KEYS.version ||
          e.key === CATALOG_KEYS.ingredients ||
          e.key === CATALOG_KEYS.recipes ||
          e.key === CATALOG_KEYS.prices ||
          e.key === CATALOG_KEYS.nutrition) {
        setState(readCatalogFromLocal());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // API per ricaricare a richiesta
  const reload = async () => {
    setLoading(true);
    try {
      await forceReloadCatalog();
      setState(readCatalogFromLocal());
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    ingredients: state.ingredients || [],
    recipes: state.recipes || [],
    prices: state.prices || {},
    nutrition: state.nutrition || {},
    loading,
    error,
    reload,
  };
}
