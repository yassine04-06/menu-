import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Category config ── */
const CATEGORIES = [
  { id: 'colazione', name: 'Colazione', icon: '☕' },
  { id: 'msemen', name: 'Msemen & Brioche', icon: '🥐' },
  { id: 'tacos', name: 'Tacos-Msemen', icon: '🌮' },
  { id: 'antipasti', name: 'Antipasti', icon: '🍽️' },
  { id: 'insalate', name: 'Insalate', icon: '🥗' },
  { id: 'couscous', name: 'Couscous', icon: '🍲' },
  { id: 'tajine', name: 'Tajine', icon: '🫕' },
  { id: 'padelle', name: 'Padelle', icon: '🍳' },
];

/* ── Allergeni — Reg. UE 1169/2011 ── */
type AllergenCode = 'G'|'C'|'U'|'P'|'A'|'S'|'L'|'F'|'Se'|'Sn'|'Ss'|'So'|'Lu'|'M';

const ALLERGENS: Record<AllergenCode, string> = {
  G:  'Glutine',
  C:  'Crostacei',
  U:  'Uova',
  P:  'Pesce',
  A:  'Arachidi',
  S:  'Soia',
  L:  'Latte',
  F:  'Frutta a guscio',
  Se: 'Sedano',
  Sn: 'Senape',
  Ss: 'Sesamo',
  So: 'Solfiti',
  Lu: 'Lupini',
  M:  'Molluschi',
};

/* ── Types ── */
interface Dish {
  name: string;
  desc: string;
  price: string;
  img: string;
  veg?: boolean;
  small?: string;
  badge?: 'bestseller' | 'new' | 'chef';
  allergens?: AllergenCode[];
}

interface Category {
  id: string;
  name: string;
  subtitle?: string;
  dishes: Dish[];
}

/* ── Upsell Combos ── */
interface UpsellCombo {
  emoji: string;
  title: string;
  items: string;
  saving: string;
}

const UPSELL_COMBOS: UpsellCombo[] = [
  { emoji: '☕', title: 'Combo Colazione', items: 'Combo Completo + Spremuta fresca', saving: 'A partire da 8.50 €' },
  { emoji: '🌮', title: 'Menu Tacos Completo', items: 'Tacos-Msemen + Patatine + Bibita', saving: 'Solo 15.00 €' },
  { emoji: '🫕', title: 'Esperienza Marocco', items: 'Tajine + Couscous piccolo + Tè alla menta', saving: 'Chiedi al bancone' },
];

/* ══════════════════════════════════════
   MENU DATA — Contenuto riscritta premium
   ══════════════════════════════════════ */
