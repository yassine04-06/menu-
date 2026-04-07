import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';

/* ── Category icons ── */
const CATEGORY_EMOJI: Record<string, string> = {
  colazione: '☕',
  tacos: '🌮',
  antipasti: '🍽️',
  insalate: '🥗',
  couscous: '🍲',
  padelle: '🍳',
  tajine: '🫕',
};

/* ── Menu Data ── */
const MENU_DATA = [
  {
    id: 'colazione',
    name: 'Colazione',
    dishes: [
      { name: 'Colazione Completa', desc: 'Caffetteria a scelta, spremuta o frullato, msemen o batbout con contorni: miele, olio, formaggio, olive e mortadella.', price: '11.00 €', img: '/images/dish_0_0.jpeg' },
      { name: 'Colazione con Brioche', desc: 'Caffetteria a scelta e brioche con farcitura a scelta.', price: '6.00 €', img: '/images/dish_0_5.jpeg' },
      { name: 'Colazione Harira', desc: 'Caffetteria, msemen o batbout, contorni e zuppa harira calda.', price: '10.00 €', img: '/images/dish_0_7.jpeg' },
      { name: 'Colazione Light', desc: 'Caffetteria, panetteria msemen o batbout, contorni.', price: '8.50 €', img: '/images/dish_0_6.jpeg' },
      { name: 'Colazione con Omelette', desc: 'Caffetteria, spremuta o frullato, batbout, omelette o frittata.', price: '3.00 €', img: '/images/dish_0_1.jpeg' },
    ],
  },
  {
    id: 'tacos',
    name: 'Tacos Msemen',
    dishes: [
      { name: 'Tacos Pollo Classic', desc: 'Pollo, patatine, cheddar, salsa algerienne e ketchup.', price: '6.00 €', img: '/images/dish_1_18.jpeg' },
      { name: 'Tacos Pollo Fresh', desc: 'Pollo, patatine, pomodoro e cipolla a cubetti, lattuga, salsa algerienne.', price: '6.00 €', img: '/images/dish_1_20.jpeg' },
      { name: 'Tacos Manzo BBQ', desc: 'Macinato di manzo, patatine, cipolla caramellata e salsa BBQ.', price: '8.50 €', img: '/images/dish_1_20.jpeg' },
      { name: 'Tacos Manzo e Cheddar', desc: 'Macinato di manzo, patatine, peperoni a cubetti e cheddar.', price: '8.50 €', img: '/images/dish_1_20.jpeg' },
      { name: 'Tacos Merguez Classic', desc: 'Salsiccia merguez, patatine, cheddar, salsa algerienne e ketchup.', price: '8.50 €', img: '/images/dish_1_18.jpeg' },
      { name: 'Tacos Merguez Fresh', desc: 'Salsiccia, patatine, pomodoro e cipolla, lattuga, salsa algerienne.', price: '8.50 €', img: '/images/dish_1_18.jpeg' },
      { name: 'Menu Tacos Combo', desc: 'Tacos msemen + patatine + bibita in vetro.', price: '12.00 – 15.00 €', img: '/images/dish_1_20.jpeg' },
    ],
  },
  {
    id: 'antipasti',
    name: 'Antipasti',
    dishes: [
      { name: 'Patatine', desc: 'Patatine fritte croccanti e dorate.', price: '3.50 €', img: '/images/dish_2_30.jpeg' },
      { name: 'Zaalouk', desc: 'Purea di melanzane affumicate e peperoni, intenso aroma di spezie.', price: '5.50 €', img: '/images/dish_2_34.jpeg' },
      { name: 'Insalata Marocchina', desc: 'Cubetti fini di pomodori, cetrioli croccanti e cipolla dolce.', price: '5.50 €', img: '/images/dish_2_36.jpeg' },
      { name: 'Bestila di Pollo', desc: 'Pasta fillo croccante ripiena di pollo speziato, mandorle tostate, cannella e zafferano.', price: '7.50 €', img: '/images/dish_2_28.jpeg' },
      { name: 'Bestila di Pesce', desc: 'Pesce bianco, gamberi, calamari, funghi e spaghettini di riso in pasta fillo croccante.', price: '8.00 €', img: '/images/dish_2_32.jpeg' },
      { name: 'Sigari Croccanti', desc: 'Involtini di pasta fillo farciti con macinato di manzo, cumino, paprica dolce e prezzemolo.', price: '4.00 €', img: '/images/dish_2_26.jpeg' },
    ],
  },
  {
    id: 'insalate',
    name: 'Insalate',
    dishes: [
      { name: 'Caesar Blu Caffè', desc: 'Lattuga romana, pollo dorato allo zafferano e lime, mandorle croccanti, sesamo nero e scaglie di grana.', price: '8.00 €', img: '/images/dish_3_60.jpeg' },
      { name: 'Insalata Rustica', desc: 'Lattuga romana e rossa, filetti di tonno, uova sode, mais dolce e carote julienne con olio EVO.', price: '8.00 €', img: '/images/dish_3_62.jpeg' },
    ],
  },
  {
    id: 'couscous',
    name: 'Couscous',
    dishes: [
      { name: 'Couscous Tradizionale', desc: 'Couscous sgranato a mano cotto a vapore, verdure e carne tenera con brodo speziato e Tfaya: cipolle caramellate, uvetta, cannella e miele.', price: '11.00 €', img: '/images/dish_3_64.jpeg' },
    ],
  },
  {
    id: 'padelle',
    name: 'Padelle',
    dishes: [
      { name: 'Padella Trita', desc: 'Carne tritata, uova strapazzate, salsa pomodoro, formaggio, prezzemolo e coriandolo. Servita con pane.', price: '10.00 €', img: '/images/dish_3_66.jpeg' },
      { name: 'Padella Salsiccia', desc: 'Salsiccia, uova strapazzate, salsa pomodoro e formaggio. Servita con pane.', price: '9.00 €', img: '/images/dish_3_56.jpeg' },
      { name: 'Padella Gamberi', desc: 'Gamberi, uova strapazzate, salsa pomodoro, formaggio, coriandolo. Servita con pane.', price: '11.00 €', img: '/images/dish_3_58.jpeg' },
    ],
  },
  {
    id: 'tajine',
    name: 'Tajine',
    dishes: [
      { name: 'Tajine di Pollo', desc: 'Pollo arrosto marinato con spezie marocchine, doratura croccante, salsa di cipolle, limone e olive. Patate al forno e pane.', price: '14.00 €', img: '/images/dish_3_73.jpeg' },
      { name: 'Tajine di Manzo', desc: 'Teneri bocconi di carne cotti lentamente con spezie marocchine, prugne dolci e caramellate. Con pane morbido.', price: '16.50 €', img: '/images/dish_3_75.jpeg' },
      { name: 'Tajine Polpette di Manzo', desc: 'Polpette speziate secondo la tradizione marocchina in salsa di pomodoro ricca con erbe e spezie. Con pane morbido.', price: '15.00 €', img: '/images/dish_3_77.jpeg' },
    ],
  },
];

