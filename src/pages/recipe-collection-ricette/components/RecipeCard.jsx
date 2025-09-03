import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

// === Helpers & cataloghi locali (solo per le card) ===
const STORAGE = { pantry: 'eatrio:pantryItems', cart: 'eatrio:cart', market: 'eatrio:market' };

const PRICE_CATALOG_AVG = {
  // Cereali / pasta (€/kg)
  spaghetti: 2.00,
  riso: 2.20,
  farina: 1.20,
  lievito: 12.00, // €/kg (una bustina costa pochi cent, ma per kg il valore è alto)

  // Proteine / carne / latticini (€/kg)
  pollo: 8.00,
  pecorino: 22.00,
  parmigiano: 25.00,
  mozzarella: 10.00,
  uova: 0.30,          // €/pz
  uova_tiramisu: 0.30, // €/pz

  // Salumi (€/kg)
  guanciale: 18.00,

  // Verdure / orto (€/kg)
  pomodori: 2.20,
  pomodoro: 2.20,
  cipolla: 1.50,
  carota: 1.80,
  sedano: 2.00,
  verdure: 2.50,
  basilico: 1.20,  // €/conf

  // Funghi e olive (€/kg)
  porcini: 25.00,  // (molto variabile; fresco può essere molto di più)
  olive: 7.00,

  // Dispensa (€/kg)
  zucchero: 1.50,
  cacao: 12.00,
  pepe: 40.00,     // spezie: €/kg alto ma quantità minime
  quinoa: 6.50,
  savoiardi: 6.00,
  granola: 8.00,

  // Condimenti / liquidi
  olio: 8.00,   // €/l
  aceto: 3.00,  // €/l
  brodo: 2.00,  // €/l
  passata: 2.10,// €/kg (se la esprimi in g va benissimo, noi convertiamo)
  vinaigrette: 6.00, // €/l
  latte: 1.60,  // €/l
  yogurt: 3.80, // €/kg

  // Caffè / bevande (€/kg o €/l)
  caffe: 12.00, // €/kg macinato (stima)

  // Frutta (€/kg)
  banana: 1.80,
  frutti_bosco: 9.00,
  aglio: 4.00,
  alloro: 0.50, // €/pz (foglia/confezione simbolica)
  burro: 8.00,  // €/kg
};

const ALIASES = {
  spaghetti: ['spaghetti','pasta'], uova: ['uova','uovo'], pecorino: ['pecorino'],
  guanciale: ['guanciale'], pepe: ['pepe'], riso: ['riso','riso carnaroli','arborio'],
  porcini: ['porcini','funghi porcini','funghi'], parmigiano: ['parmigiano','parmigiano reggiano'],
  burro: ['burro'], brodo: ['brodo'], pollo: ['pollo'], olive: ['olive'],
  pomodori: ['pomodori','pomodori pelati'], passata: ['passata','passata di pomodoro'],
  cipolla: ['cipolla','cipolle'], carota: ['carota','carote'], sedano: ['sedano'],
  quinoa: ['quinoa'], verdure: ['verdure', 'verdure di stagione', 'zucchine', 'peperoni', 'insalata'],
  vinaigrette: ['vinaigrette','condimento'], olio: ['olio','olio extravergine','olio evo'],
  aceto: ['aceto','aceto di vino','aceto balsamico'], savoiardi: ['savoiardi'],
  mascarpone: ['mascarpone'], caffe: ['caffè','caffe'], cacao: ['cacao','cacao amaro'],
  zucchero: ['zucchero'], uova_tiramisu: ['uova','uovo'], lenticchie: ['lenticchie'],
  aglio: ['aglio'], alloro: ['alloro','foglia alloro'], farina: ['farina'],
  lievito: ['lievito','lievito di birra'], mozzarella: ['mozzarella','mozzarella fior di latte','mozzarella di bufala'],
  basilico: ['basilico'], banana: ['banana','banane'], frutti_bosco: ['frutti di bosco','mirtilli','lamponi','fragole'],
  latte: ['latte'], yogurt: ['yogurt'], granola: ['granola'],
};

