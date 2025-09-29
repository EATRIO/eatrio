// src/pages/shopping-list-spesa/index.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderWithLogo from '../../components/ui/HeaderWithLogo';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { Checkbox } from '../../components/ui/Checkbox';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

/* ===================== CATALOGO PREZZI (DEFAULT) ===================== */
// chiavi tutte in snake_case e lowercase
const DEFAULT_INGREDIENT_PRICE_CATALOG = {
  pollo: { unitBase: 'kg', avg: 6.8, retailers: { coop: 6.7, conad: 6.5, esselunga: 7.0 } },
  passata_di_pomodoro: { unitBase: 'kg', avg: 2.4, retailers: { coop: 2.3, conad: 2.5, esselunga: 2.4 } },
  olive_verdi: { unitBase: 'kg', avg: 7.9, retailers: { coop: 7.7, conad: 7.5, esselunga: 8.2 } },
  cipolla: { unitBase: 'pz', avg: 0.45, retailers: { coop: 0.4, conad: 0.42, esselunga: 0.5 } },
  olio_extravergine: { unitBase: 'l', avg: 6.5, retailers: { coop: 6.3, conad: 6.2, esselunga: 6.8 } },
  alloro: { unitBase: 'pz', avg: 0.1, retailers: { coop: 0.1, conad: 0.1, esselunga: 0.12 } },

  spaghetti: { unitBase: 'kg', avg: 1.6, retailers: { coop: 1.5, conad: 1.6, esselunga: 1.7 } },
  guanciale: { unitBase: 'kg', avg: 14.5, retailers: { coop: 14.0, conad: 14.2, esselunga: 15.0 } },
  uova: { unitBase: 'pz', avg: 0.28, retailers: { coop: 0.26, conad: 0.27, esselunga: 0.30 } },
  pecorino_romano: { unitBase: 'kg', avg: 18.0, retailers: { coop: 17.5, conad: 17.8, esselunga: 18.5 } },

  riso_carnaroli: { unitBase: 'kg', avg: 3.2, retailers: { coop: 3.1, conad: 3.2, esselunga: 3.3 } },
  funghi_porcini: { unitBase: 'kg', avg: 22.0, retailers: { coop: 21.0, conad: 21.5, esselunga: 23.0 } },
  brodo_vegetale: { unitBase: 'l', avg: 1.2, retailers: { coop: 1.1, conad: 1.2, esselunga: 1.3 } },
  burro: { unitBase: 'kg', avg: 9.0, retailers: { coop: 8.8, conad: 8.9, esselunga: 9.2 } },
  parmigiano: { unitBase: 'kg', avg: 19.5, retailers: { coop: 19.0, conad: 19.2, esselunga: 20.0 } },
  vino_bianco: { unitBase: 'l', avg: 3.0, retailers: { coop: 2.8, conad: 2.9, esselunga: 3.2 } },

  lenticchie_secche: { unitBase: 'kg', avg: 2.1, retailers: { coop: 2.0, conad: 2.1, esselunga: 2.2 } },
  carota: { unitBase: 'pz', avg: 0.18, retailers: { coop: 0.16, conad: 0.17, esselunga: 0.20 } },
  sedano: { unitBase: 'pz', avg: 1.2, retailers: { coop: 1.1, conad: 1.1, esselunga: 1.3 } },
  farina_00: { unitBase: 'kg', avg: 1.3, retailers: { coop: 1.2, conad: 1.3, esselunga: 1.4 } },
  zucchero: { unitBase: 'kg', avg: 1.1, retailers: { coop: 1.0, conad: 1.1, esselunga: 1.2 } },
  lievito_dolci: { unitBase: 'kg', avg: 16.0, retailers: { coop: 15.5, conad: 15.8, esselunga: 16.5 } },

  pomodoro: { unitBase: 'kg', avg: 2.8, retailers: { coop: 2.6, conad: 2.7, esselunga: 3.0 } },
  mozzarella: { unitBase: 'pz', avg: 0.95, retailers: { coop: 0.9, conad: 0.95, esselunga: 1.0 } },
  basilico: { unitBase: 'pz', avg: 1.2, retailers: { coop: 1.1, conad: 1.2, esselunga: 1.3 } },
  pomodori_pelati: { unitBase: 'kg', avg: 2.2, retailers: { coop: 2.1, conad: 2.2, esselunga: 2.3 } },
};