/* ── Lazy‑reveal hook using IntersectionObserver ── */
function useLazyReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '60px', threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

/* ── DishCard with lazy reveal ── */
function DishCard({ dish, index }: { dish: { name: string; desc: string; price: string; img: string }; index: number }) {
  const { ref, visible } = useLazyReveal();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

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
      </div>
      <div className="dish-info">
        <h3 className="dish-title">{dish.name}</h3>
        <p className="dish-desc">{dish.desc}</p>
        <span className="dish-price">{dish.price}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState('colazione');
  const navRef = useRef<HTMLElement>(null);

  /* ── Scroll‑spy via IntersectionObserver ── */
  useEffect(() => {
    const sections = MENU_DATA.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  /* ── Scroll active nav pill into view ── */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const activeBtn = nav.querySelector('.nav-btn.active') as HTMLElement | null;
    const navInner = nav.querySelector('.nav-scroll-inner') as HTMLElement | null;
    if (activeBtn && navInner) {
      const navRect = navInner.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const scrollLeft = navInner.scrollLeft + (btnRect.left - navRect.left) - (navRect.width / 2) + (btnRect.width / 2);
      navInner.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = navRef.current?.offsetHeight ?? 56;
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="app-container">
      {/* ── Hero ── */}
      <header className="hero">
        <div className="hero-ornament">
          <span className="line" />
          <span className="diamond" />
          <span className="line" />
        </div>
        <h1>Blu <span>Caffè</span></h1>
        <p className="hero-subtitle">Scopri il nostro menu</p>
        <p className="hero-tagline">Sapori autentici, tradizione marocchina</p>
      </header>

      {/* ── Sticky Nav ── */}
      <nav className="nav-categories" ref={navRef}>
        <div className="nav-scroll-inner">
          {MENU_DATA.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToSection(cat.id)}
              className={`nav-btn${activeCategory === cat.id ? ' active' : ''}`}
            >
              <span className="nav-emoji">{CATEGORY_EMOJI[cat.id]}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Menu Sections ── */}
      <main className="menu-main">
        {MENU_DATA.map((cat) => (
          <section id={cat.id} key={cat.id} className="menu-section">
            <div className="section-header">
              <h2>{cat.name}</h2>
              <div className="section-divider">
                <span className="bar" />
                <span className="dot" />
                <span className="bar" />
              </div>
            </div>

            <div className="dishes-grid">
              {cat.dishes.map((dish, i) => (
                <DishCard dish={dish} index={i} key={i} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-brand">Blu Caffè</div>
        <div className="footer-divider" />
        <p>Menu digitale &middot; Ordina via WhatsApp</p>
      </footer>

      {/* ── WhatsApp FAB ── */}
      <button
        className="wa-float"
        aria-label="Ordina su WhatsApp"
        onClick={() =>
          window.open(
            'https://wa.me/1234567890?text=Ciao%2C%20vorrei%20ordinare!',
            '_blank'
          )
        }
      >
        <MessageCircle size={26} strokeWidth={2.2} />
      </button>
      <span className="wa-label">Ordina su WhatsApp</span>
    </div>
  );
}