const capWords = (s) => (s||'').split(' ').map(w=>w? w[0].toUpperCase()+w.slice(1):'').join(' ');
const norm = (s) => (s||'').toLowerCase().trim();
const toBase = (qty, unit) => {
  const q = Number(qty)||0; const u = (unit||'').toLowerCase();
  if (u==='g') return { qty: q/1000, unit:'kg' };
  if (u==='kg') return { qty: q, unit:'kg' };
  if (u==='ml') return { qty: q/1000, unit:'l' };
  if (u==='l') return { qty: q, unit:'l' };
  return { qty: q, unit:'pz' };
};
const matchPantry = (pantryItemName, key) => {
  const n = norm(pantryItemName);
  const aliases = ALIASES[key] || [key];
  return aliases.some(a => n.includes(norm(a)));
};
const priceForMarket = (avg, market) => (market==='Coop'?avg*1.00 : market==='Conad'?avg*0.95 : market==='Esselunga'?avg*1.05 : avg);

// Converte il prezzo per unità BASE (kg/l/pz) al prezzo per unità VISUALE (g/ml/kg/l/pz/conf/mazzo...)
const toDisplayUnitPrice = (unitEuroBase, displayUnit) => {
  const u = (displayUnit || '').toLowerCase();
  if (u === 'g')  return unitEuroBase / 1000;   // €/g da €/kg
  if (u === 'ml') return unitEuroBase / 1000;   // €/ml da €/l
  if (u === 'kg' || u === 'l' || u === 'pz' || u === 'conf' || u === 'mazzo') return unitEuroBase;
  // fallback prudente: lascia invariato
  return unitEuroBase;
};

// stima €/unit base → €/unit per mercato
const estimateUnitEuro = (key, market) => {
  let avg = PRICE_CATALOG_AVG[key];
  if (typeof avg !== 'number' || Number.isNaN(avg)) avg = 2.5;
  avg = Math.min(Math.max(avg, 0.05), 100); // evita outlier assurdi
  return priceForMarket(avg, market);
};

// mapping ingredienti per le 8 ricette del mock (quantità per l'intera ricetta)
const getRecipeIngredients = (recipe) => {
  const t = norm(recipe?.title);
  const s = Number(recipe?.servings || 4);
  const sf = s/4; // scala su 4 porzioni base

  if (t.includes('carbonara')) return [
    { key:'spaghetti', qty: 360*sf, unit:'g' },
    { key:'uova', qty: 4*sf, unit:'pz' },
    { key:'pecorino', qty: 60*sf, unit:'g', optional:true },
    { key:'guanciale', qty: 150*sf, unit:'g' },
    { key:'pepe', qty: 5*sf, unit:'g', optional:true },
  ];
  if (t.includes('porcini')) return [
    { key:'riso', qty: 320*sf, unit:'g' },
    { key:'porcini', qty: 250*sf, unit:'g' },
    { key:'parmigiano', qty: 40*sf, unit:'g', optional:true },
    { key:'burro', qty: 30*sf, unit:'g' },
    { key:'brodo', qty: 1*sf, unit:'l' },
  ];
  if (t.includes('cacciatora')) return [
    { key:'pollo', qty: 1*sf, unit:'kg' },
    { key:'olive', qty: 80*sf, unit:'g' },
    { key:'passata', qty: 400*sf, unit:'g' },
    { key:'cipolla', qty: 100*sf, unit:'g' },
  ];
  if (t.includes('quinoa')) return [
    { key:'quinoa', qty: 280*sf, unit:'g' },
    { key:'verdure', qty: 400*sf, unit:'g' },
    { key:'vinaigrette', qty: 40*sf, unit:'ml', optional:true },
    { key:'olio', qty: 20*sf, unit:'ml', optional:true },
  ];
  if (t.includes('tiramis')) return [
    { key:'savoiardi', qty: 400*sf, unit:'g' },
    { key:'mascarpone', qty: 500*sf, unit:'g' },
    { key:'caffe', qty: 200*sf, unit:'ml' },
    { key:'zucchero', qty: 80*sf, unit:'g' },
    { key:'uova_tiramisu', qty: 4*sf, unit:'pz' },
    { key:'cacao', qty: 10*sf, unit:'g' },
  ];
  if (t.includes('lenticchie')) return [
    { key:'lenticchie', qty: 320*sf, unit:'g' },
    { key:'pomodoro', qty: 200*sf, unit:'g', optional:true },
    { key:'cipolla', qty: 80*sf, unit:'g' },
    { key:'aglio', qty: 5*sf, unit:'g', optional:true },
    { key:'alloro', qty: 1*sf, unit:'pz', optional:true },
  ];
  if (t.includes('pizza')) return [
    { key:'farina', qty: 500*sf, unit:'g' },
    { key:'lievito', qty: 7*sf, unit:'g' },
    { key:'passata', qty: 300*sf, unit:'g' },
    { key:'mozzarella', qty: 250*sf, unit:'g' },
    { key:'basilico', qty: 1*sf, unit:'conf', optional:true },
  ];
  if (t.includes('smoothie') || t.includes('bowl')) return [
    { key:'frutti_bosco', qty: 200*sf, unit:'g' },
    { key:'banana', qty: 1*sf, unit:'pz' },
    { key:'yogurt', qty: 150*sf, unit:'g' },
    { key:'granola', qty: 40*sf, unit:'g', optional:true },
    { key:'latte', qty: 150*sf, unit:'ml', optional:true },
  ];

  // se non riconosciuta
  return [];
};