// Seed + normalizzazione/merge del catalogo (anche se esiste già)
(function ensureCatalog() {
  try {
    const key = 'eatrio:catalog:ingredientPrices';
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : {};

    // 1) normalizza chiavi già presenti a snake_case lowercase
    const norm = {};
    Object.entries(existing).forEach(([k, v]) => {
      const nk = String(k).toLowerCase().replace(/\s+/g, '_');
      norm[nk] = v;
    });

    // 2) merge-in dei default
    Object.entries(DEFAULT_INGREDIENT_PRICE_CATALOG).forEach(([k, v]) => {
      const nk = String(k).toLowerCase().replace(/\s+/g, '_');
      norm[nk] = { ...(norm[nk] || {}), ...v };
    });

    localStorage.setItem(key, JSON.stringify(norm));
    console.info('[CAT] catalogo normalizzato/aggiornato:', Object.keys(norm));
  } catch { /* ignore */ }
})();

/* ===================== UTIL ===================== */
const capWords = (s) =>
  (s || '')
    .toString()
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');

const num = (v) => (typeof v === 'number' ? v : parseFloat(v) || 0);
const formatEuro = (v) => num(v).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

// Mostra “€ X /kg” (senza doppio “€”)
const perUnitDisplay = (unitPrice, unit) => {
  const u = (unit || '').toLowerCase();
  if (u === 'g') return { label: '/kg', value: unitPrice * 1000 };
  if (u === 'kg') return { label: '/kg', value: unitPrice };
  if (u === 'ml') return { label: '/l', value: unitPrice * 1000 };
  if (u === 'l') return { label: '/l', value: unitPrice };
  return { label: `/${u || 'pz'}`, value: unitPrice };
};

const STORAGE_KEYS = {
  cart: 'eatrio:cart',
  market: 'eatrio:market',
  search: 'eatrio:cart:search',
  addQueue: 'eatrio:cart:addQueue',
};

const CATALOG_KEYS = {
  ingredientPrices: 'eatrio:catalog:ingredientPrices',
};

const stripAccents = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const normalizeKey = (s) =>
  stripAccents(String(s || ''))
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Alias: devono combaciare con gli ID nel catalogo */
const NAME_ALIASES = {
  olio_extravergine: ['olio evo','olio extravergine di oliva','olio extravergine d oliva','extravergine','olio di oliva','olio'],
  passata_di_pomodoro: ['passata','salsa di pomodoro','polpa di pomodoro','pomodori pelati','pelati'],
  olive_verdi: ['olive','olive verdi','olive denocciolate'],
  olive_nere: ['olive nere'],
  cipolla: ['cipolle','cipollotto','cipollotti'],
  pollo: ['petto di pollo','cosce di pollo','fusi di pollo'],
  spaghetti: ['spaghetti n.5','pasta spaghetti','spaghetto','spaghetti'],
  pecorino_romano: ['pecorino'],
  parmigiano: ['parmigiano reggiano','grana','grana padano'],
  riso_carnaroli: ['riso','riso arborio','arborio','vialone nano','riso carnaroli'],
  funghi_porcini: ['porcini','funghi porcini','porcino'],
  brodo_vegetale: ['brodo','brodo vegetale'],
  burro: ['burro'],
  vino_bianco: ['vino','vino bianco','vino da cucina'],
  lenticchie_secche: ['lenticchie','lenticchie secche'],
  carota: ['carote','carota'],
  sedano: ['sedano'],
  farina_00: ['farina','farina 00'],
  zucchero: ['zucchero'],
  lievito_dolci: ['lievito per dolci','lievito'],
  mozzarella: ['mozzarella','mozzarella di bufala'],
  basilico: ['basilico'],
  pomodori_pelati: ['pelati','pomodori pelati','pomodori in scatola'],
  pomodoro: ['pomodoro','pomodori'],
  guanciale: ['guanciale'],
  alloro: ['alloro'],
};