const MENU_DATA: Category[] = [
  {
    id: 'colazione',
    name: 'Colazione',
    subtitle: 'Inizia la giornata con gusto',
    dishes: [
      {
        name: 'Combo Base',
        desc: 'Caffetteria a scelta, msemen o batbout con miele, formaggio, olive e mortadella.',
        price: '6.00 €',
        img: '/images/dish_0_2.jpeg',
        badge: 'bestseller',
        allergens: ['G', 'L', 'So'],
      },
      {
        name: 'Combo Brioche',
        desc: 'Caffetteria a scelta con brioche fragrante e farcitura del giorno.',
        price: '3.00 €',
        img: '/images/dish_0_6.jpeg',
        allergens: ['G', 'U', 'L'],
      },
      {
        name: 'Combo Completo',
        desc: 'Spremuta fresca, caffetteria, panetteria artigianale e tutti i contorni.',
        price: '8.50 €',
        img: '/images/dish_0_5.jpeg',
        badge: 'chef',
        allergens: ['G', 'L', 'U'],
      },
      {
        name: 'Combo Harira',
        desc: 'Colazione calda con zuppa harira speziata, panetteria e contorni tradizionali.',
        price: '10.00 €',
        img: '/images/dish_0_0.jpeg',
        allergens: ['G', 'Se', 'So'],
      },
      {
        name: 'Combo Omelette',
        desc: 'Spremuta fresca, caffetteria, batbout caldo e omelette dorata al momento.',
        price: '11.00 €',
        img: '/images/dish_0_4.jpeg',
        badge: 'new',
        allergens: ['G', 'U', 'L'],
      },
    ],
  },
  {
    id: 'msemen',
    name: 'Msemen & Brioche',
    subtitle: 'Sfoglie dolci farcite artigianali',
    dishes: [
      {
        name: 'Msemen Fondente',
        desc: 'Sfoglia arrotolata con ganache fondente, fragole fresche e gelato alla vaniglia.',
        price: '4.00 €',
        img: '/images/msemen_1.jpeg',
        badge: 'bestseller',
        allergens: ['G', 'L', 'U'],
      },
      {
        name: 'Msemen Bianco',
        desc: 'Sfoglia croccante con cioccolato bianco cremoso, fragole di stagione e banana fresca.',
        price: '4.00 €',
        img: '/images/msemen_2.jpeg',
        allergens: ['G', 'L', 'U'],
      },
      {
        name: 'Msemen Pistacchio',
        desc: 'Msemen soffice con crema di pistacchio, panna montata fresca e granella croccante.',
        price: '4.00 €',
        img: '/images/msemen_3.jpeg',
        badge: 'chef',
        allergens: ['G', 'L', 'F'],
      },
      {
        name: 'Msemen Cioccolato',
        desc: 'Msemen artigianale con cioccolato al latte, fragole di stagione e banana caramellata.',
        price: '4.00 €',
        img: '/images/msemen_4.jpeg',
        allergens: ['G', 'L', 'U'],
      },
      {
        name: 'Brioche Pistacchio',
        desc: 'Cornetto soffice ripieno di crema pistacchio premium, finito con zucchero a velo.',
        price: '4.00 €',
        img: '/images/brioche_1.jpeg',
        badge: 'new',
        allergens: ['G', 'L', 'U', 'F'],
      },
    ],
  },
  {
    id: 'tacos',
    name: 'Tacos-Msemen',
    subtitle: 'Street food marocchino rivisitato',
    dishes: [
      {
        name: 'Pollo Classic',
        desc: 'Pollo croccante, patatine dorate, cheddar filante, salsa algerienne intensa.',
        price: '12.00 €',
        img: '/images/dish_1_18.jpeg',
        badge: 'bestseller',
        allergens: ['G', 'L', 'U', 'So'],
      },
      {
        name: 'Pollo Fresh',
        desc: 'Pollo tenero, pomodoro fresco, cipolla a cubetti, lattuga croccante.',
        price: '12.00 €',
        img: '/images/dish_1_18.jpeg',
        allergens: ['G'],
      },
      {
        name: 'Manzo BBQ',
        desc: 'Manzo macinato saporito, cipolla caramellata e salsa BBQ affumicata.',
        price: '12.00 €',
        img: '/images/dish_1_18.jpeg',
        badge: 'chef',
        allergens: ['G', 'So'],
      },
      {
        name: 'Manzo & Cheddar',
        desc: 'Macinato di manzo speziato, peperoni croccanti e cheddar fuso.',
        price: '12.00 €',
        img: '/images/dish_1_18.jpeg',
        allergens: ['G', 'L'],
      },
      {
        name: 'Merguez Classic',
        desc: 'Salsiccia merguez piccante, cheddar, salsa algerienne e ketchup selezionato.',
        price: '12.00 €',
        img: '/images/dish_1_18.jpeg',
        allergens: ['G', 'L', 'U', 'So'],
      },
      {
        name: 'Merguez Fresh',
        desc: 'Merguez alla griglia, pomodoro e cipolla, lattuga fresca e salsa.',
        price: '12.00 €',
        img: '/images/dish_1_18.jpeg',
        allergens: ['G', 'So'],
      },
      {
        name: 'Menu Combo Tacos',
        desc: 'Tacos-Msemen a scelta + patatine croccanti + bibita in vetro.',
        price: '15.00 €',
        img: '/images/dish_1_20.jpeg',
        badge: 'bestseller',
        allergens: ['G', 'L', 'U', 'So'],
      },
    ],
  },
  {
    id: 'antipasti',
    name: 'Antipasti',
    subtitle: 'Per iniziare alla grande',
    dishes: [
      {
        name: 'Patatine Croccanti',
        desc: 'Fritte al momento, dorate e irresistibili.',
        price: '3.50 €',
        img: '/images/dish_2_24.jpeg',
        allergens: [],
      },
      {
        name: 'Zaalouk',
        desc: 'Melanzane affumicate e peperoni, un concentrato di spezie orientali.',
        price: '5.50 €',
        img: '/images/dish_2_32.jpeg',
        veg: true,
        allergens: ['Se', 'So'],
      },
      {
        name: 'Insalata Marocchina',
        desc: 'Pomodori, cetrioli croccanti e cipolla dolce tagliati a mano.',
        price: '4.00 €',
        img: '/images/dish_2_38.jpeg',
        veg: true,
        allergens: [],
      },
      {
        name: 'Bestila di Pollo',
        desc: 'Fillo croccante, pollo speziato, mandorle tostate e cannella dorata.',
        price: '7.50 €',
        img: '/images/dish_2_36.jpeg',
        badge: 'chef',
        allergens: ['G', 'U', 'F'],
      },
      {
        name: 'Bestila di Pesce',
        desc: 'Mare in crosta: gamberi, calamari, pesce bianco e spezie agrumati.',
        price: '8.00 €',
        img: '/images/dish_2_43.jpeg',
        badge: 'new',
        allergens: ['G', 'U', 'C', 'P', 'M'],
      },
      {
        name: 'Sigari Croccanti',
        desc: 'Involtini fillo dorati con manzo, cumino, paprica e prezzemolo.',
        price: '8.00 €',
        img: '/images/dish_2_34.jpeg',
        badge: 'bestseller',
        allergens: ['G', 'U', 'So'],
      },
    ],
  },
  {
    id: 'insalate',
    name: 'Insalate',
    subtitle: 'Fresche e generose',
    dishes: [
      {
        name: 'Caesar Blu Caffè',
        desc: 'Pollo allo zafferano, mandorle croccanti, sesamo nero, grana a scaglie.',
        price: '9.00 €',
        img: '/images/dish_2_28.jpeg',
        small: '6.00 €',
        badge: 'bestseller',
        allergens: ['L', 'F', 'Ss'],
      },
      {
        name: 'Insalata Rustica',
        desc: 'Tonno pregiato, uova sode, mais dolce, carote julienne e olio EVO.',
        price: '10.00 €',
        img: '/images/dish_2_26.jpeg',
        small: '7.00 €',
        allergens: ['P', 'U', 'So'],
      },
    ],
  },
  {
    id: 'couscous',
    name: 'Couscous',
    subtitle: 'Tradizione a vapore',
    dishes: [
      {
        name: 'Couscous della Casa',
        desc: 'Sgranato a mano, carne tenera, verdure, brodo speziato e Tfaya d\'autore.',
        price: '13.00 €',
        img: '/images/dish_2_30.jpeg',
        small: '11.00 €',
        badge: 'chef',
        allergens: ['G', 'Se'],
      },
    ],
  },
  {
    id: 'tajine',
    name: 'Tajine',
    subtitle: 'Cottura lenta, sapori intensi',
    dishes: [
      {
        name: 'Tajine di Pollo',
        desc: 'Pollo marinato e dorato in forno, cipolle, limone, olive e patate.',
        price: '14.00 €',
        img: '/images/dish_3_64.jpeg',
        badge: 'bestseller',
        allergens: ['So'],
      },
      {
        name: 'Tajine di Manzo',
        desc: 'Manzo cotto lentamente con prugne caramellate e spezie marocchine.',
        price: '15.00 €',
        img: '/images/dish_3_66.jpeg',
        badge: 'chef',
        allergens: ['So', 'F'],
      },
      {
        name: 'Tajine Polpette',
        desc: 'Polpette speziate in salsa di pomodoro ricca, erbe fresche e pane caldo.',
        price: '16.50 €',
        img: '/images/dish_2_47.jpeg',
        allergens: ['G', 'U', 'Se'],
      },
    ],
  },
  {
    id: 'padelle',
    name: 'Padelle',
    subtitle: 'Sfrigolanti e saporite',
    dishes: [
      {
        name: 'Padella Trita',
        desc: 'Carne tritata, uova, pomodoro, formaggio fuso, prezzemolo e coriandolo.',
        price: '10.00 €',
        img: '/images/dish_3_56.jpeg',
        small: '8.00 €',
        badge: 'bestseller',
        allergens: ['U', 'L'],
      },
      {
        name: 'Padella Salsiccia',
        desc: 'Salsiccia saporita, uova strapazzate, pomodoro e formaggio filante.',
        price: '9.00 €',
        img: '/images/dish_3_58.jpeg',
        allergens: ['U', 'L', 'So'],
      },
      {
        name: 'Padella Gamberi',
        desc: 'Gamberi saltati, uova, pomodoro, coriandolo fresco e pane croccante.',
        price: '11.00 €',
        img: '/images/dish_3_62.jpeg',
        badge: 'new',
        allergens: ['C', 'U', 'G'],
      },
    ],
  },
];

