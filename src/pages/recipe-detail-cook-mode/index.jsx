// src/pages/recipe-detail-cook-mode/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useCatalog } from '../../utils/catalog';

import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import CookModeOverlay from '../../components/ui/CookModeOverlay';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

import RecipeHero from './components/RecipeHero';
import IngredientsList from './components/IngredientsList';
import CookingInstructions from './components/CookingInstructions';
import NutritionInfo from './components/NutritionInfo';
import CostEstimation from './components/CostEstimation';

/* ========== UTILI ========== */
const cap = (s) => (s || '').replace(/\b\w/g, (m) => m.toUpperCase());

// === CATALOGHI (prezzi + calorie) ===
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

// === DEV TOGGLE: mostra ID ricette (solo admin) ===
const DEV_SHOW_IDS_KEY = 'eatrio:dev:showIds';

// === Catalogo Ricette (per ricaricare sempre la versione fresca) ===
const RECIPES_KEY = 'eatrio:catalog:recipes';
const getRecipeFromCatalog = (id) => {
  try {
    const arr = JSON.parse(localStorage.getItem(RECIPES_KEY) || '[]');
    return arr.find(r => String(r.id) === String(id)) || null;
  } catch { return null; }
};

// converte quantità nell'unità base prezzo (kg/l/pz)
const toBaseForPrice = (amount, fromUnit, base) => {
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

// converter gemello per nutrizione (stesse basi)
const toBaseForNutrition = (amount, fromUnit, base) => {
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

/* ========== DISPENSA ========== */
const PANTRY_KEY = 'eatrio:pantry';
const loadPantry = () => {
  try { return JSON.parse(localStorage.getItem(PANTRY_KEY) || '[]'); }
  catch { return []; }
};

/* ========== NORMALIZZAZIONE / MATCHING ========== */
const stripAccents = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const normalizeText = (s) => {
  let x = stripAccents(String(s).toLowerCase());
  x = x
    .replace(/[\d.,]+ ?(kg|g|gr|l|ml|cl|pz|pezzi|pezzo|uova|uovo)\b/g, ' ')
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\b(qb|q\.b\.|bio|fresco|fresca|fresche|freschi|tritato|tritata|a|dadini|di|del|della|dello|dei|degli|delle|al|allo|alla|ai|agli|alle|lo|la|il|i|gli|le|con|senza|ed|e|oppure)\b/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const tokens = x.split(' ').filter(Boolean).map(t => {
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
  'parmigiano': ['parmigiano reggiano', 'grana padano', 'grana'],
  'funghi porcini': ['porcini'],
  'funghi': ['champignon', 'funghi porcini', 'porcini'],
  'riso': ['riso carnaroli', 'arborio', 'vialone nano'],
  'cipolla': ['cipolle', 'cipollotto'],
  'pollo': ['petto di pollo', 'cosce di pollo', 'fusi di pollo'],
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
  const inter = [...A].filter(x => B.has(x)).length;
  return inter / Math.max(A.size, B.size);
};
const expandCandidates = (name) => {
  const n = normalizeText(name);
  const canon = normalizeText(canonicalFromNormalized(n));
  const out = new Set([canon]);
  for (const [canonName, list] of Object.entries(ALIASES)) {
    const c = normalizeText(canonName);
    const aliases = list.map(normalizeText);
    if (canon === c || aliases.includes(canon)) {
      out.add(c);
      aliases.forEach(a => out.add(a));
    }
  }
  return [...out];
};
const nameMatches = (pantryName, ingName) => {
  const p = normalizeText(pantryName);
  const candidates = expandCandidates(ingName);
  if (candidates.some(c => c === p)) return true;
  return candidates.some(c => tokenSetScore(p, c) >= 0.5);
};

/* ========== (INLINE) IMAGE OVERRIDE SHARED VIA localStorage ========== */
const IMG_MAP_KEY = 'eatrio:recipeImages';
const recipeKey = (t) =>
  stripAccents(String(t || ''))
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const loadImageMap = () => {
  try { return JSON.parse(localStorage.getItem(IMG_MAP_KEY) || '{}'); }
  catch { return {}; }
};
const saveImageMap = (map) => {
  try { localStorage.setItem(IMG_MAP_KEY, JSON.stringify(map || {})); } catch {}
};
const getRecipeImage = (title, fallback) => {
  const map = loadImageMap();
  return map[recipeKey(title)] || fallback || '';
};
const setRecipeImage = (title, urlOrEmpty) => {
  const k = recipeKey(title);
  const map = loadImageMap();
  if (String(urlOrEmpty || '').trim()) map[k] = String(urlOrEmpty).trim();
  else delete map[k];
  saveImageMap(map);
  try {
    window.dispatchEvent(new StorageEvent('storage', {
      key: IMG_MAP_KEY,
      newValue: JSON.stringify(map)
    }));
  } catch {}
};
const subscribeImageMap = (cb) => {
  const handler = (e) => {
    if (!e || e.key === IMG_MAP_KEY) cb(loadImageMap());
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};

/* ========== UNITÀ + EQUIVALENZE PACK (NUOVO) ========== */
const UNIT_MAP = {
  g:  { base: 'g',  factor: 1 },
  gr: { base: 'g',  factor: 1 },
  kg: { base: 'g',  factor: 1000 },

  ml: { base: 'ml', factor: 1 },
  cl: { base: 'ml', factor: 10 },
  l:  { base: 'ml', factor: 1000 },

  pz:    { base: 'pz', factor: 1 },
  pezzo: { base: 'pz', factor: 1 },
  pezzi: { base: 'pz', factor: 1 },
  uovo:  { base: 'pz', factor: 1 },
  uova:  { base: 'pz', factor: 1 },

  conf:        { base: 'pack', factor: 1 },
  confezione:  { base: 'pack', factor: 1 },
  confezioni:  { base: 'pack', factor: 1 },
  bottiglia:   { base: 'pack', factor: 1 },
  lattina:     { base: 'pack', factor: 1 },
  barattolo:   { base: 'pack', factor: 1 },
  sacchetto:   { base: 'pack', factor: 1 },
};

/** Equivalenze per alcuni ingredienti */
const PACK_EQUIV = {
  [normalizeText(canonicalFromNormalized(normalizeText('burro')))] : {
    pz: { base: 'g', factor: 250 }, conf: { base: 'g', factor: 250 },
    confezione: { base: 'g', factor: 250 }, confezioni: { base: 'g', factor: 250 },
    panetto: { base: 'g', factor: 250 }, panetti: { base: 'g', factor: 250 },
  },
  [normalizeText(canonicalFromNormalized(normalizeText('passata di pomodoro')))] : {
    pz: { base: 'g', factor: 700 }, conf: { base: 'g', factor: 700 },
    confezione: { base: 'g', factor: 700 }, confezioni: { base: 'g', factor: 700 },
    bottiglia: { base: 'g', factor: 700 }, barattolo: { base: 'g', factor: 400 }, lattina: { base: 'g', factor: 400 },
  },
  [normalizeText(canonicalFromNormalized(normalizeText('pomodori pelati')))] : {
    pz: { base: 'g', factor: 400 }, conf: { base: 'g', factor: 400 },
    confezione: { base: 'g', factor: 400 }, confezioni: { base: 'g', factor: 400 },
    lattina: { base: 'g', factor: 400 }, barattolo: { base: 'g', factor: 400 },
  },
  [normalizeText(canonicalFromNormalized(normalizeText('olio extravergine di oliva')))] : {
    pz: { base: 'ml', factor: 1000 }, conf: { base: 'ml', factor: 1000 },
    confezione: { base: 'ml', factor: 1000 }, confezioni: { base: 'ml', factor: 1000 },
    bottiglia: { base: 'ml', factor: 750 },
  },
  [normalizeText(canonicalFromNormalized(normalizeText('farina 00')))] : {
    pz: { base: 'g', factor: 1000 }, conf: { base: 'g', factor: 1000 },
    confezione: { base: 'g', factor: 1000 }, confezioni: { base: 'g', factor: 1000 },
    sacchetto: { base: 'g', factor: 1000 },
  },
};

const convertSameBase = (qty, fromU, toU) => {
  const f = UNIT_MAP[(fromU || '').toLowerCase()];
  const t = UNIT_MAP[(toU || '').toLowerCase()];
  const q = Number(qty || 0);
  if (!f || !t || !Number.isFinite(q) || q < 0) return NaN;
  if (f.base === 'pack' || t.base === 'pack') return NaN;
  if (f.base !== t.base) return NaN;
  const toBase = q * f.factor;
  return toBase / t.factor;
};

const convertViaPack = (ingredientName, qty, fromU, toU) => {
  const normName = normalizeText(canonicalFromNormalized(normalizeText(ingredientName)));
  const eq = PACK_EQUIV[normName];
  if (!eq) return NaN;
  const def = eq[(fromU || '').toLowerCase()];
  if (!def) return NaN;
  const t = UNIT_MAP[(toU || '').toLowerCase()];
  if (!t || t.base === 'pack') return NaN;
  if (def.base !== t.base) return NaN;
  const q = Number(qty || 0);
  if (!Number.isFinite(q) || q < 0) return NaN;
  const inTargetBase = q * def.factor;
  return inTargetBase / t.factor;
};

/* ========== DISPONIBILITÀ (PATCHATA) ========== */
const checkPantryFor = (pantry, name, needQty, needUnit) => {
  const need = Number(needQty);
  const safeNeed = Number.isFinite(need) && need > 0 ? need : 1;
  const unit = needUnit || 'pz';

  let haveQty = 0;
  for (const p of pantry) {
    if (!nameMatches(p?.name, name)) continue;
    const q = Number(p?.quantity || 0);
    const u = p?.unit || 'pz';
    let add = convertSameBase(q, u, unit);
    if (!Number.isFinite(add)) add = convertViaPack(name, q, u, unit);
    if (Number.isFinite(add) && add > 0) haveQty += add;
  }

  const missing = Math.max(0, safeNeed - haveQty);
  return { availableQty: haveQty, missingQty: missing, available: missing <= 1e-6 };
};

/* ========== SOSTITUZIONI ========== */
const SUBS = {
  [normalizeText('funghi porcini')]: [{ name: 'champignon', ratio: 1.3, note: 'Usane un po’ di più' }],
  [normalizeText('passata di pomodoro')]: [{ name: 'polpa di pomodoro', ratio: 1.0 }],
  [normalizeText('cipolla')]: [{ name: 'scalogno', ratio: 0.7 }, { name: 'porro', ratio: 1.2 }],
  [normalizeText('parmigiano')]: [{ name: 'grana padano', ratio: 1.0 }],
  [normalizeText('riso carnaroli')]: [{ name: 'arborio', ratio: 1.0 }],
  [normalizeText('pollo')]: [{ name: 'fusi di pollo', ratio: 1.0 }],
};
const getSubs = (name) => SUBS[normalizeText(name)] || [];

/* ========== COSTRUISCI RICETTA ARRICCHITA ========== */
const buildRichRecipe = (base, currentServings, pantry, imageVersionBump = 0) => {
  if (!base) return null;

  const title = base.title || 'Ricetta';
  const t = title.toLowerCase();
  const baseServings = base.servings || 4;
  const servings = currentServings || baseServings;
  const scale = Math.max(0.1, Number(servings) / Number(baseServings));

  const cookingTime = base.cookingTime || base.cookTime || 20;
  const description = base.description || `Ricetta semplice e gustosa: ${title}.`;

  // Fallback ingredienti se la ricetta è senza lista
  let ingredients = base.ingredients;
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    if (t.includes('carbonara')) {
      ingredients = [
        { id: 1, name: 'Spaghetti', ingredient_id: 'spaghetti', amount: 360, unit: 'g' },
        { id: 2, name: 'Guanciale', ingredient_id: 'guanciale', amount: 120, unit: 'g' },
        { id: 3, name: 'Uova', ingredient_id: 'uova', amount: 4, unit: 'pz' },
        { id: 4, name: 'Pecorino Romano', ingredient_id: 'pecorino_romano', amount: 60, unit: 'g' },
        { id: 5, name: 'Pepe nero', amount: 2, unit: 'g' },
      ];
    } else if (t.includes('risotto') || t.includes('funghi')) {
      ingredients = [
        { id: 1, name: 'Riso Carnaroli', ingredient_id: 'riso_carnaroli', amount: 320, unit: 'g' },
        { id: 2, name: 'Funghi Porcini', ingredient_id: 'funghi_porcini', amount: 300, unit: 'g' },
        { id: 3, name: 'Brodo vegetale', ingredient_id: 'brodo_vegetale', amount: 1, unit: 'l' },
        { id: 4, name: 'Cipolla', ingredient_id: 'cipolla', amount: 1, unit: 'pz' },
        { id: 5, name: 'Burro', ingredient_id: 'burro', amount: 40, unit: 'g' },
        { id: 6, name: 'Parmigiano', ingredient_id: 'parmigiano', amount: 60, unit: 'g' },
        { id: 7, name: 'Vino bianco', ingredient_id: 'vino_bianco', amount: 80, unit: 'ml' },
      ];
    } else if (t.includes('pollo')) {
      ingredients = [
        { id: 1, name: 'Pollo', ingredient_id: 'pollo', amount: 1, unit: 'kg' },
        { id: 2, name: 'Passata di pomodoro', ingredient_id: 'passata_di_pomodoro', amount: 400, unit: 'g' },
        { id: 3, name: 'Olive', ingredient_id: 'olive_verdi', amount: 120, unit: 'g' },
        { id: 4, name: 'Cipolla', ingredient_id: 'cipolla', amount: 1, unit: 'pz' },
        { id: 5, name: 'Olio EVO', ingredient_id: 'olio_extravergine', amount: 30, unit: 'ml' },
        { id: 6, name: 'Alloro', ingredient_id: 'alloro', amount: 2, unit: 'pz' },
      ];
    } else if (t.includes('lenticchie') || t.includes('zuppa')) {
      ingredients = [
        { id: 1, name: 'Lenticchie secche', ingredient_id: 'lenticchie_secche', amount: 300, unit: 'g' },
        { id: 2, name: 'Carota', ingredient_id: 'carota', amount: 1, unit: 'pz' },
        { id: 3, name: 'Sedano', ingredient_id: 'sedano', amount: 1, unit: 'pz' },
        { id: 4, name: 'Cipolla', ingredient_id: 'cipolla', amount: 1, unit: 'pz' },
        { id: 5, name: 'Passata di pomodoro', ingredient_id: 'passata_di_pomodoro', amount: 200, unit: 'g' },
        { id: 6, name: 'Brodo vegetale', ingredient_id: 'brodo_vegetale', amount: 1, unit: 'l' },
        { id: 7, name: 'Olio EVO', ingredient_id: 'olio_extravergine', amount: 30, unit: 'ml' },
        { id: 8, name: 'Sale', amount: 5, unit: 'g' },
      ];
    } else {
      ingredients = [
        { id: 1, name: 'Spaghetti', ingredient_id: 'spaghetti', amount: 320, unit: 'g' },
        { id: 2, name: 'Pomodoro', ingredient_id: 'pomodoro', amount: 400, unit: 'g' },
        { id: 3, name: 'Olio EVO', ingredient_id: 'olio_extravergine', amount: 20, unit: 'ml' },
        { id: 4, name: 'Sale', amount: 5, unit: 'g' },
      ];
    }
  }

  const enrichedIngredients = (ingredients || []).map((ing, idx) => {
    const baseAmt = Number(ing.amount);
    const needQty = Number.isFinite(baseAmt) && baseAmt > 0 ? baseAmt * scale : 1;
    const needUnit = ing.unit || 'pz';

    const { availableQty, missingQty, available } = checkPantryFor(
      pantry, ing.name, needQty, needUnit
    );

    const subs = getSubs(ing.name);
    const firstSub = subs[0]
      ? { name: subs[0].name, amount: Math.max(1, Math.round(needQty * (subs[0].ratio || 1))), unit: needUnit, note: subs[0].note }
      : null;

    return {
      id: ing.id ?? idx + 1,
      ingredientId: ing.ingredient_id || ing.ingredientId || undefined,
      name: ing.name,
      amount: needQty,
      unit: needUnit,
      available,
      availableQty,
      missingQty,
      substitute: available ? null : firstSub,
    };
  });

  // 🔢 Calorie totali ricetta calcolate dal catalogo ingredienti
  const ingredientNutrition = loadIngredientNutrition();
  let totalKcal = 0;
  for (const ing of enrichedIngredients) {
    const meta = ing.ingredientId ? ingredientNutrition[ing.ingredientId] : null;
    if (!meta) continue;
    const base = meta.unitBase || 'kg';
    const needBaseQty = toBaseForNutrition(Number(ing.amount || 0), ing.unit || 'pz', base);
    if (needBaseQty > 0) totalKcal += needBaseQty * Number(meta.kcalPerUnit || 0);
  }
  const computedCalories = Math.round(totalKcal);

  const baseNutrition = base.nutrition || {
    calories: base.calories || 400,
    protein: base.protein || 15,
    carbs:   base.carbs   || 55,
    fats:    base.fats    || 12,
    fiber:   base.fiber   || 4,
    sodium:  base.sodium  || 600,
  };
  const nutrition = {
    ...baseNutrition,
    calories: computedCalories > 0 ? computedCalories : baseNutrition.calories,
  };

  // costo ricetta da catalogo (se disponibile)
  const { prices: ingredientPrices } = useCatalog(true);
  const calcRetailer = (ret) => {
    let tot = 0;
    for (const ing of enrichedIngredients) {
      const id = ing.ingredientId;
      if (!id) continue;
      const priceInfo = ingredientPrices?.[id];
      if (!priceInfo) continue;
      const unitBase = priceInfo.unitBase || 'kg';
      const unitPrice = (priceInfo.retailers?.[ret] ?? priceInfo.avg ?? null);
      if (unitPrice == null) continue;
      const needBaseQty = toBaseForPrice(Number(ing.amount || 0), ing.unit || 'pz', unitBase);
      if (needBaseQty > 0) tot += needBaseQty * Number(unitPrice);
    }
    return Math.round(tot * 100) / 100;
  };
  const computedCost = {
    coop: calcRetailer('coop'),
    conad: calcRetailer('conad'),
    esselunga: calcRetailer('esselunga'),
  };
  const nonNull = Object.values(computedCost).filter(v => v > 0);
  const computedAvg = nonNull.length ? Math.round((nonNull.reduce((a,b)=>a+b,0)/nonNull.length)*100)/100 : null;

  // ⬇️ RISOLUZIONE IMMAGINE CONDIVISA
  const defaultImg = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=900&fit=crop';
  const resolvedImage = getRecipeImage(title, base.image || defaultImg);

  const costData =
    (nonNull.length ? { ...computedCost, average: computedAvg } : null)
    || base.costData
    || {
      coop: base.priceComparison?.coop ?? base.estimatedCost ?? 8.5,
      conad: base.priceComparison?.conad ?? (base.estimatedCost ? base.estimatedCost * 1.05 : 8.9),
      esselunga: base.priceComparison?.esselunga ?? (base.estimatedCost ? base.estimatedCost * 1.03 : 8.7),
      average: base.priceComparison?.avg ?? ((base.priceComparison?.coop ?? 8.5) + (base.priceComparison?.conad ?? 8.9) + (base.priceComparison?.esselunga ?? 8.7)) / 3,
    };

  return {
    id: base.id ?? 'tmp',
    title: cap(title),
    image: resolvedImage,
    cookTime: `${cookingTime} min`,
    cookingTime,
    difficulty: base.difficulty ?? 2,
    calories: nutrition.calories,
    servings,
    isFavorite: !!base.isFavorite,
    description,
    ingredients: enrichedIngredients,
    steps: base.steps && base.steps.length ? base.steps : [
      { id: 1, title: 'Preparazione ingredienti', description: 'Pesa e prepara tutti gli ingredienti.', type: 'prep', duration: '5 min', tips: 'Mise en place, risparmi tempo.' },
      { id: 2, title: 'Cottura base', description: 'Avvia la cottura seguendo la ricetta.', type: 'cook', duration: `${Math.max(5, Math.round((cookingTime || 20) * 0.6))} min`, timerMinutes: Math.max(5, Math.round((cookingTime || 20) * 0.6)) },
      { id: 3, title: 'Finitura e impiattamento', description: 'Spegni il fuoco, rifinisci e impiatta.', type: 'mix', duration: `${Math.max(2, Math.round((cookingTime || 20) * 0.2))} min` },
    ],
    nutrition,
    costData,
  };
};

/* ========== PAGINA ========== */
const RecipeDetailCookMode = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ricetta passata dalla route
  const routeRecipe = location?.state?.recipe || null;

  // Versioning: se cambia il catalogo, forziamo un refresh
  const [recipesVersion, setRecipesVersion] = useState(0);
  useEffect(() => {
    const onStorage = (e) => { if (!e || e.key === RECIPES_KEY) setRecipesVersion(v => v + 1); };
    const onFocus = () => setRecipesVersion(v => v + 1);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Prendi SEMPRE la versione fresca dal catalogo (merge con quella della route)
  const baseRecipe = useMemo(() => {
    if (!routeRecipe?.id) return routeRecipe;
    const fresh = getRecipeFromCatalog(routeRecipe.id);
    return fresh ? { ...routeRecipe, ...fresh } : routeRecipe;
  }, [routeRecipe, recipesVersion]);

  const [servings, setServings] = useState(baseRecipe?.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [currentCookStep, setCurrentCookStep] = useState(0);
  const [activeTimer, setActiveTimer] = useState(null);

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

  // ↕️ Rerender quando cambia la mappa delle immagini
  const [imgTick, setImgTick] = useState(0);
  useEffect(() => subscribeImageMap(() => setImgTick(t => t + 1)), []);

  const [customIngredients, setCustomIngredients] = useState(null);

  // Modalità dev: mostra ID ricette (persistito su localStorage) — toggle: Alt+Shift+D
  const [showIds, setShowIds] = useState(() => {
    try { return localStorage.getItem(DEV_SHOW_IDS_KEY) === '1'; } catch { return false; }
  });
  useEffect(() => {
    const onKey = (e) => {
      if (!e?.altKey || !e?.shiftKey) return;
      if ((e.key || '').toLowerCase() !== 'd') return;
      setShowIds(prev => {
        const next = !prev;
        try { localStorage.setItem(DEV_SHOW_IDS_KEY, next ? '1' : '0'); } catch {}
        try {
          const el = document.createElement('div');
          el.className = 'fixed z-[2000] top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-md text-sm';
          el.textContent = next ? 'Mostra ID: ON' : 'Mostra ID: OFF';
          document.body.appendChild(el);
          setTimeout(() => { try { document.body.removeChild(el); } catch {} }, 900);
        } catch {}
        return next;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const recipe = useMemo(
    () => buildRichRecipe({ ...baseRecipe }, servings, pantry, imgTick),
    [baseRecipe, servings, pantry, imgTick]
  );

  const effectiveIngredients = useMemo(() => {
    if (!customIngredients) return recipe?.ingredients || [];
    return customIngredients.map((ing) => {
      const { availableQty, missingQty, available } = checkPantryFor(
        pantry, ing.name, Number(ing.amount || 0), ing.unit || 'pz'
      );
      return { ...ing, available, availableQty, missingQty };
    });
  }, [customIngredients, recipe?.ingredients, pantry]);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWithLogo showBackButton title="Ricetta" />
        <main className="pt-16 pb-24 lg:pb-8 lg:pl-64">
          <div className="px-4 py-10 text-center">
            <Icon name="Info" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Nessuna ricetta da mostrare</h2>
            <p className="text-muted-foreground mb-6">Apri questa pagina toccando una ricetta dall’elenco.</p>
            <Button onClick={() => navigate('/recipe-collection-ricette')} iconName="ArrowLeft" iconPosition="left">
              Torna alle Ricette
            </Button>
          </div>
        </main>
        <BottomTabNavigation />
      </div>
    );
  }

  const enqueueCartItems = (items) => {
    try {
      const key = 'eatrio:cart:addQueue';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([...prev, ...items]));
    } catch {}
  };

  const toast = (msg) => {
    const el = document.createElement('div');
    el.className = 'fixed z-[2000] top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-md text-sm';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { try { document.body.removeChild(el); } catch {} }, 1600);
  };

  const handleAddSingleToCart = (ingredientOrId) => {
    const ing = typeof ingredientOrId === 'object'
      ? ingredientOrId
      : (effectiveIngredients || []).find((x) => x?.id === ingredientOrId);
    if (!ing) return;

    const qtyRaw = Number(ing?.missingQty ?? ing?.amount ?? 0);
    const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : 1;

    enqueueCartItems([{
      name: cap(ing?.name),
      quantity: qty,
      unit: (ing?.unit || 'pz').toLowerCase(),
      ingredientId: ing?.ingredientId || undefined,
      fromRecipe: recipe.title,
    }]);

    toast('Aggiunto al carrello');
  };

  const handleAddAllMissingToCart = () => {
    const missing = (effectiveIngredients || []).filter((ing) => (ing?.missingQty || 0) > 1e-6);
    if (missing.length === 0) { toast('Hai già tutto in dispensa!'); return; }
    const payload = missing.map((ing) => ({
      name: cap(ing.name),
      quantity: Math.max(0.1, Number(ing.missingQty) || 0),
      unit: (ing.unit || 'pz').toLowerCase(),
      ingredientId: ing?.ingredientId || undefined,
      fromRecipe: recipe.title,
    }));
    enqueueCartItems(payload);
    navigate('/shopping-list-spesa');
  };

  const applySubstitution = (ingredientId) => {
    const src = customIngredients ? [...customIngredients] : [...(recipe?.ingredients || [])];
    const i = src.findIndex((x) => x.id === ingredientId);
    if (i === -1) return;
    const ing = src[i];
    if (!ing.substitute) return;

    const newIng = {
      ...ing,
      name: cap(ing.substitute.name),
      amount: ing.substitute.amount,
      unit: ing.substitute.unit || ing.unit,
      substitute: null,
    };
    const { availableQty, missingQty, available } = checkPantryFor(
      pantry, newIng.name, Number(newIng.amount || 0), newIng.unit || 'pz'
    );
    src[i] = { ...newIng, available, availableQty, missingQty };
    setCustomIngredients(src);
  };

  const handleServingsChange = (s) => setServings(s);
  const handleToggleFavorite = () => console.log('Toggle favorite:', recipe.id);
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: recipe.title, text: recipe.description, url: window.location?.href }); } catch {}
    } else {
      navigator.clipboard?.writeText(window.location?.href);
      alert('Link copiato negli appunti!');
    }
  };
  const handleStartCookMode = () => { setIsCookModeOpen(true); setCurrentCookStep(0); };
  const handleCloseCookMode = () => { setIsCookModeOpen(false); setActiveTimer(null); };
  const handleIngredientCheck = (id, checked) =>
    setCheckedIngredients((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  const handleStepCheck = (id, checked) =>
    setCheckedSteps((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  const handleStartTimer = (minutes, stepTitle) =>
    setActiveTimer({ minutes, stepTitle, startTime: Date.now() });

  const headerActions = [
    { icon: 'Share', label: 'Condividi ricetta', onClick: handleShare },
    { icon: 'Heart', label: 'Aggiungi ai preferiti', onClick: handleToggleFavorite },
  ];

  const suggestedSubs = (effectiveIngredients || []).filter((i) => i?.substitute);

  // 🔧 Hotkey admin: ALT+SHIFT+I per impostare/rimuovere immagine → persiste su tutte le viste
  useEffect(() => {
    const onKey = (e) => {
      if (!e || !e.altKey || !e.shiftKey) return;
      if ((e.key || '').toLowerCase() !== 'i') return;
      if (!recipe?.title) return;
      const current = getRecipeImage(recipe.title, recipe.image);
      const url = window.prompt(
        'URL immagine per questa ricetta (lascia vuoto per rimuovere override):',
        current || ''
      );
      if (url === null) return;
      setRecipeImage(recipe.title, url);
      setImgTick(t => t + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [recipe?.title, recipe?.image]);

  // 🔧 Hotkeys admin: Alt+Shift+P (prezzi), Alt+Shift+N (calorie) — incolla JSON e salva in localStorage
  useEffect(() => {
    const onKey = (e) => {
      if (!e?.altKey || !e?.shiftKey) return;
      const k = (e.key || '').toLowerCase();

      if (k === 'p') {
        const txt = window.prompt('Incolla JSON prezzi (ingredientPrices)');
        if (!txt) return;
        try {
          const data = JSON.parse(txt);
          localStorage.setItem(CATALOG_KEYS.ingredientPrices, JSON.stringify(data));
          alert('Catalogo PREZZI salvato ✅');
        } catch { alert('JSON non valido'); }
        return;
      }

      if (k === 'n') {
        const txt = window.prompt('Incolla JSON calorie (ingredientNutrition)');
        if (!txt) return;
        try {
          const data = JSON.parse(txt);
          localStorage.setItem(CATALOG_KEYS.ingredientNutrition, JSON.stringify(data));
          alert('Catalogo CALORIE salvato ✅');
        } catch { alert('JSON non valido'); }
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeaderWithLogo
        showBackButton
        title={
          showIds ? (
            <span className="inline-flex items-center gap-2">
              {recipe.title}
              <span className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/30 border border-border">
                ID: {recipe.id}
              </span>
            </span>
          ) : (
            recipe.title
          )
        }
        actions={headerActions}
      />
      <main className="pt-16 pb-24 lg:pb-6 lg:pl-64">
        <div className="max-w-4xl mx-auto">
          <RecipeHero
            recipe={recipe}
            servings={servings}
            onServingsChange={handleServingsChange}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShare}
            onStartCookMode={handleStartCookMode}
          />

          <div className="p-4 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Descrizione</h2>
              <p className="text-card-foreground leading-relaxed">{recipe.description}</p>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Aggiungi al carrello solo gli ingredienti mancanti</div>
              <Button size="sm" onClick={handleAddAllMissingToCart} iconName="ShoppingCart" iconPosition="left">
                Aggiungi Mancanti
              </Button>
            </div>

            <IngredientsList
              ingredients={effectiveIngredients}
              servings={servings}
              baseServings={recipe.servings}
              checkedIngredients={checkedIngredients}
              onIngredientCheck={handleIngredientCheck}
              onAddToShoppingList={handleAddSingleToCart}
              onSubstitute={applySubstitution}
            />

            {suggestedSubs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Sostituzioni suggerite</h3>
                <div className="space-y-2">
                  {suggestedSubs.map((ing) => (
                    <div key={ing.id} className="flex items-center justify-between bg-muted/15 rounded-lg p-3">
                      <div className="text-sm">
                        <div className="font-medium">{cap(ing.name)}</div>
                        <div className="text-xs text-muted-foreground">
                          Proposta: {cap(ing.substitute.name)} — {ing.substitute.amount} {ing.substitute.unit || ing.unit}
                          {ing.substitute.note ? ` (${ing.substitute.note})` : ''}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => applySubstitution(ing.id)}>Applica</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CookingInstructions
              steps={recipe.steps}
              checkedSteps={checkedSteps}
              onStepCheck={handleStepCheck}
              onStartTimer={handleStartTimer}
            />

            <NutritionInfo nutrition={recipe.nutrition} servings={servings} baseServings={recipe.servings} />
            <CostEstimation costData={recipe.costData} servings={servings} baseServings={recipe.servings} />

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => navigate('/shopping-list-spesa')} className="kitchen-safe">
                <Icon name="ShoppingCart" size={20} className="mr-2" /> Lista Spesa
              </Button>
              <Button variant="outline" onClick={() => navigate('/recipe-collection-ricette')} className="kitchen-safe">
                <Icon name="BookOpen" size={20} className="mr-2" /> Altre Ricette
              </Button>
            </div>
          </div>
        </div>
      </main>

      <CookModeOverlay
        isOpen={isCookModeOpen}
        onClose={handleCloseCookMode}
        recipe={recipe}
        currentStep={currentCookStep}
        onStepChange={setCurrentCookStep}
      />

      <BottomTabNavigation />
      <FloatingActionButton onClick={() => setIsCookModeOpen(true)} />
    </div>
  );
};

export default RecipeDetailCookMode;