const resolveIngredientId = (name) => {
  const norm = normalizeKey(name);
  for (const [id, aliases] of Object.entries(NAME_ALIASES)) {
    const idAsWords = id.replace(/_/g, ' ');
    if (norm === idAsWords) return id;
    if (aliases.some((a) => normalizeKey(a) === norm)) return id;
  }
  return null;
};

const loadJSON = (k, fallback) => {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
};
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* Prezzo per unità base (kg|l|pz) → prezzo per unità della riga (kg|g|l|ml|pz|conf...) */
const convertUnitPrice = (pricePerBase, base, targetUnit) => {
  if (!Number.isFinite(pricePerBase)) return null;
  const b = (base || '').toLowerCase();
  const t = (targetUnit || '').toLowerCase();

  if (b === 'kg') {
    if (t === 'kg') return pricePerBase;
    if (t === 'g')  return pricePerBase / 1000;
    return null;
  }
  if (b === 'l') {
    if (t === 'l')  return pricePerBase;
    if (t === 'ml') return pricePerBase / 1000;
    if (t === 'cl') return pricePerBase / 100;
    return null;
  }
  if (b === 'pz') {
    if (['pz','pezzo','pezzi','uovo','uova'].includes(t)) return pricePerBase;
    return null;
  }
  return null;
};

const perUnitPricesFromCatalog = (ingredientId, unit, catalog) => {
  const info = catalog?.[ingredientId];
  if (!info) return null;
  const base = (info.unitBase || '').toLowerCase(); // 'kg'|'l'|'pz'
  const mk = info.retailers || {};
  const avg = Number(info.avg);

  const pAVG   = convertUnitPrice(Number.isFinite(avg) ? avg : null, base, unit);
  const pCoop  = convertUnitPrice(Number(mk.coop),       base, unit);
  const pConad = convertUnitPrice(Number(mk.conad),      base, unit);
  const pEssel = convertUnitPrice(Number(mk.esselunga),  base, unit);

  return {
    AVG:   pAVG  ?? null,
    Coop:  pCoop ?? (pAVG ?? null),
    Conad: pConad?? (pAVG ?? null),
    Essel: pEssel?? (pAVG ?? null),
  };
};

const fallbackPricesByUnit = (unit) => {
  const u = (unit || '').toLowerCase();
  if (u === 'kg' || u === 'l') {
    const base = 6;
    return { AVG: base, Coop: +(base * 0.98).toFixed(2), Conad: +(base * 0.95).toFixed(2), Essel: +(base * 1.05).toFixed(2) };
  }
  if (u === 'g' || u === 'ml') {
    const base = 0.006;
    return { AVG: base, Coop: +(base * 0.98).toFixed(4), Conad: +(base * 0.95).toFixed(4), Essel: +(base * 1.05).toFixed(4) };
  }
  const base = 2.5; // pz/conf
  return { AVG: base, Coop: +(base * 0.98).toFixed(2), Conad: +(base * 0.95).toFixed(2), Essel: +(base * 1.05).toFixed(2) };
};

/** Calcola il blocco prezzi corretto per UNA riga (preferendo catalogo) */
const computePricesForItem = (item, catalog) => {
  const unit = (item?.unit || 'pz').toLowerCase();

  // 1) prova con ingredientId passato o risolto da nome
  const rawId = item?.ingredientId || resolveIngredientId(item?.name);
  const id = rawId ? normalizeKey(rawId).replace(/ /g, '_') : null;

  // 2) fallback: snake_case del nome
  const fallbackSnake = normalizeKey(item?.name).replace(/ /g, '_');

  // 3) ID finale da usare
  const lookupId = (id && catalog?.[id]) ? id : (catalog?.[fallbackSnake] ? fallbackSnake : null);

  if (lookupId && catalog?.[lookupId]) {
    const byMarket = perUnitPricesFromCatalog(lookupId, unit, catalog);
    const usable = byMarket && !Object.values(byMarket).every((v) => v == null);
    if (usable) {
      return {
        prices: {
          AVG: byMarket.AVG ?? 0,
          Coop: byMarket.Coop ?? byMarket.AVG ?? 0,
          Conad: byMarket.Conad ?? byMarket.AVG ?? 0,
          Essel: byMarket.Essel ?? byMarket.AVG ?? 0,
        },
        ingredientId: lookupId,
      };
    }
  }

  // Nessun match col catalogo → fallback generico
  console.log('[PRICE FALLBACK]', { name: item?.name, rawId, triedId: id, fallbackSnake });
  return { prices: fallbackPricesByUnit(unit), ingredientId: lookupId || item?.ingredientId || null };
};