const computeMissing = (pantry, ingredients) => {
  const missing = [];
  ingredients.forEach(ing => {
    if (ing.optional) return;
    let available = 0;
    let baseUnit = toBase(ing.qty, ing.unit).unit;
    pantry.forEach(p => {
      if (matchPantry(p?.name, ing.key)) {
        const pb = toBase(p?.quantity, p?.unit);
        if (pb.unit === baseUnit) available += pb.qty;
      }
    });
    const need = toBase(ing.qty, ing.unit).qty;
    const lack = Math.max(0, need - available);
    if (lack > 0) {
      let qty = lack;
      let unit = baseUnit;
      if (ing.unit === 'g' && baseUnit === 'kg') { qty = Number((lack*1000).toFixed(0)); unit = 'g'; }
      if (ing.unit === 'ml' && baseUnit === 'l') { qty = Number((lack*1000).toFixed(0)); unit = 'ml'; }
      missing.push({ key: ing.key, qty, unit });
    }
  });
  return missing;
};

const mergeCartItems = (cart, item) => {
  const idx = cart.findIndex(
    it => norm(it.name) === norm(item.name) && norm(it.unit) === norm(item.unit)
  );
  if (idx >= 0) {
    cart[idx].quantity = Number(cart[idx].quantity || 0) + Number(item.quantity || 0);
  } else {
    cart.push(item);
  }
};

const showToast = (msg) => {
  const t = document.createElement('div');
  t.className = 'fixed top-20 left-1/2 -translate-x-1/2 bg-success text-white px-4 py-2 rounded-lg shadow z-[1000]';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { try { document.body.removeChild(t); } catch {} }, 2200);
};

