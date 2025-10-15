// src/utils/pantryStorage.js
import { useEffect, useState } from 'react';

export const PANTRY_KEY = 'eatrio:pantry:v2';

// Lettura
export function readPantry() {
  try {
    const raw = localStorage.getItem(PANTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Scrittura + broadcast (stesso tab + altri tab)
export function writePantry(items) {
  try {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
    // Notifica lo stesso tab
    window.dispatchEvent(new Event('pantry:updated'));
  } catch {}
}

// Hook reattivo che si aggiorna se cambia la dispensa
export function usePantryItems() {
  const [items, setItems] = useState(() => readPantry());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === PANTRY_KEY) setItems(readPantry());
    };
    const onCustom = () => setItems(readPantry());

    window.addEventListener('storage', onStorage);      // altri tab
    window.addEventListener('pantry:updated', onCustom); // stesso tab

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pantry:updated', onCustom);
    };
  }, []);

  return items;
}

// Helper per percentuale ricetta
export function computeRecipeCompletion(recipe, pantryItems) {
  // recipe.ingredients = [{ name, quantity, unit }, ...]
  if (!recipe?.ingredients?.length) return { percent: 100, missing: [] };

  const norm = (s) => (s || '').trim().toLowerCase();

  const missing = [];
  let haveCount = 0;

  for (const ing of recipe.ingredients) {
    const name = norm(ing.name);
    const candidates = pantryItems.filter(p => norm(p.name) === name);

    if (candidates.length === 0) {
      missing.push({ ...ing, reason: 'not-found' });
      continue;
    }

    // Se hai logiche su quantità/unità, puoi raffinare qui:
    // somma quantità uguali di unità oppure fai un mapping unità → base
    // Per ora consideriamo "presente" se almeno 1 voce matcha per nome
    haveCount += 1;
  }

  const percent = Math.round((haveCount / recipe.ingredients.length) * 100);
  return { percent, missing };
}
