// src/utils/pantryStorage.js
import { useEffect, useState } from 'react';

export const PANTRY_KEY = 'eatrio:pantry:v2';
const LEGACY_KEYS = ['eatrio:pantryItems', 'eatrio:pantry'];

/**
 * Legge la dispensa:
 * - prova la chiave nuova
 * - se vuota, migra dalla/e legacy (se presenti) e salva su v2
 * - sempre array in uscita
 */
export function readPantry() {
  try {
    const raw = localStorage.getItem(PANTRY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }

    // Migrazione da legacy (una volta sola)
    for (const k of LEGACY_KEYS) {
      const legacyRaw = localStorage.getItem(k);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        const arr = Array.isArray(legacy) ? legacy : [];
        try {
          localStorage.setItem(PANTRY_KEY, JSON.stringify(arr));
          LEGACY_KEYS.forEach((lk) => localStorage.removeItem(lk));
        } catch {}
        return arr;
      }
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Scrive e fa broadcast:
 * - salva su v2
 * - ripulisce le chiavi legacy
 * - emette 'pantry:updated' (stesso tab) + trigga 'storage' su altri tab
 */
export function writePantry(items) {
  try {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(items ?? []));
    // cleanup legacy
    LEGACY_KEYS.forEach((lk) => localStorage.removeItem(lk));
    // notifica stesso tab
    window.dispatchEvent(new Event('pantry:updated'));
    // NB: l’evento 'storage' arriva automaticamente sugli ALTRI tab
  } catch {}
}

/**
 * Hook reattivo:
 * - inizializza con readPantry()
 * - si aggiorna su 'storage' (altri tab) e 'pantry:updated' (stesso tab)
 */
export function usePantryItems() {
  const [items, setItems] = useState(() => readPantry());

  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === PANTRY_KEY) setItems(readPantry());
      // tollera eventuali scritture legacy residue
      if (e.key === 'eatrio:pantry' || e.key === 'eatrio:pantryItems') setItems(readPantry());
    };
    const onCustom = () => setItems(readPantry());

    window.addEventListener('storage', onStorage);       // altri tab
    window.addEventListener('pantry:updated', onCustom); // stesso tab

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pantry:updated', onCustom);
    };
  }, []);

  return items;
}

/**
 * Helper basic per percentuale ricetta (se usi recipe.ingredients “plain”)
 * - considera presente un ingrediente se matcha per nome (case-insensitive)
 * - puoi estendere con mapping unità/quantità
 */
export function computeRecipeCompletion(recipe, pantryItems) {
  if (!recipe?.ingredients?.length) return { percent: 100, missing: [] };

  const norm = (s) => (s || '').trim().toLowerCase();

  const missing = [];
  let haveCount = 0;

  for (const ing of recipe.ingredients) {
    const name = norm(ing.name);
    const candidates = pantryItems.filter((p) => norm(p.name) === name);

    if (candidates.length === 0) {
      missing.push({ ...ing, reason: 'not-found' });
      continue;
    }

    // TODO opzionale: sommare quantità compatibili per unità
    haveCount += 1;
  }

  const percent = Math.round((haveCount / recipe.ingredients.length) * 100);
  return { percent, missing };
}

