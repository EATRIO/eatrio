import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';

/* =========================
   HELPERS: dispensa & match
   ========================= */
const loadPantry = () => {
  try {
    const raw = localStorage.getItem('eatrio:pantry');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// normalizza per matching
const keyOf = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/\b(di|del|della|dello|dei|degli|delle|al|allo|alla|ai|agli|alle|lo|la|il|i|gli|le)\b/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const ALIASES = {
  pollo: ['petto di pollo', 'cosce di pollo', 'fusi di pollo'],
  cipolla: ['cipolle'],
  pomodoro: ['pomodori', 'passata di pomodoro', 'polpa di pomodoro', 'salsa di pomodoro'],
  funghi: ['porcini', 'champignon', 'funghi porcini'],
  parmigiano: ['parmigiano reggiano', 'grana padano'],
  olio: ["olio extravergine d'oliva", 'olio evo', 'olio di oliva'],
  basilico: ['basilico fresco'],
};

const expands = (name) => {
  const k = keyOf(name);
  const list = [k];
  Object.entries(ALIASES).forEach(([root, arr]) => {
    if (k === keyOf(root) || arr.map(keyOf).includes(k)) {
      list.push(keyOf(root), ...arr.map(keyOf));
    }
  });
  return Array.from(new Set(list));
};

const nameMatches = (pantryName, ingName) => {
  const p = keyOf(pantryName);
  const candidates = expands(ingName);
  return candidates.some((c) => p.includes(c) || c.includes(p));
};

// unit convert (g↔kg, ml↔l)
const toSameUnit = (qty, fromU, toU) => {
  const f = (fromU || '').toLowerCase();
  const t = (toU || '').toLowerCase();
  if (f === t) return qty;
  if (f === 'g' && t === 'kg') return qty / 1000;
  if (f === 'kg' && t === 'g') return qty * 1000;
  if (f === 'ml' && t === 'l') return qty / 1000;
  if (f === 'l' && t === 'ml') return qty * 1000;
  return qty;
};

const checkPantryFor = (pantry, name, needQty, needUnit) => {
  let haveQty = 0;
  pantry.forEach((p) => {
    if (nameMatches(p?.name, name)) {
      haveQty += toSameUnit(Number(p?.quantity || 0), p?.unit, needUnit);
    }
  });
  const missing = Math.max(0, (Number(needQty) || 0) - haveQty);
  return { haveQty, missingQty: missing };
};

// coda → Carrello (senza prezzi!)
const enqueueCartItems = (items) => {
  try {
    const key = 'eatrio:cart:addQueue';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...prev, ...items]));
  } catch {}
};

/* =========================
   HELPERS: UI
   ========================= */
const capFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const capWords = (s) =>
  (s || '')
    .toString()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');

const formatItDate = (d) => {
  const dt = d || new Date();
  const weekday = dt.toLocaleDateString('it-IT', { weekday: 'long' });
  const day = dt.getDate();
  const month = dt.toLocaleDateString('it-IT', { month: 'long' });
  return `${capFirst(weekday)} ${day} ${month}`;
};

/* =========================
   DATI DEMO RICETTE HOME
   ========================= */
const homeRecipes = [
  {
    id: 101,
    title: 'Pasta al Pomodoro',
    image:
      'https://plus.unsplash.com/premium_photo-1674511582428-58ce834ce172?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    cookingTime: 20,
    servings: 2,
    difficulty: 1,
    description: 'Classico piatto veloce con passata, basilico e olio EVO.',
    ingredients: [
      { name: 'Spaghetti', amount: 200, unit: 'g' },
      { name: 'Passata di pomodoro', amount: 300, unit: 'g' },
      { name: "Olio Extravergine d'Oliva", amount: 20, unit: 'ml' },
      { name: 'Basilico', amount: 1, unit: 'mazzo' },
      { name: 'Sale', amount: 5, unit: 'g' },
    ],
  },
  {
    id: 102,
    title: 'Risotto ai Funghi Porcini',
    image:
      'https://plus.unsplash.com/premium_photo-1694850980302-f568e6de0f6d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    cookingTime: 35,
    servings: 2,
    difficulty: 2,
    description: 'Cremoso con porcini, brodo e mantecatura al burro.',
    ingredients: [
      { name: 'Riso Carnaroli', amount: 180, unit: 'g' },
      { name: 'Funghi Porcini', amount: 200, unit: 'g' },
      { name: 'Brodo vegetale', amount: 0.8, unit: 'l' },
      { name: 'Cipolla', amount: 1, unit: 'pz' },
      { name: 'Burro', amount: 30, unit: 'g' },
      { name: 'Parmigiano', amount: 40, unit: 'g' },
      { name: 'Vino bianco', amount: 50, unit: 'ml' },
    ],
  },
  {
    id: 103,
    title: 'Pollo alla Cacciatora',
    image:
      'https://plus.unsplash.com/premium_photo-1723575734758-97e6e862a670?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    cookingTime: 45,
    servings: 3,
    difficulty: 2,
    description: 'Con passata, olive, cipolla e alloro.',
    ingredients: [
      { name: 'Pollo', amount: 1, unit: 'kg' },
      { name: 'Passata di pomodoro', amount: 400, unit: 'g' },
      { name: 'Olive', amount: 120, unit: 'g' },
      { name: 'Cipolla', amount: 1, unit: 'pz' },
      { name: 'Olio EVO', amount: 30, unit: 'ml' },
      { name: 'Alloro', amount: 2, unit: 'pz' },
      { name: 'Sale', amount: 6, unit: 'g' },
    ],
  },
  {
    id: 104,
    title: 'Zuppa di Lenticchie',
    image:
      'https://plus.unsplash.com/premium_photo-1712678665862-3c51d1fac466?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    cookingTime: 40,
    servings: 2,
    difficulty: 1,
    description: 'Lenticchie, odori e brodo vegetale. Comfort food.',
    ingredients: [
      { name: 'Lenticchie secche', amount: 200, unit: 'g' },
      { name: 'Carota', amount: 1, unit: 'pz' },
      { name: 'Sedano', amount: 1, unit: 'pz' },
      { name: 'Cipolla', amount: 1, unit: 'pz' },
      { name: 'Passata di pomodoro', amount: 200, unit: 'g' },
      { name: 'Brodo vegetale', amount: 0.8, unit: 'l' },
      { name: 'Olio EVO', amount: 20, unit: 'ml' },
      { name: 'Sale', amount: 5, unit: 'g' },
    ],
  },
];

