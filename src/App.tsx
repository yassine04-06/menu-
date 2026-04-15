import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Category icons ── */
const CATEGORY_EMOJI: Record<string, string> = {
  colazione: '☕',
  tacos: '🌮',
  antipasti: '🍽️',
  insalate: '🥗',
  couscous: '🍲',
  tajine: '🫕',
  padelle: '🍳',
};

/* ── Types ── */
interface Dish {
  name: string;
  desc: string;
  price: string;
  img: string;
  veg?: boolean;
  small?: string;
}

interface Category {
  id: string;
  name: string;
  subtitle?: string;
  dishes: Dish[];
}

/* ── Menu Data (contenuto completo aggiornato) ── */
const MENU_DATA: Category[] = [
  {
    id: 'colazione',
    name: 'Colazione',
    subtitle: 'Menu Combo',
    dishes: [
      {
        name: 'Combo Base',
        desc: 'Caffetteria a scelta + Panetteria (Msemen o Batbout) + Contorni: Miele/Olio, Formaggio, Olive e Mortadella.',
        price: '6.00 €',
        img: '/images/dish_0_0.jpeg',
      },
      {
        name: 'Combo Brioche',
        desc: 'Caffetteria a scelta + Brioche con farcitura a scelta.',
        price: '3.00 €',
        img: '/images/dish_0_5.jpeg',
      },
      {
        name: 'Combo Completo',
        desc: 'Caffetteria a scelta + Spremuta o Frullato + Panetteria (Msemen o Batbout) + Contorni: Miele/Olio, Formaggio, Olive e Mortadella.',
        price: '8.50 €',
        img: '/images/dish_0_6.jpeg',
      },
      {
        name: 'Combo Harira',
        desc: 'Caffetteria a scelta + Panetteria (Msemen o Batbout) + Contorni: Miele/Olio, Formaggio, Olive e Mortadella + Zuppa Harira.',
        price: '10.00 €',
        img: '/images/dish_0_7.jpeg',
      },
      {
        name: 'Combo Omlette',
        desc: 'Caffetteria a scelta + Spremuta o Frullato + Panetteria Batbout + Omlette o Frittata.',
        price: '11.00 €',
        img: '/images/dish_0_1.jpeg',
      },
    ],
  },
  {
    id: 'tacos',
    name: 'Tacos-Msemen',
    subtitle: '12.00 €',
    dishes: [
      {
        name: 'Con Pollo — Classic',
        desc: 'Pollo, Patatine, Cheddar, Salsa Algerienne, Ketchup.',
        price: '12.00 €',
        img: '/images/dish_1_18.jpeg',
      },
      {
        name: 'Con Pollo — Fresh',
        desc: 'Pollo, Patatine, Pomodoro e Cipolla a cubetti, Lattuga, Salsa Algerienne e Ketchup.',
        price: '12.00 €',
        img: '/images/dish_1_20.jpeg',
      },
      {
        name: 'Con Macinato di Manzo — BBQ',
        desc: 'Macinato di Manzo, Patatine, Cipolla Caramellata e Salsa BBQ.',
        price: '12.00 €',
        img: '/images/dish_1_20.jpeg',
      },
      {
        name: 'Con Macinato di Manzo — Cheddar',
        desc: 'Macinato di Manzo, Patatine, Peperoni a cubetti, Cheddar.',
        price: '12.00 €',
        img: '/images/dish_1_20.jpeg',
      },
      {
        name: 'Con Salsiccia Merguez — Classic',
        desc: 'Salsiccia, Patatine, Cheddar, Salsa Algerienne e Ketchup.',
        price: '12.00 €',
        img: '/images/dish_1_18.jpeg',
      },
      {
        name: 'Con Salsiccia Merguez — Fresh',
        desc: 'Salsiccia, Patatine, Pomodoro e Cipolla a cubetti, Lattuga, Salsa Algerienne e Ketchup.',
        price: '12.00 €',
        img: '/images/dish_1_18.jpeg',
      },
      {
        name: 'Menu Combo Tacos-Msemen',
        desc: 'Include: Tacos-Msemen + Patatine + Bibita in vetro.',
        price: '15.00 €',
        img: '/images/dish_1_20.jpeg',
      },
    ],
  },
  {
    id: 'antipasti',
    name: 'Antipasti',
    dishes: [
      {
        name: 'Patatine',
        desc: 'Patatine fritte croccanti e dorate.',
        price: '3.50 €',
        img: '/images/dish_2_30.jpeg',
      },
      {
        name: 'Zaalouk',
        desc: 'Melanzane affumicate e peperoni con intenso aroma di spezie.',
        price: '5.50 €',
        img: '/images/dish_2_34.jpeg',
        veg: true,
      },
      {
        name: 'Insalata Marocchina',
        desc: 'Cubetti fini di pomodori, cetrioli croccanti e cipolla dolce.',
        price: '4.00 €',
        img: '/images/dish_2_36.jpeg',
        veg: true,
      },
      {
        name: 'Bestila di Pollo',
        desc: 'Pasta fillo croccante ripiena di pollo speziato, mandorle tostate, cannella e zafferano. Il perfetto equilibrio tra dolce e salato.',
        price: '7.50 €',
        img: '/images/dish_2_28.jpeg',
      },
      {
        name: 'Bestila di Pesce',
        desc: 'Pesce bianco, gamberi, calamari, funghi e spaghettini di riso in croccante pasta fillo. Leggermente piccante e agrumata.',
        price: '8.00 €',
        img: '/images/dish_2_32.jpeg',
      },
      {
        name: 'Sigari Croccanti',
        desc: 'Involtini di pasta fillo con macinato di manzo, cumino, paprica dolce e prezzemolo fresco.',
        price: '8.00 €',
        img: '/images/dish_2_26.jpeg',
      },
    ],
  },
  {
    id: 'insalate',
    name: 'Insalate',
    dishes: [
      {
        name: 'Caesar Blu Caffè',
        desc: 'Lattuga romana, pollo dorato allo zafferano, lime, mandorle in scaglie, semi di sesamo neri e grana.',
        price: '9.00 €',
        img: '/images/dish_3_60.jpeg',
        veg: true,
        small: '6.00 €',
      },
      {
        name: 'Insalata Rustica',
        desc: 'Lattuga romana e rossa, tonno all\'olio d\'oliva, uova sode, mais dolce, carote julienne. Olio EVO, sale, pepe nero.',
        price: '10.00 €',
        img: '/images/dish_3_62.jpeg',
        veg: true,
        small: '7.00 €',
      },
    ],
  },
  {
    id: 'couscous',
    name: 'Couscous',
    dishes: [
      {
        name: 'Couscous Tradizionale',
        desc: 'Sgranato a mano e cotto a vapore, con verdure, carne tenera, brodo speziato e Tfaya (cipolle caramellate, uvetta, cannella, miele).',
        price: '13.00 €',
        img: '/images/dish_3_64.jpeg',
        veg: true,
        small: '11.00 €',
      },
    ],
  },
  {
    id: 'tajine',
    name: 'Tajine',
    dishes: [
      {
        name: 'Tajine di Pollo',
        desc: 'Pollo arrosto marinato con spezie marocchine, cotto lentamente in tajine e dorato in forno. Salsa di cipolle, limone e olive, patate al forno e pane morbido.',
        price: '14.00 €',
        img: '/images/dish_3_73.jpeg',
      },
      {
        name: 'Tajine di Manzo',
        desc: 'Bocconi di manzo cotti lentamente con spezie marocchine e prugne dolci caramellate. Servito con pane morbido.',
        price: '15.00 €',
        img: '/images/dish_3_75.jpeg',
      },
      {
        name: 'Tajine di Polpette di Manzo',
        desc: 'Polpette di carne speziata in salsa di pomodoro ricca con erbe e spezie. Tradizione marocchina. Servito con pane morbido.',
        price: '16.50 €',
        img: '/images/dish_3_77.jpeg',
      },
    ],
  },
  {
    id: 'padelle',
    name: 'Padelle',
    dishes: [
      {
        name: 'Padella Trita',
        desc: 'Carne tritata, uova strapazzate, salsa pomodoro, formaggio, pomodoro, prezzemolo e coriandolo. Servita con pane.',
        price: '10.00 €',
        img: '/images/dish_3_66.jpeg',
        veg: true,
        small: '8.00 €',
      },
      {
        name: 'Padella Salsiccia',
        desc: 'Salsiccia, uova strapazzate, salsa pomodoro, formaggio. Con pane.',
        price: '9.00 €',
        img: '/images/dish_3_56.jpeg',
      },
      {
        name: 'Padella Gamberi',
        desc: 'Gamberi, uova strapazzate, salsa pomodoro, formaggio, pomodoro, prezzemolo e coriandolo. Servita con pane.',
        price: '11.00 €',
        img: '/images/dish_3_58.jpeg',
      },
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
function DishCard({ dish, index }: { dish: Dish; index: number }) {
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
        {dish.veg && <span className="veg-badge">VEG</span>}
      </div>
      <div className="dish-info">
        <h3 className="dish-title">{dish.name}</h3>
        <p className="dish-desc">{dish.desc}</p>
        <div className="dish-price-row">
          <span className="dish-price">{dish.price}</span>
          {dish.small && <span className="dish-price-small">piccola {dish.small}</span>}
        </div>
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
        <div className="hero-bg-pattern" />
        <div className="hero-content">
          <div className="hero-ornament">
            <span className="line" />
            <span className="diamond" />
            <span className="line" />
          </div>
          <h1>Blu <span>Caffè</span></h1>
          <p className="hero-subtitle">Scopri il nostro menu</p>
          <p className="hero-tagline">Sapori autentici, tradizione marocchina</p>
          <div className="hero-ornament hero-ornament--bottom">
            <span className="line" />
            <span className="diamond" />
            <span className="line" />
          </div>
        </div>
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
              <div className="section-header-emoji">{CATEGORY_EMOJI[cat.id]}</div>
              <h2>{cat.name}</h2>
              {cat.subtitle && <p className="section-subtitle">{cat.subtitle}</p>}
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
        <div className="footer-content">
          <div className="footer-brand">Blu Caffè</div>
          <div className="footer-divider" />
          <p className="footer-text">Menu digitale · Sapori autentici</p>
        </div>
      </footer>
    </div>
  );
}