const RecipeCard = ({ recipe, onFavoriteToggle, className = '' }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/recipe-detail-cook-mode', { state: { recipe } });
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavoriteToggle?.(recipe?.id);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1: return 'text-success';
      case 2: return 'text-warning';
      case 3: return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 1: return 'Facile';
      case 2: return 'Medio';
      case 3: return 'Difficile';
      default: return 'N/A';
    }
  };

  const getAvailabilityColor = (percentage) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-error';
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(price);

  let pantry = [];
  let market = 'AVG';
  try {
    pantry = JSON.parse(localStorage.getItem(STORAGE.pantry) || '[]');
    market = localStorage.getItem(STORAGE.market) || 'AVG';
  } catch {}

  const recipeIngs = getRecipeIngredients(recipe);
  const missingNow = computeMissing(pantry, recipeIngs);
  const availabilityPct = recipeIngs.length
    ? Math.round(((recipeIngs.length - missingNow.length) / recipeIngs.length) * 100)
    : (recipe?.ingredientAvailability ?? 0);

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (!recipeIngs.length) {
      alert('Ingredienti non specificati per questa ricetta (mock).');
      return;
    }
    const missing = computeMissing(pantry, recipeIngs);
    if (!missing.length) {
      showToast('Hai già tutti gli ingredienti 🙂');
      return;
    }

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem(STORAGE.cart) || '[]'); } catch {}

    missing.forEach(m => {
      const name = capWords(m.key);
      const unit = m.unit;
      // prezzo per unità BASE (€/kg, €/l o €/pz a seconda dell’ingrediente)
const unitEuroAVG_base = estimateUnitEuro(m.key, 'AVG');

// converto alla unità VISUALE dell’item (g/ml/kg/l/pz/conf/mazzo)
const avg_disp   = toDisplayUnitPrice(unitEuroAVG_base, unit);
const coop_disp  = toDisplayUnitPrice(priceForMarket(unitEuroAVG_base, 'Coop'), unit);
const conad_disp = toDisplayUnitPrice(priceForMarket(unitEuroAVG_base, 'Conad'), unit);
const essel_disp = toDisplayUnitPrice(priceForMarket(unitEuroAVG_base, 'Esselunga'), unit);

const prices = {
  AVG:   Number(avg_disp.toFixed(3)),   // lasciamo 3 decimali per €/g e €/ml
  Coop:  Number(coop_disp.toFixed(3)),
  Conad: Number(conad_disp.toFixed(3)),
  Esselunga: Number(essel_disp.toFixed(3)),
};
      mergeCartItems(cart, {
        id: `${norm(name)}_${unit}_${Date.now()}`,
        name,
        quantity: m.qty,
        unit,
        checked: false,
        prices,
        fromRecipe: recipe?.title,
        dateAdded: new Date().toISOString(),
      });
    });

    try { localStorage.setItem(STORAGE.cart, JSON.stringify(cart)); } catch {}
    showToast('Ingredienti mancanti aggiunti al Carrello');
  };

  return (
    <div
  className={`bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer active:scale-98 flex flex-col ${className}`}
>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
  src={recipe?.image}
  alt={recipe?.title}
  className="w-full h-full object-cover object-center"
  onClick={handleCardClick}
/>

        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background/90 transition-colors"
          aria-label={recipe?.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        >
          <Icon
            name="Heart"
            size={20}
            color={recipe?.isFavorite ? 'var(--color-error)' : 'var(--color-muted-foreground)'}
            className={recipe?.isFavorite ? 'fill-current' : ''}
          />
        </button>

        <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md">
          {formatPrice(recipe?.estimatedCost)}
        </div>

        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
  <span className={getAvailabilityColor(availabilityPct)}>
    {availabilityPct}% disponibile
  </span>
</div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3
  className="text-lg font-semibold text-card-foreground line-clamp-2 mb-1 hover:underline"
  onClick={handleCardClick}
>
  {recipe?.title}
</h3>
          {recipe?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe?.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Icon name="Clock" size={16} color="var(--color-muted-foreground)" />
            <span className="text-muted-foreground">{recipe?.cookingTime}min</span>
          </div>

          <div className="flex items-center gap-1">
            <Icon name="ChefHat" size={16} color="var(--color-muted-foreground)" />
            <span className={getDifficultyColor(recipe?.difficulty)}>
              {getDifficultyText(recipe?.difficulty)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Icon name="Users" size={16} color="var(--color-muted-foreground)" />
            <span className="text-muted-foreground">{recipe?.servings}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
          <div>{recipe?.calories} kcal</div>
          <div>Proteine: {recipe?.protein} g</div>
          <div>Carboidrati: {recipe?.carbs} g</div>
        </div>

        {recipe?.priceComparison && (
          <div className="mt-2 space-y-0.5">
            {[
              ['AVG',  recipe?.priceComparison?.avg],
              ['Coop', recipe?.priceComparison?.coop],
              ['Conad', recipe?.priceComparison?.conad],
              ['Esselunga', recipe?.priceComparison?.esselunga],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between text-[11px] px-2 py-0.5 rounded bg-muted/10"
              >
                <span className="uppercase text-muted-foreground">{label}</span>
                <span className="font-medium">
                  {value != null ? formatPrice(value) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
  type="button"
  className="w-full sm:w-auto"
  iconName="BookOpen"
  iconPosition="left"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    handleCardClick();
  }}
>
  Dettagli
</Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            iconName="Plus"
            iconPosition="left"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(e);
            }}
          >
            Aggiungi al Carrello
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