/* =========================
   COMPONENTE: Card Ricetta
   ========================= */
const RecipeCard = ({ recipe, onAddMissing, onCookNow }) => {
  const pantry = loadPantry();

  // calcolo % disponibilità
  const { availablePerc, missingCount } = useMemo(() => {
    const ings = recipe?.ingredients || [];
    if (ings.length === 0) return { availablePerc: 100, missingCount: 0 };

    let present = 0;
    let missing = 0;

    ings.forEach((ing) => {
      const { missingQty } = checkPantryFor(
        pantry,
        ing.name,
        Number(ing.amount || 0),
        ing.unit
      );
      if (missingQty > 0.0001) missing += 1;
      else present += 1;
    });

    const perc = Math.round((present / ings.length) * 100);
    return { availablePerc: perc, missingCount: missing };
  }, [recipe, pantry]);

  const diffBadge = (d) => {
    if (d <= 1) return { text: 'Facile', cls: 'text-success' };
    if (d === 2) return { text: 'Medio', cls: 'text-warning' };
    return { text: 'Difficile', cls: 'text-error' };
  };
  const db = diffBadge(recipe?.difficulty || 1);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-150">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe?.image}
          alt={recipe?.title}
          className="w-full h-full object-cover object-center"
        />
        {/* pillole overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-black/65 text-white backdrop-blur-sm">
            {recipe?.cookingTime} min
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-black/65 text-white ${db.cls}`}>
            {db.text}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-black/65 text-white backdrop-blur-sm">
          {availablePerc}% disponibile
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-card-foreground line-clamp-2">
          {capWords(recipe?.title)}
        </h3>
        {recipe?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {missingCount > 0 ? (
            <span className="text-xs px-2 py-1 rounded-full bg-warning/15 text-warning border border-warning/30">
              Mancano {missingCount} ingredienti
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-success/15 text-success border border-success/30">
              Hai tutto
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            className="w-full sm:w-auto"
            iconName="BookOpen"
            iconPosition="left"
            onClick={onCookNow}
          >
            Cucina ora
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            iconName="ShoppingCart"
            iconPosition="left"
            onClick={onAddMissing}
          >
            Aggiungi mancanti
          </Button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   HOME PAGE
   ========================= */
const HomePage = () => {
  const navigate = useNavigate();

  const handleAddMissing = (recipe) => {
    const pantry = loadPantry();
    const missing = (recipe?.ingredients || [])
      .map((ing) => {
        const { missingQty } = checkPantryFor(
          pantry,
          ing.name,
          Number(ing.amount || 0),
          ing.unit
        );
        return missingQty > 0.0001
          ? { name: ing.name, quantity: missingQty, unit: ing.unit || 'pz' }
          : null;
      })
      .filter(Boolean);

    if (missing.length === 0) {
      alert('Hai già tutto in dispensa per questa ricetta!');
      return;
    }

    enqueueCartItems(missing);
    navigate('/shopping-list-spesa'); // vai a vedere il carrello
  };

  const handleCookNow = (recipe) => {
    navigate('/recipe-detail-cook-mode', { state: { recipe } });
  };

  const today = formatItDate(new Date());

  return (
    <div className="min-h-screen bg-background">
      <HeaderWithLogo title="Cucina adesso" />

      <main className="pt-16 pb-24 lg:pb-8 lg:pl-64">
        {/* Hero saluto + data */}
        <section className="px-4 pt-4">
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{today}</p>
              <h1 className="mt-1 text-2xl font-bold text-card-foreground">
                Ciao! Cosa cuciniamo oggi? 👩‍🍳
              </h1>
            </div>
            <div className="hidden md:block opacity-80">
              <Icon name="ChefHat" size={40} color="var(--color-primary)" />
            </div>
          </div>
        </section>

        {/* Sezione suggerimenti */}
        <section className="px-4 mt-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Ricette consigliate
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {homeRecipes.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onAddMissing={() => handleAddMissing(r)}
                onCookNow={() => handleCookNow(r)}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomTabNavigation />
      <FloatingActionButton onClick={() => navigate('/recipe-collection-ricette')} />
    </div>
  );
};

export default HomePage;
