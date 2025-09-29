// src/pages/home-dashboard-cucina-adesso/index.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';

/* ========= STORAGE KEYS ========= */
const PANTRY_KEY = 'eatrio:pantry';
const RECIPES_KEY = 'eatrio:catalog:recipes';
const PREF_MODE_KEY = 'eatrio:home:featuredMode';
const TIPS_KEY = 'eatrio:catalog:tips';
const USAGE_KEY = 'eatrio:stats:usage'; // NEW (mensile)

/* ========= IMAGE OVERRIDES (come Recipe Collection) ========= */
const __IMG_KEY = 'eatrio:recipeImages';
const __strip = (s='') => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const __rKey = (t) =>
  __strip(String(t||''))
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
const __getImg = (title, fallback) => {
  try {
    const map = JSON.parse(localStorage.getItem(__IMG_KEY) || '{}');
    return map[__rKey(title)] || fallback || '';
  } catch { return fallback || ''; }
};

/* ========= HELPERS: pantry & matching ========= */
const loadPantry = () => {
  try { const raw = localStorage.getItem(PANTRY_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
};
const keyOf = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/\b(di|del|della|dello|dei|degli|delle|al|allo|alla|ai|agli|alle|lo|la|il|i|gli|le)\b/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const ALIASES = {
  pollo: ['petto di pollo', 'cosce di pollo', 'fusi di pollo'],
  cipolla: ['cipolle', 'cipollotto'],
  pomodoro: ['pomodori', 'passata di pomodoro', 'polpa di pomodoro', 'salsa di pomodoro', 'pelati'],
  funghi: ['porcini', 'champignon', 'funghi porcini'],
  parmigiano: ['parmigiano reggiano', 'grana', 'grana padano'],
  "olio extravergine d'oliva": ['olio evo', 'olio di oliva', 'olio', 'olio extravergine di oliva'],
  basilico: ['basilico fresco'],
  riso: ['riso carnaroli', 'riso arborio', 'vialone nano'],
};
const expands = (name) => {
  const k = keyOf(name);
  const list = [k];
  Object.entries(ALIASES).forEach(([root, arr]) => {
    const rootKey = keyOf(root);
    const arrKeys = arr.map(keyOf);
    if (k === rootKey || arrKeys.includes(k)) list.push(rootKey, ...arrKeys);
  });
  return Array.from(new Set(list));
};
const nameMatches = (pantryName, ingName) => {
  const p = keyOf(pantryName);
  const candidates = expands(ingName);
  return candidates.some((c) => p.includes(c) || c.includes(p));
};
const toSameUnit = (qty, fromU, toU) => {
  const f = (fromU || '').toLowerCase();
  const t = (toU || '').toLowerCase();
  const q = Number(qty || 0);
  if (!Number.isFinite(q)) return 0;
  if (f === t) return q;
  if (f === 'g'  && t === 'kg') return q / 1000;
  if (f === 'kg' && t === 'g')  return q * 1000;
  if (f === 'ml' && t === 'l')  return q / 1000;
  if (f === 'l'  && t === 'ml') return q * 1000;
  return q;
};
const checkPantryFor = (pantry, name, needQty, needUnit) => {
  let haveQty = 0;
  pantry.forEach((p) => {
    if (nameMatches(p?.name, name)) {
      haveQty += toSameUnit(Number(p?.quantity || 0), p?.unit, needUnit);
    }
  });
  const missing = Math.max(0, (Number(needQty) || 0) - haveQty);
  return { haveQty, missingQty: missing, available: missing <= 0.0001 };
};

/* ========= UI HELPERS ========= */
const capFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const timeGreeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
};
const todayLabel = (d = new Date()) => {
  const weekday = d.toLocaleDateString('it-IT', { weekday: 'long' });
  const day = d.getDate();
  const month = d.toLocaleDateString('it-IT', { month: 'long' });
  return `${capFirst(weekday)} ${day} ${month}`;
};
const dayOfYear = () => Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

/* ========= DATA LOADING ========= */
const loadAllRecipes = () => {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    const arr = raw ? JSON.parse(raw) : null;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

/* ========= FEATURED PICKER ========= */
const MODES = [
  { key: 'dispensa', label: 'Hai tutto', icon: 'CheckCircle' },
  { key: 'veloce',   label: 'Veloce',    icon: 'Timer' },
  { key: 'light',    label: 'Light',     icon: 'Heart' },
  { key: 'budget',   label: 'Budget',    icon: 'PiggyBank' },
  { key: 'chef',     label: 'Sfiziosa',  icon: 'Sparkles' },
  { key: 'random',   label: 'Casuale',   icon: 'Shuffle' },
];
const getCalories = (r) => Number(r?.calories) || Number(r?.nutrition?.calories) || 500;
const getCost = (r) => Number(r?.estimatedCost) || Number(r?.costData?.average) || Number(r?.priceComparison?.avg) || 8.0;
const computeMatch = (recipe, pantry) => {
  const ings = recipe?.ingredients || [];
  if (ings.length === 0) return { availablePerc: 100, missingCount: 0 };
  let present = 0;
  ings.forEach((ing) => {
    const { missingQty } = checkPantryFor(pantry, ing.name, Number(ing.amount || 0), ing.unit);
    if (missingQty <= 0.0001) present += 1;
  });
  return {
    availablePerc: Math.round((present / ings.length) * 100),
    missingCount: ings.length - present,
  };
};
const pickFeatured = (recipes, pantry, mode) => {
  if (!recipes?.length) return null;
  const scored = recipes.map((r) => {
    const m = computeMatch(r, pantry);
    const t = Number(r.cookingTime) || 999;
    const cals = getCalories(r);
    const cost = getCost(r);
    const chefScore =
      (m.availablePerc / 100) * 0.6 +
      (1 - Math.min(t, 60) / 60) * 0.3 +
      (1 - Math.min(cost, 12) / 12) * 0.1;
    return { r, m, t, cals, cost, chefScore };
  });
  switch (mode) {
    case 'veloce': return scored.sort((a, b) => a.t - b.t || b.m.availablePerc - a.m.availablePerc)[0] || null;
    case 'light':  return scored.sort((a, b) => a.cals - b.cals || a.t - b.t)[0] || null;
    case 'budget': return scored.sort((a, b) => a.cost - b.cost || b.m.availablePerc - a.m.availablePerc)[0] || null;
    case 'chef':   return scored.sort((a, b) => b.chefScore - a.chefScore)[0] || null;
    case 'random': return scored[Math.floor(Math.random() * scored.length)] || null;
    case 'dispensa':
    default:       return scored.sort((a, b) => b.m.availablePerc - a.m.availablePerc || a.t - b.t)[0] || null;
  }
};

/* ========= TIPS (parlanti) + import Alt+T ========= */
const TIPS_STARTER = [
  { id: 'tip_01', text: 'Oggi prova a tenere da parte un bicchiere di acqua di cottura: il tuo sugo ti ringrazierà 😉' },
  { id: 'tip_02', text: 'Unisci frutta secca alla frutta fresca per uno snack equilibrato e super saziante.' },
  { id: 'tip_03', text: 'Salta le verdure a fiamma viva e non affollare la padella: più sapore, meno acqua.' },
  { id: 'tip_04', text: 'Hai della zucca? Una punta di rosmarino la esalta senza coprirla.' },
  { id: 'tip_05', text: 'Legumi + cereali: squadra vincente per proteine complete.' },
  { id: 'tip_06', text: 'Tosta il riso un minuto: chicchi più sodi e cremosità al top.' },
  { id: 'tip_07', text: 'Pane di ieri? Diventa crostini o pangrattato profumato in 5 minuti.' },
  { id: 'tip_08', text: 'Assaggia prima di salare: a volte basta il parmigiano per dare la spinta giusta.' },
];
const loadTips = () => {
  try {
    const raw = localStorage.getItem(TIPS_KEY);
    const arr = raw ? JSON.parse(raw) : null;
    if (Array.isArray(arr) && arr.length) return arr;
    localStorage.setItem(TIPS_KEY, JSON.stringify(TIPS_STARTER));
    return TIPS_STARTER;
  } catch { return TIPS_STARTER; }
};
const useTipsImportShortcut = (setTips) => {
  useEffect(() => {
    const onKey = (e) => {
      if (!e.altKey || e.key.toLowerCase() !== 't') return;
      const txt = window.prompt('Incolla JSON tips (array di { id, text }):');
      if (!txt) return;
      try {
        const parsed = JSON.parse(txt);
        if (!Array.isArray(parsed)) throw new Error('Non è un array');
        localStorage.setItem(TIPS_KEY, JSON.stringify(parsed));
        setTips(parsed);
        alert('Tips aggiornati!');
      } catch { alert('JSON non valido'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTips]);
};

/* ========= Stagionalità (friendly) ========= */
const SEASONAL_BY_MONTH = {
  0:  ['arance','cavolo nero','finocchi'],      1: ['broccoli','radicchio','limoni'],
  2:  ['asparagi','piselli','fragole'],         3: ['carciofi','fave','bietole'],
  4:  ['zucchine','albicocche','ciliegie'],     5: ['pomodori','melanzane','pesche'],
  6:  ['pomodori','zucchine','anguria'],        7: ['pomodori','peperoni','melone'],
  8:  ['uva','funghi porcini','pere'],          9: ['zucca','castagne','funghi'],
  10: ['cavolfiore','clementine','porri'],      11:['verza','kiwi','carote'],
};

/* ========= USAGE (ingredienti usati questo mese) ========= */
const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
};
const loadUsage = () => {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    const obj = raw ? JSON.parse(raw) : null;
    if (obj && obj.month === currentMonthKey() && obj.map) return obj;
  } catch {}
  return { month: currentMonthKey(), map: {} };
};
const saveUsage = (data) => {
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(data)); } catch {}
};
const logRecipeUsage = (recipe) => {
  const u = loadUsage();
  if (u.month !== currentMonthKey()) { u.month = currentMonthKey(); u.map = {}; }
  (recipe?.ingredients || []).forEach(ing => {
    const k = keyOf(ing?.name || ing?.ingredient_id || '');
    if (!k) return;
    u.map[k] = (u.map[k] || 0) + 1;
  });
  saveUsage(u);
};
const sortUsage = (usageMap) => {
  return Object.entries(usageMap || {})
    .map(([k, cnt]) => ({ key: k, count: cnt }))
    .sort((a, b) => b.count - a.count);
};

/* ========= HERO CARD ========= */
const HeroRecipe = ({ recipe, match, onAddMissing, onCookNow }) => {
  const imageSrc = __getImg(recipe?.title, recipe?.image);
  const badge = (recipe?.difficulty || 1) <= 1
    ? { text: 'Facile', cls: 'bg-black/65 text-white' }
    : (recipe?.difficulty === 2
        ? { text: 'Medio', cls: 'bg-black/65 text-white' }
        : { text: 'Difficile', cls: 'bg-black/65 text-white' });

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border shadow-md">
      <div className="relative aspect-[5/3] sm:aspect-[16/9]">
        <Image src={imageSrc} alt={recipe?.title} className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-black/65 text-white backdrop-blur-sm">
            {recipe?.cookingTime || 0} min
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.text}</span>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-black/65 text-white">
            {match?.availablePerc ?? 0}% dispensa
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow">{recipe?.title}</h2>
          {recipe?.description && (
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-2xl line-clamp-2">{recipe.description}</p>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3 bg-card/80 backdrop-blur">
        <Button className="col-span-2 sm:col-span-1" iconName="BookOpen" iconPosition="left" onClick={onCookNow}>
          Cucina ora
        </Button>
        <Button variant="outline" className="col-span-2 sm:col-span-1" iconName="ShoppingCart" iconPosition="left" onClick={onAddMissing}>
          Aggiungi mancanti
        </Button>
      </div>
    </div>
  );
};

/* ========= HOME ========= */
const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(() => localStorage.getItem(PREF_MODE_KEY) || 'dispensa');

  // pantry snapshot + live refresh
  const [pantryVersion, setPantryVersion] = useState(0);
  useEffect(() => {
    const recompute = () => setPantryVersion((v) => v + 1);
    const onStorage = (e) => { if (e.key === PANTRY_KEY) recompute(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const pantry = useMemo(() => loadPantry(), [pantryVersion]);

  // ricette dal catalogo; se arrivi con “suggested”, lo usi una volta
  const [recipes, setRecipes] = useState(() => loadAllRecipes());
  useEffect(() => {
    const suggested = location?.state?.suggested;
    if (Array.isArray(suggested) && suggested.length) {
      setRecipes(suggested);
      window.history.replaceState({}, document.title);
    } else {
      setRecipes(loadAllRecipes());
    }
  }, [location?.state]);

  // tips + hotkey Alt+T
  const [tips, setTips] = useState(() => loadTips());
  useTipsImportShortcut(setTips);

  // usage mensile (si aggiorna quando cucini/aggiungi mancanti da HERO)
  const [usage, setUsage] = useState(() => loadUsage());
  useEffect(() => {
    // se cambia mese resetto la vista (lazy)
    const u = loadUsage();
    setUsage(u);
  }, [pantryVersion]);

  // featured (una sola ricetta) secondo modalità
  const featured = useMemo(() => {
    const pick = pickFeatured(recipes, pantry, mode);
    return pick ? { recipe: pick.r, match: pick.m } : null;
  }, [recipes, pantry, mode]);

  const greeting = timeGreeting();
  const today = todayLabel();

  const handleSmartCTA = () => {
    if (!featured) return;
    if ((featured.match?.availablePerc || 0) === 100) {
      navigate('/recipe-detail-cook-mode', { state: { recipe: featured.recipe } });
    } else {
      const ranked = [...recipes]
        .map((r) => ({ ...r, _match: computeMatch(r, pantry) }))
        .sort((a, b) => {
          if (b._match.availablePerc !== a._match.availablePerc) return b._match.availablePerc - a._match.availablePerc;
          return (a.cookingTime || 999) - (b.cookingTime || 999);
        });
      navigate('/recipe-collection-ricette', { state: { suggested: ranked } });
    }
  };

  const enqueueCartItems = (items) => {
    try {
      const key = 'eatrio:cart:addQueue';
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([...prev, ...items]));
      window.dispatchEvent(new Event('cart-queue-added'));
    } catch {}
  };

  const handleAddMissing = () => {
    if (!featured?.recipe) return;
    // log uso ingredienti
    logRecipeUsage(featured.recipe);
    setUsage(loadUsage());

    const missing = (featured.recipe.ingredients || [])
      .map((ing) => {
        const { missingQty } = checkPantryFor(pantry, ing.name, Number(ing.amount || 0), ing.unit);
        return missingQty > 0.0001
          ? { name: ing.name, quantity: Number(missingQty.toFixed(3)), unit: ing.unit || 'pz' }
          : null;
      })
      .filter(Boolean);
    if (!missing.length) { alert('Hai già tutto in dispensa!'); return; }
    enqueueCartItems(missing);
    navigate('/shopping-list-spesa');
  };

  const handleCookNow = () => {
    if (!featured?.recipe) return;
    // log uso ingredienti
    logRecipeUsage(featured.recipe);
    setUsage(loadUsage());
    navigate('/recipe-detail-cook-mode', { state: { recipe: featured.recipe } });
  };

  useEffect(() => {
    try { localStorage.setItem(PREF_MODE_KEY, mode); } catch {}
  }, [mode]);

  /* ======== “Questo mese hai usato spesso” ======== */
  const LOW_THRESHOLDS = { g: 120, ml: 120, pz: 1, kg: 0.2, l: 0.2 };
  const defaultReplenish = (unit) => {
    const u = (unit || '').toLowerCase();
    if (u === 'g' || u === 'kg') return { quantity: 500, unit: 'g' };
    if (u === 'ml' || u === 'l') return { quantity: 500, unit: 'ml' };
    return { quantity: 1, unit: 'pz' };
  };

  // ordina per uso mensile, poi mostra rimanenza reale (solo se l’ingrediente esiste in dispensa)
  const topUsedWithStock = useMemo(() => {
    const sorted = sortUsage(usage.map || {});
    const out = [];
    for (const { key: k, count } of sorted) {
      const pantryItem = (pantry || []).find(p => nameMatches(p?.name, k));
      if (!pantryItem) continue; // mostra solo quelli che hai davvero in dispensa
      const u = (pantryItem.unit || 'pz').toLowerCase();
      const q = Number(pantryItem.quantity || 0);
      const th = LOW_THRESHOLDS[u] ?? 1;
      out.push({
        displayName: pantryItem.name,
        key: k,
        count,
        unit: u,
        quantity: q,
        low: q <= th,
        threshold: th,
      });
      if (out.length >= 5) break;
    }
    return out;
  }, [usage, pantry]);

  const addOneToCart = (item) => {
    const { quantity, unit } = defaultReplenish(item.unit);
    enqueueCartItems([{ name: item.displayName, quantity, unit }]);
    navigate('/shopping-list-spesa');
  };

  /* ======== Stagionali friendly ======== */
  const seasonal = useMemo(() => {
    const m = new Date().getMonth();
    return SEASONAL_BY_MONTH[m] || [];
  }, []);

  /* ======== Tip del Giorno ======== */
  const tipOfTheDay = useMemo(() => {
    if (!tips?.length) return null;
    const idx = dayOfYear() % tips.length;
    return tips[idx];
  }, [tips]);

  return (
    <div className="min-h-screen bg-background">
      <HeaderWithLogo motto="Pianifica. Cucina. Risparmia." />

      <main className="pt-20 sm:pt-16 pb-24 lg:pb-8 lg:pl-64">
        {/* Saluto compatto */}
        <section className="px-4 pt-2">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">{today}</p>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold text-card-foreground leading-snug">
              {greeting}! Cosa cuciniamo oggi?
            </h1>
          </div>
        </section>

        {/* Selettore modalità (pill) + CTA “Scegli per me” */}
        <section className="px-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => {
              const active = mode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={[
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/20 text-muted-foreground border-border hover:bg-muted/40 hover:text-foreground',
                  ].join(' ')}
                  title={m.label}
                >
                  <span className="inline-flex items-center gap-1">
                    <Icon name={m.icon} size={16} />
                    {m.label}
                  </span>
                </button>
              );
            })}
            <div className="ml-auto">
              <Button
                size="sm"
                variant="outline"
                iconName="Sparkles"
                iconPosition="left"
                onClick={handleSmartCTA}
                title="Scegli per me"
              >
                Scegli per me
              </Button>
            </div>
          </div>
        </section>

        {/* Unica ricetta in evidenza */}
        <section className="px-4 mt-4">
          {featured ? (
            <HeroRecipe
              recipe={featured.recipe}
              match={featured.match}
              onAddMissing={handleAddMissing}
              onCookNow={handleCookNow}
            />
          ) : (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <Icon name="Info" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-3" />
              <p className="text-muted-foreground">Nessuna ricetta nel catalogo. Vai su “Ricette” e importa con Alt+R.</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => navigate('/recipe-collection-ricette')}>
                  Vai alle Ricette
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* ======== “Questo mese hai usato spesso” (caldo e utile) ======== */}
        <section className="px-4 mt-5">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-base font-semibold text-card-foreground">
              Questo mese hai usato spesso:
            </h3>

            {topUsedWithStock.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">
                Appena inizi. Cucina una ricetta e ti aiuto a tenere d’occhio gli ingredienti che ami di più 💛
              </p>
            ) : (
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {topUsedWithStock.map((it, idx) => {
                  const ratio = it.threshold > 0 ? Math.min(1, it.quantity / it.threshold) : 1;
                  return (
                    <div key={idx} className="flex items-center gap-3 bg-muted/10 border border-border rounded-lg p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{it.displayName}</span>
                          <span className="text-xs text-muted-foreground">×{it.count}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 w-28 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${Math.max(8, ratio*100)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            rimasti: {Math.round(it.quantity*100)/100} {it.unit}
                          </span>
                        </div>
                      </div>
                      {it.low ? (
                        <Button size="sm" variant="outline" onClick={() => addOneToCart(it)}>
                          Rifornisci
                        </Button>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-success/15 text-success border border-success/30">
                          Sei a posto
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ======== Stagionali (copy caldo) ======== */}
        <section className="px-4 mt-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-base font-semibold text-card-foreground">
              Ecco alcuni alimenti di stagione che potresti usare:
            </h3>
            {seasonal.length ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {seasonal.slice(0, 6).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => navigate('/recipe-collection-ricette')}
                    className="px-3 py-1.5 rounded-full text-sm border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                    title={`Cerca ricette con ${s}`}
                  >
                    {capFirst(s)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">Suggerimenti stagionali non disponibili.</p>
            )}
          </div>
        </section>

        {/* ======== Tip del giorno (parlante) ======== */}
        <section className="px-4 mt-4">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <Icon name="Info" size={20} />
            <div className="flex-1">
              <p className="text-sm text-card-foreground">
                {tipOfTheDay?.text || 'Aggiungi i tuoi tips con Alt+T: li mostreremo qui, uno al giorno.'}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/recipe-collection-ricette')}>
              Ispirami
            </Button>
          </div>
        </section>
      </main>

      <BottomTabNavigation />
      <FloatingActionButton onClick={() => navigate('/recipe-collection-ricette')} />
    </div>
  );
};

export default HomePage;