/* ===================== PAGINA ===================== */
const CarrelloSpesa = () => {
  const navigate = useNavigate();
  const [selectedMarket, setSelectedMarket] = useState(() => loadJSON(STORAGE_KEYS.market, 'AVG'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => loadJSON(STORAGE_KEYS.search, ''));

  const markets = {
    AVG:  { label: 'AVG',  fullName: 'Media' },
    Coop: { label: 'Coop', fullName: 'Coop' },
    Conad:{ label: 'Conad',fullName: 'Conad' },
    Essel:{ label: 'Essel',fullName: 'Esselunga' },
  };

  const [shoppingItems, setShoppingItems] = useState(() => loadJSON(STORAGE_KEYS.cart, []));
  const ingredientPricesCatalog = useMemo(
    () => loadJSON(CATALOG_KEYS.ingredientPrices, {}),
    []
  );

  useEffect(() => {
    document.body.style.overflow = showAddModal ? 'hidden' : '';
  }, [showAddModal]);

  useEffect(() => { saveJSON(STORAGE_KEYS.cart, shoppingItems); }, [shoppingItems]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.market, selectedMarket); }, [selectedMarket]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.search, searchQuery); }, [searchQuery]);

  /* ===== MERGE addQueue -> cart (calcolo prezzi dal catalogo!) ===== */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.addQueue);
      const queue = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(queue) || queue.length === 0) return;

      const normalized = queue.map((q, idx) => {
        const unit = (q.unit || 'pz').toLowerCase();
        const base = {
          id: `q_${Date.now()}_${idx}`,
          name: q.name,
          quantity: Number(q.quantity) || 1,
          unit,
          checked: false,
          fromRecipe: q.fromRecipe || undefined,
          dateAdded: new Date().toISOString(),
          ingredientId: q.ingredientId || undefined,
        };
        const computed = computePricesForItem(base, ingredientPricesCatalog);
        return { ...base, ...computed };
      });

      setShoppingItems((prev) => [...prev, ...normalized]);
      localStorage.removeItem(STORAGE_KEYS.addQueue);
    } catch (e) {
      console.log('merge addQueue error', e);
    }
  }, [ingredientPricesCatalog]);

  /* ===== RICONCILIAZIONE: se qualcosa è rimasto con fallback, ricalcola col catalogo ===== */
  useEffect(() => {
    if (!shoppingItems?.length) return;
    const updated = shoppingItems.map((it) => {
      const computed = computePricesForItem(it, ingredientPricesCatalog);
      const changed =
        JSON.stringify(computed.prices) !== JSON.stringify(it.prices) ||
        (!!computed.ingredientId && computed.ingredientId !== it.ingredientId);
      return changed ? { ...it, ...computed } : it;
    });
    const changedAny = JSON.stringify(updated) !== JSON.stringify(shoppingItems);
    if (changedAny) setShoppingItems(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ingredientPricesCatalog]); // una volta al mount (catalog memo)

  /* ===== Stato aggiunta manuale ===== */
  const [newItem, setNewItem] = useState({ name: '', quantity: '1', unit: 'pz', estimatedPrice: '' });

  /* ===== Totali ===== */
  const calculateTotals = () => {
    const totals = {};
    Object.keys(markets).forEach((market) => {
      totals[market] = shoppingItems
        .filter((item) => !item?.checked)
        .reduce((sum, item) => {
          const pricePerUnit = num(item?.prices?.[market] ?? item?.prices?.AVG ?? 0);
          const q = num(item?.quantity);
          return sum + pricePerUnit * q;
        }, 0);
    });
    return totals;
  };
  const totalCosts = calculateTotals();
  const currentTotal = totalCosts?.[selectedMarket] || 0;
  const averageTotal = totalCosts?.AVG || 0;
  const delta = selectedMarket !== 'AVG' ? currentTotal - averageTotal : 0;

  const normalizedSearch = (searchQuery || '').toLowerCase();
  const filteredItems = shoppingItems.filter(
    (item) =>
      (item?.name || '').toLowerCase().includes(normalizedSearch) ||
      (item?.fromRecipe || '').toLowerCase().includes(normalizedSearch)
  );

  const completedItems = shoppingItems.filter((i) => i?.checked).length;
  const totalItems = shoppingItems.length;

  const validatePrice = (price) => {
    const n = parseFloat(price);
    if (Number.isNaN(n) || n < 0.0005 || n > 100) {
      return 'Prezzo fuori range — inserisci un valore realistico';
    }
    return null;
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className =
      'fixed top-20 left-1/2 transform -translate-x-1/2 bg-success text-white px-4 py-2 rounded-lg shadow-lg z-[1100]';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { try { document.body.removeChild(toast); } catch {} }, 3000);
  };

  const mockPantryUpsert = (item) => {
    console.log('Mock pantry upsert:', {
      ingredient_id: (item?.ingredientId || (item?.name || '').toLowerCase().replace(/\s+/g, '_')),
      quantity: item?.quantity,
      unit: item?.unit,
      operation: 'increase',
    });
  };

  /* ===== Handlers ===== */
  const handleItemToggle = (itemId, valueOrEvent) => {
    const nextChecked =
      typeof valueOrEvent === 'boolean' ? valueOrEvent : !!valueOrEvent?.target?.checked;

    const target = shoppingItems.find((i) => i?.id === itemId);

    setShoppingItems((prev) =>
      prev.map((it) => (it?.id === itemId ? { ...it, checked: nextChecked } : it))
    );

    if (nextChecked && target) {
      showToast(`${target?.name} aggiunto in dispensa`);
      mockPantryUpsert(target);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    const q = Math.max(0.1, parseFloat(newQuantity) || 0.1);
    setShoppingItems((prev) =>
      prev.map((it) => (it?.id === itemId ? { ...it, quantity: q } : it))
    );
  };

  const handlePriceOverride = (itemId, newPrice) => {
    const msg = validatePrice(newPrice);
    if (msg) return alert(msg);
    setShoppingItems((prev) =>
      prev.map((it) =>
        it?.id === itemId
          ? {
              ...it,
              prices: { ...it?.prices, [selectedMarket]: parseFloat(newPrice) },
              priceOverridden: true,
            }
          : it
      )
    );
  };

  const handleDeleteItem = (itemId) => {
    setShoppingItems((prev) => prev.filter((it) => it?.id !== itemId));
  };

  const handleAddItem = () => {
    if (!newItem?.name?.trim()) return;
    const msg = newItem?.estimatedPrice ? validatePrice(newItem?.estimatedPrice) : null;
    if (msg) return alert(msg);

    const base = {
      id: Date.now().toString(),
      name: newItem?.name?.trim(),
      quantity: parseFloat(newItem?.quantity) || 1,
      unit: (newItem?.unit || 'pz').toLowerCase(),
      checked: false,
      addedManually: true,
      dateAdded: new Date().toISOString(),
    };
    const computed = computePricesForItem(base, ingredientPricesCatalog);
    const item = { ...base, ...computed };

    setShoppingItems((prev) => [...prev, item]);
    setNewItem({ name: '', quantity: '1', unit: 'pz', estimatedPrice: '' });
    setShowAddModal(false);
  };

  const handleAddMissingFromRecipe = () => {
    alert('Apri una ricetta e usa “Aggiungi mancanti” per inserire automaticamente gli ingredienti.');
  };

  const handleClearCompleted = () => {
    setShoppingItems((prev) => prev.filter((it) => !it?.checked));
  };

  const headerActions = [
    { icon: 'Search', label: 'Cerca articoli', onClick: () => document.getElementById('search-input')?.focus() },
    { icon: 'Plus',   label: 'Aggiungi articolo', onClick: () => setShowAddModal(true) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeaderWithLogo title="Carrello" motto="Pianifica. Cucina. Risparmia." variant="solid" actions={headerActions} />

      {/* Search Bar */}
      <div className="fixed top-16 left-0 right-0 z-[90] bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="relative">
            <Icon
              name="Search"
              size={20}
              color="var(--color-muted-foreground)"
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              id="search-input"
              type="text"
              placeholder="Cerca articoli o ricette..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Icon name="X" size={16} color="var(--color-muted-foreground)" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Market Selector */}
      <div className="fixed top-36 left-0 right-0 z-80 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Selettore Mercato:</span>
            <div className="grid grid-cols-4 gap-2 w-full max-w-md ml-3">
              {Object.entries(markets).map(([key, market]) => (
                <button
                  key={key}
                  onClick={() => setSelectedMarket(key)}
                  className={[
                    'w-full px-2 py-1.5 rounded-lg',
                    'text-[13px] font-medium transition-all',
                    selectedMarket === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  ].join(' ')}
                  title={market.fullName}
                >
                  {market.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-[200px] pb-[220px]">
        <div className="px-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-lg p-4 text-center border border-border">
              <p className="text-2xl font-bold text-card-foreground">{totalItems}</p>
              <p className="text-sm text-muted-foreground">Totale</p>
            </div>
            <div className="bg-card rounded-lg p-4 text-center border border-border">
              <p className="text-2xl font-bold text-success">{completedItems}</p>
              <p className="text-sm text-muted-foreground">Completati</p>
            </div>
            <div className="bg-card rounded-lg p-4 text-center border border-border">
              <p className="text-2xl font-bold text-warning">{totalItems - completedItems}</p>
              <p className="text-sm text-muted-foreground">Rimanenti</p>
            </div>
          </div>

          {/* Add from Recipe CTA */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">Aggiungi da Ricette</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Apri una ricetta e usa “Aggiungi mancanti” per inserire automaticamente gli ingredienti
                </p>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddMissingFromRecipe}
                iconName="BookOpen"
                iconPosition="left"
              >
                Scegli Ricetta
              </Button>
            </div>
          </div>

          {/* Empty states */}
          {filteredItems.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              <Icon name="ShoppingCart" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Carrello vuoto</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Aggiungi articoli manualmente o scegli una ricetta per iniziare la spesa
              </p>
              <Button variant="default" onClick={() => setShowAddModal(true)} iconName="Plus" iconPosition="left">
                Aggiungi Articolo
              </Button>
            </div>
          )}

          {filteredItems.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Icon name="Search" size={64} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nessun risultato trovato</h3>
              <p className="text-muted-foreground mb-4">Nessun articolo corrisponde a "{searchQuery}"</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>Cancella ricerca</Button>
            </div>
          )}

          {/* Items */}
          {filteredItems.length > 0 && (
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              {filteredItems.map((item) => (
                <div key={item?.id} className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={!!item?.checked}
                      onCheckedChange={(val) => handleItemToggle(item?.id, val)}
                      onChange={(e) => handleItemToggle(item?.id, e)}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-card-foreground truncate ${item?.checked ? 'line-through opacity-60' : ''}`}>
                            {capWords(item?.name)}
                          </h4>
                          {item?.fromRecipe && (
                            <p className="text-xs text-primary mt-1">Da ricetta: {item?.fromRecipe}</p>
                          )}
                          {item?.addedManually && (
                            <span className="inline-block text-xs px-2 py-0.5 bg-muted/30 text-muted-foreground rounded-full mt-1">
                              Aggiunto manualmente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <button onClick={() => handleDeleteItem(item?.id)} className="p-1 hover:bg-destructive/10 rounded text-destructive">
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Quantità & Prezzo */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item?.id, (parseFloat(item?.quantity) || 0) - 0.5)}
                            className="w-8 h-8 rounded bg-muted/20 hover:bg-muted/40 flex items-center justify-center"
                            disabled={(parseFloat(item?.quantity) || 0) <= 0.5}
                          >
                            <Icon name="Minus" size={14} />
                          </button>
                          <div className="min-w-20 text-center">
                            <span className="text-sm font-medium">{item?.quantity}</span>
                            <span className="text-xs text-muted-foreground ml-1">{item?.unit}</span>
                          </div>
                          <button
                            onClick={() => handleQuantityChange(item?.id, (parseFloat(item?.quantity) || 0) + 0.5)}
                            className="w-8 h-8 rounded bg-muted/20 hover:bg-muted/40 flex items-center justify-center"
                          >
                            <Icon name="Plus" size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          {(() => {
                            const unitPrice = num(item?.prices?.[selectedMarket] ?? item?.prices?.AVG ?? 0);
                            const qty = num(item?.quantity);
                            const total = unitPrice * qty;
                            const per = perUnitDisplay(unitPrice, item?.unit);
                            return (
                              <>
                                <div className="text-sm font-semibold text-card-foreground">{formatEuro(total)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {`${formatEuro(per.value)} ${per.label}`}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {totalItems > 0 && (
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleClearCompleted} disabled={completedItems === 0} className="flex-1">
                Cancella Completati
              </Button>
              <Button variant="default" onClick={() => alert('Condivisione lista')} className="flex-1" iconName="Share" iconPosition="left">
                Condividi Lista
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Totale */}
      {totalItems > 0 && (
        <div className="fixed bottom-24 left-0 right-0 bg-card border-t border-border p-4 z-[95]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Totale ({selectedMarket}):</div>
              <div className="text-xl font-bold text-card-foreground">
                {formatEuro(currentTotal)}
                {delta !== 0 && (
                  <span className={`text-sm ml-2 ${delta > 0 ? 'text-destructive' : 'text-success'}`}>
                    (ΔAVG {formatEuro(delta)})
                  </span>
                )}
              </div>
            </div>
            <Button variant="default" size="lg" onClick={() => alert('Checkout simulato')} disabled={totalItems - completedItems === 0}>
              Procedi ({totalItems - completedItems} articoli)
            </Button>
          </div>
        </div>
      )}

      {/* Modal Aggiungi */}
      {showAddModal && (
        <div className="fixed inset-0 z=[1000] bg-background/80 backdrop-blur-sm flex items-end lg:items-center justify-center" aria-modal="true" role="dialog">
          <div className="w-full max-w-md bg-card rounded-t-lg lg:rounded-lg border border-border max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-card-foreground">Aggiungi Articolo</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <Input
                label="Nome articolo"
                type="text"
                value={newItem?.name}
                onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="es. Passata di pomodoro"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Quantità"
                  type="number"
                  value={newItem?.quantity}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: e.target.value }))}
                  min="0.1"
                  step="0.1"
                  required
                />

                <Select
                  label="Unità"
                  options={[
                    { value: 'pz', label: 'Pezzi' },
                    { value: 'kg', label: 'Kg' },
                    { value: 'g',  label: 'Grammi' },
                    { value: 'l',  label: 'Litri' },
                    { value: 'ml', label: 'ml' },
                    { value: 'conf', label: 'Confezioni' },
                  ]}
                  value={newItem?.unit}
                  onChange={(value) => setNewItem((prev) => ({ ...prev, unit: value }))}
                />
              </div>

              <Input
                label="Prezzo stimato (opzionale)"
                type="number"
                value={newItem?.estimatedPrice}
                onChange={(e) => setNewItem((prev) => ({ ...prev, estimatedPrice: e.target.value }))}
                placeholder="es. 2.50"
                min="0.001"
                max="100"
                step="0.001"
              />
            </div>

            <div className="p-4 border-t border-border bg-card sticky bottom-0">
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Annulla</Button>
                <Button variant="default" onClick={handleAddItem} className="flex-1" disabled={!newItem?.name?.trim()}>Aggiungi</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomTabNavigation />
      <FloatingActionButton onClick={() => setShowAddModal(true)} />
    </div>
  );
};

export default CarrelloSpesa;

