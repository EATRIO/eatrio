// src/utils/pantryStorage.js
import { useEffect, useState } from 'react';

export const PANTRY_KEY = 'eatrio:pantry:v2';

/* =========================
 * LocalStorage I/O + Hook
 * ========================= */
export function readPantry() {
  try {
    const raw = localStorage.getItem(PANTRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function writePantry(items) {
  try {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
    // Notifica lo stesso tab
    window.dispatchEvent(new Event('pantry:updated'));
  } catch {}
}

export function usePantryItems() {
  const [items, setItems] = useState(() => readPantry());

  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      if (e.key === PANTRY_KEY) setItems(readPantry());
    };
    const onCustom = () => setItems(readPantry());

    window.addEventListener('storage', onStorage);
    window.addEventListener('pantry:updated', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pantry:updated', onCustom);
    };
  }, []);

  return items;
}

/* =========================
 * Normalizzazione & Alias
 * ========================= */
const stripDiacritics = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const norm = (s) =>
  stripDiacritics(String(s || ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')     // rimuove punteggiatura
    .replace(/\s+/g, ' ')             // spazi multipli
    .trim();

// piccolo stem plurale (grezzissimo ma utile per it-IT base)
const singularize = (s) =>
  s.replace(/(i|e)$/g, '')            // pomodori -> pomodor, cipolle -> cipoll
   .replace(/(ni|ni)$/g, 'ne');       // fallback light (opzionale)

// mappa alias → chiave canonica
const ALIASES = {
  spaghetti: ['spaghetti', 'pasta', 'spaghetto'],
  uova: ['uova', 'uovo'],
  pecorino: ['pecorino'],
  parmigiano: ['parmigiano', 'parmigiano reggiano'],
  guanciale: ['guanciale'],
  pepe: ['pepe', 'pepe nero'],
  riso: ['riso', 'riso carnaroli', 'arborio', 'carnaroli'],
  porcini: ['porcini', 'funghi porcini', 'funghi'],
  burro: ['burro'],
  brodo: ['brodo', 'brodo vegetale', 'brodo di carne'],
  pollo: ['pollo', 'cosce di pollo', 'petto di pollo'],
  olive: ['olive', 'olive nere', 'olive verdi'],
  pomodoro: [
    'pomodoro', 'pomodori', 'pomodori pelati', 'passata', 'passata di pomodoro',
    'polpa di pomodoro', 'salsa di pomodoro', 'pomodoro san marzano'
  ],
  cipolla: ['cipolla', 'cipolle'],
  carota: ['carota', 'carote'],
  sedano: ['sedano'],
  quinoa: ['quinoa'],
  verdure: ['verdure', 'verdure di stagione', 'zucchine', 'peperoni', 'insalata', 'ortaggi', 'mix verdure'],
  vinaigrette: ['vinaigrette', 'condimento'],
  olio: ['olio', 'olio extravergine', 'olio evo', 'olio d oliva'],
  aceto: ['aceto', 'aceto di vino', 'aceto balsamico'],
  savoiardi: ['savoiardi'],
  mascarpone: ['mascarpone'],
  caffe: ['caffe', 'caffè'],
  cacao: ['cacao', 'cacao amaro'],
  zucchero: ['zucchero'],
  lenticchie: ['lenticchie', 'lenticchia'],
  aglio: ['aglio', 'spicchio aglio', 'spicchi aglio'],
  alloro: ['alloro', 'foglia alloro'],
  farina: ['farina', 'farina 00', 'farina manitoba'],
  lievito: ['lievito', 'lievito di birra', 'lievito secco', 'lievito fresco'],
  mozzarella: ['mozzarella', 'mozzarella fior di latte', 'mozzarella di bufala'],
  basilico: ['basilico', 'mazzo basilico'],
  banana: ['banana', 'banane'],
  frutti_bosco: ['frutti di bosco', 'mirtilli', 'lamponi', 'fragole', 'more'],
  latte: ['latte'],
  yogurt: ['yogurt', 'yoghurt'],
  granola: ['granola'],
  pecorino_romano: ['pecorino romano'], // opzionale, puoi unificarlo a 'pecorino'
};

// indice inverso alias → canonico
const ALIAS_INDEX = (() => {
  const idx = new Map();
  Object.entries(ALIASES).forEach(([key, arr]) => {
    arr.forEach((a) => idx.set(norm(a), key));
  });
  return idx;
})();

// trova chiave canonica a partire da un nome (ricetta o dispensa)
function resolveCanonicalKey(name) {
  const n = singularize(norm(name));

  // 1) match diretto su alias normalizzati
  if (ALIAS_INDEX.has(n)) return ALIAS_INDEX.get(n);

  // 2) substring match sugli alias (per stringhe più lunghe tipo "pomodori san marzano dop")
  for (const [canon, arr] of Object.entries(ALIASES)) {
    for (const alias of arr) {
      const a = singularize(norm(alias));
      if (n.includes(a)) return canon;
    }
  }

  // 3) fallback: usa il termine normalizzato stesso (consente matching per uguaglianza pura altrove)
  return n;
}

// confronto dispensa ↔ chiave canonica
function pantryItemMatchesKey(pantryName, canonicalKey) {
  const canonPantry = resolveCanonicalKey(pantryName);
  return canonPantry === canonicalKey;
}

/* =========================
 * Unità di misura
 * ========================= */
function toBase(qty, unit) {
  const q = Number(qty) || 0;
  const u = norm(unit);
  // base: kg, l, pz
  if (u === 'g') return { qty: q / 1000, unit: 'kg' };
  if (u === 'kg') return { qty: q, unit: 'kg' };
  if (u === 'ml') return { qty: q / 1000, unit: 'l' };
  if (u === 'l') return { qty: q, unit: 'l' };
  // conf, mazzo, bustina, etc → trattiamo come pezzi
  return { qty: q || 1, unit: 'pz' };
}

/* =========================
 * Compute completion robusto
 * ========================= */
export function computeRecipeCompletion(recipe, pantryItems) {
  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  if (ingredients.length === 0) {
    return { percent: 100, missing: [] };
  }

  const items = Array.isArray(pantryItems) ? pantryItems : [];

  let haveCount = 0;
  const missing = [];

  for (const ing of ingredients) {
    const ingName = ing?.name ?? ing?.key ?? '';
    const ingCanon = resolveCanonicalKey(ingName);

    const haveCandidates = items.filter((p) => pantryItemMatchesKey(p?.name, ingCanon));

    // se la ricetta non specifica quantità → basta 1 match in dispensa
    if (!ing?.quantity) {
      if (haveCandidates.length > 0) {
        haveCount += 1;
      } else {
        missing.push({ name: ingName, reason: 'not-found' });
      }
      continue;
    }

    // altrimenti sommiamo le quantità compatibili in base unit
    const needBase = toBase(ing.quantity, ing.unit);
    let availableQty = 0;
    for (const p of haveCandidates) {
      const pb = toBase(p?.quantity, p?.unit);
      if (pb.unit === needBase.unit) {
        availableQty += Number(pb.qty) || 0;
      }
    }

    if (availableQty >= needBase.qty) {
      haveCount += 1;
    } else {
      // calcolo quanto manca in unità della ricetta (display-friendly)
      const lackingBase = Math.max(0, needBase.qty - availableQty);
      let lackQty = lackingBase;
      let lackUnit = needBase.unit;
      // riportiamo all’unità originale se era g/ml
      if (norm(ing.unit) === 'g' && needBase.unit === 'kg') {
        lackQty = Math.round(lackingBase * 1000);
        lackUnit = 'g';
      }
      if (norm(ing.unit) === 'ml' && needBase.unit === 'l') {
        lackQty = Math.round(lackingBase * 1000);
        lackUnit = 'ml';
      }
      missing.push({ name: ingName, quantity: lackQty, unit: lackUnit, reason: 'insufficient' });
    }
  }

  const percent = Math.round((haveCount / ingredients.length) * 100);
  return { percent, missing };
}