/* ── Badge config ── */
const BADGE_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  bestseller: { label: 'Best Seller', icon: '⭐', className: 'badge--bestseller' },
  new: { label: 'Novità', icon: '✨', className: 'badge--new' },
  chef: { label: 'Scelta Chef', icon: '👨‍🍳', className: 'badge--chef' },
};

/* ── AllergenList ── */
function AllergenList({ codes }: { codes: AllergenCode[] }) {
  if (!codes || codes.length === 0) return null;
  return (
    <div className="allergen-list" aria-label="Allergeni presenti">
      {codes.map(code => (
        <span key={code} className="allergen-tag" title={ALLERGENS[code]}>
          {code}
        </span>
      ))}
    </div>
  );
}

/* ── Lazy‑reveal hook ── */
function useLazyReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '80px', threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── DishCard ── */
function DishCard({ dish, index }: { dish: Dish; index: number }) {
  const { ref, visible } = useLazyReveal();
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };
  const badge = dish.badge ? BADGE_CONFIG[dish.badge] : null;

  return (
    <div
      ref={ref}
      className={`dish-card${visible ? ' dish-card--visible' : ''}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="dish-image-wrapper">
        <img
          src={dish.img}
          alt={dish.name}
          className="dish-image"
          loading="lazy"
          decoding="async"
          width={280}
          height={280}
          onError={handleImageError}
        />
        {/* Badges */}
        {dish.veg && <span className="veg-badge">VEG</span>}
        {badge && (
          <span className={`dish-badge ${badge.className}`}>
            <span className="badge-icon">{badge.icon}</span>
            {badge.label}
          </span>
        )}
      </div>
      <div className="dish-info">
        <h3 className="dish-title">{dish.name}</h3>
        <p className="dish-desc">{dish.desc}</p>
        <div className="dish-price-row">
          <span className="dish-price">{dish.price}</span>
          {dish.small && (
            <span className="dish-price-small">
              <span className="small-label">piccola</span> {dish.small}
            </span>
          )}
        </div>
        {dish.allergens && dish.allergens.length > 0 && (
          <AllergenList codes={dish.allergens} />
        )}
      </div>
    </div>
  );
}

/* ── Upsell Banner ── */
function UpsellBanner() {
  const { ref, visible } = useLazyReveal();
  return (
    <div ref={ref} className={`upsell-section${visible ? ' upsell-section--visible' : ''}`}>
      <div className="upsell-header">
        <span className="upsell-icon">💡</span>
        <h3>Le nostre Combo</h3>
        <p>Combinazioni pensate per te — risparmia e godi di più</p>
      </div>
      <div className="upsell-grid">
        {UPSELL_COMBOS.map((combo, i) => (
          <div key={i} className="upsell-card" style={{ transitionDelay: `${i * 100}ms` }}>
            <span className="upsell-card-emoji">{combo.emoji}</span>
            <div className="upsell-card-content">
              <strong>{combo.title}</strong>
              <span className="upsell-card-items">{combo.items}</span>
              <span className="upsell-card-saving">{combo.saving}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   APP
   ══════════════════════════════════════ */
export default function App() {
  const [activeCategory, setActiveCategory] = useState('colazione');
  const [showTop, setShowTop] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  /* Scroll-spy — rootMargin ampliato per sezioni corte (Couscous, Insalate) */
  useEffect(() => {
    const sections = CATEGORIES.map(c => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top <= b.boundingClientRect.top ? a : b
        );
        setActiveCategory(topmost.target.id);
      },
      { rootMargin: '-10% 0px -75% 0px', threshold: 0 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  /* Back-to-top visibility */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Auto-scroll nav pill */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const activeBtn = nav.querySelector('.nav-btn.active') as HTMLElement | null;
    const navInner = nav.querySelector('.nav-scroll-inner') as HTMLElement | null;
    if (activeBtn && navInner) {
      const navRect = navInner.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      navInner.scrollTo({
        left: navInner.scrollLeft + (btnRect.left - navRect.left) - (navRect.width / 2) + (btnRect.width / 2),
        behavior: 'smooth',
      });
    }
  }, [activeCategory]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = navRef.current?.offsetHeight ?? 60;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navHeight - 8, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="app-container">
      {/* ── Hero ── */}
      <header className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-particles">
          {[...Array(6)].map((_, i) => <span key={i} className="particle" style={{ '--i': i } as React.CSSProperties} />)}
        </div>
        <div className="hero-content">
          <img src="/logo.png" alt="Qahwat Blu Caffé" className="hero-logo" loading="eager" fetchPriority="high" />
          <h1>Qahwat <span>Blu Caffé</span></h1>
          <p className="hero-subtitle">Un angolo di Marocco nel cuore d'Italia</p>
          <p className="hero-tagline">Cucina autentica · Ingredienti freschi · Tradizione artigianale</p>
          <div className="hero-ornament hero-ornament--bottom">
            <span className="line" /><span className="diamond" /><span className="line" />
          </div>
        </div>
      </header>

      {/* ── Sticky Nav ── */}
      <nav className="nav-categories" ref={navRef}>
        <div className="nav-scroll-inner">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => scrollToSection(cat.id)}
              className={`nav-btn${activeCategory === cat.id ? ' active' : ''}`}
            >
              <span className="nav-emoji">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Menu Sections ── */}
      <main className="menu-main">
        {MENU_DATA.map((cat, catIndex) => (
          <section id={cat.id} key={cat.id} className="menu-section">
            <div className="section-header">
              <h2>{cat.name}</h2>
              {cat.subtitle && <p className="section-subtitle">{cat.subtitle}</p>}
              <div className="section-divider">
                <span className="bar" /><span className="dot" /><span className="bar" />
              </div>
            </div>

            <div className="dishes-grid" data-count={cat.dishes.length}>
              {cat.dishes.map((dish, i) => (
                <DishCard dish={dish} index={i} key={i} />
              ))}
            </div>

            {/* Upsell after first 2 sections */}
            {catIndex === 1 && <UpsellBanner />}
          </section>
        ))}
      </main>

      {/* ── Back to top ── */}
      <button
        className={`back-to-top${showTop ? ' back-to-top--visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Torna su"
      >
        ↑
      </button>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">Qahwat Blu Caffé</div>
          <div className="footer-divider" />
          <p className="footer-tagline">Dove ogni piatto racconta una storia</p>
          <p className="footer-text">Menu digitale · Tutti i prezzi sono IVA inclusa</p>

          {/* Legenda allergeni */}
          <div className="allergen-legend">
            <p className="allergen-legend-title">Allergeni — Reg. UE 1169/2011</p>
            <div className="allergen-legend-grid">
              {(Object.entries(ALLERGENS) as [AllergenCode, string][]).map(([code, label]) => (
                <span key={code} className="allergen-legend-item">
                  <span className="allergen-tag allergen-tag--sm">{code}</span>
                  {label}
                </span>
              ))}
            </div>
            <p className="allergen-disclaimer">
              Le informazioni sugli allergeni sono indicative. Per allergie gravi o intolleranze
              specifiche, si prega di informare il personale prima di ordinare.
              Possibile contaminazione crociata in cucina.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
