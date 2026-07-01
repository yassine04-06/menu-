import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';

/* ── Category config ── */
const CATEGORIES = [
  { id: 'colazione', name: 'Colazione', icon: '☕' },
  { id: 'msemen', name: 'Msemen & Brioche', icon: '🥐' },
  { id: 'caffetteria', name: 'Caffetteria & Tè', icon: '🍵' },
  { id: 'antipasti', name: 'Antipasti', icon: '🍽️' },
  { id: 'insalate', name: 'Insalate', icon: '🥗' },
  { id: 'tacos', name: 'Tacos-Msemen', icon: '🌮' },
  { id: 'couscous', name: 'Couscous', icon: '🍲' },
  { id: 'tajine', name: 'Tajine', icon: '🫕' },
  { id: 'padelle', name: 'Padelle', icon: '🍳' },
  { id: 'bevande', name: 'Bibite & Succhi', icon: '🥤' },
  { id: 'kohl', name: 'Succhi Kohl', icon: '🍎' },
];

/* ── Allergeni — Reg. UE 1169/2011 ── */
type AllergenCode = 'G' | 'C' | 'U' | 'P' | 'A' | 'S' | 'L' | 'F' | 'Se' | 'Sn' | 'Ss' | 'So' | 'Lu' | 'M';

const ALLERGENS: Record<AllergenCode, string> = {
  G: 'Glutine', C: 'Crostacei', U: 'Uova', P: 'Pesce', A: 'Arachidi', S: 'Soia',
  L: 'Latte', F: 'Frutta a guscio', Se: 'Sedano', Sn: 'Senape', Ss: 'Sesamo',
  So: 'Solfiti', Lu: 'Lupini', M: 'Molluschi',
};

/* ── Badge config ── */
type BadgeKey = 'bestseller' | 'new' | 'chef';
const BADGE_CONFIG: Record<BadgeKey, { label: string; icon: string; bg: string; color: string }> = {
  bestseller: { label: 'Best Seller', icon: '⭐', bg: 'rgba(244,185,30,.92)', color: '#071e2e' },
  new: { label: 'Novità', icon: '✨', bg: 'rgba(7,30,46,.92)', color: '#f0f8fb' },
  chef: { label: 'Scelta Chef', icon: '👨‍🍳', bg: '#0daec8', color: '#fff' },
};

/* ── Types ── */
interface Dish {
  name: string;
  desc: string;
  price: string;
  img: string;
  veg?: boolean;
  small?: string;
  badge?: BadgeKey;
  allergens?: AllergenCode[];
  imgFit?: 'cover' | 'contain';
  imgPos?: string;
  imgH?: number;
  bg?: string;
}

interface Category {
  id: string;
  name: string;
  subtitle?: string;
  dishes: Dish[];
}

interface UpsellCombo {
  emoji: string;
  title: string;
  items: string;
  saving: string;
}

const UPSELL_COMBOS: UpsellCombo[] = [
  { emoji: '☕', title: 'Combo Colazione', items: 'Combo Completo + Spremuta fresca', saving: 'A partire da 8.50 €' },
  { emoji: '🌮', title: 'Menu Tacos Completo', items: 'Tacos-Msemen + Patatine + Bibita', saving: 'Solo 15.00 €' },
  { emoji: '🫕', title: 'Esperienza Marocco', items: 'Tajine + Couscous + Tè alla menta', saving: 'Chiedi al bancone' },
];

/* ══════════════════════════════════════
   CONTATTI — ⚠️ SOSTITUISCI CON I DATI REALI DEL LOCALE
   I pulsanti Chiama / WhatsApp / Ordina compaiono solo se il
   rispettivo valore è compilato (niente "XXX"). Instagram compare
   solo se l'URL è presente.
   ══════════════════════════════════════ */
const CONTACT = {
  phone: '+39 02 3823 9301',                // da scheda Google (verificato)
  whatsapp: '',                              // ⚠️ da confermare: numero WhatsApp (vuoto = pulsanti nascosti)
  instagram: '',                             // es. 'https://instagram.com/tuo_profilo' (vuoto = nascosto)
  address: 'Via Caduti della Liberazione, 36 · 21047 Saronno (VA)',
  mapsQuery: 'Qahwat Blu Caffè, Via Caduti della Liberazione 36, 21047 Saronno VA',
  hours: [] as { d: string; h: string }[],   // ⚠️ da compilare con gli orari reali (Google mostra solo apertura ore 07)
};

const isSet = (v: string) => v.length > 0 && !/x{3,}/i.test(v);
const telHref = 'tel:' + CONTACT.phone.replace(/[^\d+]/g, '');
const waLink = (msg = '') =>
  `https://wa.me/${CONTACT.whatsapp}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.mapsQuery)}`;
const phoneReady = isSet(CONTACT.phone);
const waReady = isSet(CONTACT.whatsapp);

/* ══════════════════════════════════════
   MENU DATA
   ══════════════════════════════════════ */
const MENU_DATA: Category[] = [
  {
    id: 'colazione', name: 'Colazione', subtitle: 'Inizia la giornata con gusto',
    dishes: [
      { name: 'Combo Base', desc: 'Caffetteria a scelta, msemen o batbout con miele, formaggio, olive e mortadella.', price: '6.00 €', img: '/images/dish_0_2.jpeg', badge: 'bestseller', allergens: ['G', 'L', 'So'] },
      { name: 'Combo Brioche', desc: 'Caffetteria a scelta con brioche fragrante e farcitura del giorno.', price: '3.00 €', img: '/images/dish_0_6.jpeg', allergens: ['G', 'U', 'L'] },
      { name: 'Combo Completo', desc: 'Spremuta fresca, caffetteria, panetteria artigianale e tutti i contorni.', price: '8.50 €', img: '/images/dish_0_5.jpeg', badge: 'chef', allergens: ['G', 'L', 'U'] },
      { name: 'Combo Harira', desc: 'Colazione calda con zuppa harira speziata, panetteria e contorni tradizionali.', price: '10.00 €', img: '/images/dish_0_17.jpeg', allergens: ['G', 'Se', 'So'] },
      { name: 'Combo Omelette', desc: 'Spremuta fresca, caffetteria, batbout caldo e omelette dorata al momento.', price: '11.00 €', img: '/images/dish_0_4.jpeg', badge: 'new', allergens: ['G', 'U', 'L'] },
    ],
  },
  {
    id: 'msemen', name: 'Msemen & Brioche', subtitle: 'Sfoglie dolci farcite artigianali',
    dishes: [
      { name: 'Msemen Fondente', desc: 'Sfoglia arrotolata con ganache fondente, fragole fresche.', price: '4.00 €', img: '/images/msemen_1.jpeg', badge: 'bestseller', allergens: ['G', 'L', 'U'], imgFit: 'contain', imgH: 220, bg: '#0d0806' },
      { name: 'Msemen Bianco', desc: 'Sfoglia croccante con cioccolato bianco cremoso, fragole di stagione e banana fresca.', price: '4.00 €', img: '/images/msemen_2.jpeg', allergens: ['G', 'L', 'U'], imgFit: 'contain', imgH: 220, bg: '#0d0806' },
      { name: 'Msemen Pistacchio', desc: 'Msemen soffice con crema di pistacchio, panna montata fresca e granella croccante.', price: '4.00 €', img: '/images/msemen_3.jpeg', badge: 'chef', allergens: ['G', 'L', 'F'], imgFit: 'contain', imgH: 220, bg: '#0d0806' },
      { name: 'Msemen Cioccolato', desc: 'Msemen artigianale con cioccolato al latte, fragole di stagione e banana.', price: '4.00 €', img: '/images/msemen_4.jpeg', allergens: ['G', 'L', 'U'], imgFit: 'contain', imgH: 220, bg: '#0d0806' },
      { name: 'Brioche Pistacchio', desc: 'Cornetto soffice ripieno di crema pistacchio premium, finito con zucchero a velo.', price: '4.00 €', img: '/images/brioche_1.jpeg', badge: 'new', allergens: ['G', 'L', 'U', 'F'], imgFit: 'contain', imgH: 220, bg: '#0d0806' },
    ],
  },
  {
    id: 'caffetteria', name: 'Caffetteria & Tè', subtitle: 'Caldi, aromatici, irresistibili',
    dishes: [
      { name: 'Caffè Espresso', desc: 'Espresso tradizionale italiano, cremoso e intenso.', price: '1.20 €', img: '/images/caf_espresso_opt.png', allergens: [] },
      { name: 'Caffè Macchiato', desc: 'Espresso con uno schizzo di latte caldo montato.', price: '1.30 €', img: '/images/caf_macchiato_opt.png', allergens: ['L'] },
      { name: 'Cappuccino', desc: "Espresso con latte montato a regola d'arte, vellutato e caldo.", price: '1.50 €', img: '/images/caf_cappuccino_opt.png', allergens: ['L'] },
      { name: 'Latte Macchiato', desc: 'Bicchiere di latte caldo con un tocco di caffè espresso.', price: '2.00 €', img: '/images/caf_latte_opt.png', allergens: ['L'], imgFit: 'contain', bg: 'linear-gradient(160deg,#e8e0d0,#d4c8b0)' },
      { name: "Caffè d'Orzo", desc: 'Alternativa senza caffeina, dolce e tostata. Anche in versione macchiato.', price: '1.50 €', img: '/images/caf_orzo_opt.png', allergens: ['G'] },
      { name: 'Tè Marocchino alla Menta', desc: 'Tè verde gunpowder con menta fresca, servito nel tradizionale bicchiere decorato.', price: '2.50 €', img: '/images/dish_0_14.jpeg', badge: 'bestseller', veg: true, allergens: [] },
      { name: 'Tè Misto (Menta & Verbena)', desc: 'Blend aromatico di menta fresca e verbena, dolcificato con zucchero di canna.', price: '2.50 €', img: '/images/dish_0_9.jpeg', badge: 'new', veg: true, allergens: [] },
    ],
  },
  {
    id: 'antipasti', name: 'Antipasti', subtitle: 'Per iniziare alla grande',
    dishes: [
      { name: 'Patatine Croccanti', desc: 'Fritte al momento, dorate e irresistibili.', price: '3.50 €', img: '/images/dish_2_24.jpeg', allergens: [] },
      { name: 'Zaalouk', desc: 'Melanzane affumicate e peperoni, un concentrato di spezie orientali.', price: '5.50 €', img: '/images/dish_2_32.jpeg', veg: true, allergens: ['Se', 'So'] },
      { name: 'Insalata Marocchina', desc: 'Pomodori, cetrioli croccanti e cipolla dolce tagliati a mano.', price: '4.00 €', img: '/images/dish_2_41.jpeg', veg: true, allergens: [] },
      { name: 'Bestila di Pollo', desc: 'Fillo croccante, pollo speziato, mandorle tostate e cannella dorata.', price: '7.50 €', img: '/images/dish_2_36.jpeg', badge: 'chef', allergens: ['G', 'U', 'F'] },
      { name: 'Bestila di Pesce', desc: 'Mare in crosta: gamberi, calamari, pesce bianco e spezie agrumati.', price: '8.00 €', img: '/images/dish_2_43.jpeg', badge: 'new', allergens: ['G', 'U', 'C', 'P', 'M'] },
      { name: 'Sigari Croccanti', desc: 'Involtini fillo dorati con manzo, cumino, paprica e prezzemolo.', price: '8.00 €', img: '/images/dish_2_45.jpeg', badge: 'bestseller', allergens: ['G', 'U', 'So'] },
    ],
  },
  {
    id: 'insalate', name: 'Insalate', subtitle: 'Fresche e generose',
    dishes: [
      { name: 'Caesar Blu Caffè', desc: 'Pollo allo zafferano, mandorle croccanti, sesamo nero, grana a scaglie.', price: '9.00 €', img: '/images/dish_2_28.jpeg', small: '6.00 €', badge: 'bestseller', allergens: ['L', 'F', 'Ss'] },
      { name: 'Insalata Rustica', desc: 'Tonno pregiato, uova sode, mais dolce, carote julienne e olio EVO.', price: '10.00 €', img: '/images/dish_2_26.jpeg', small: '7.00 €', allergens: ['P', 'U', 'So'] },
    ],
  },
  {
    id: 'tacos', name: 'Tacos-Msemen', subtitle: 'Street food marocchino rivisitato',
    dishes: [
      { name: 'Pollo Classic', desc: 'Pollo croccante, patatine dorate, cheddar filante, salsa algerienne intensa.', price: '12.00 €', img: '/images/dish_1_18.jpeg', badge: 'bestseller', allergens: ['G', 'L', 'U', 'So'], imgPos: 'center 20%' },
      { name: 'Pollo Fresh', desc: 'Pollo tenero, pomodoro fresco, cipolla a cubetti, lattuga croccante.', price: '12.00 €', img: '/images/dish_1_23.jpeg', allergens: ['G'], imgPos: 'center 30%' },
      { name: 'Manzo BBQ', desc: 'Manzo macinato saporito, cipolla caramellata e salsa BBQ affumicata.', price: '12.00 €', img: '/images/tacos_manzo_bbq_opt.png', badge: 'chef', allergens: ['G', 'So'], imgPos: 'center 55%' },
      { name: 'Manzo & Cheddar', desc: 'Macinato di manzo speziato, peperoni croccanti e cheddar fuso.', price: '12.00 €', img: '/images/tacos_manzo_cheddar_opt.png', allergens: ['G', 'L'], imgPos: 'center 50%' },
      { name: 'Merguez Classic', desc: 'Salsiccia merguez piccante, cheddar, salsa algerienne e ketchup selezionato.', price: '12.00 €', img: '/images/tacos_merguez_classic_opt.png', allergens: ['G', 'L', 'U', 'So'], imgPos: 'center 50%' },
      { name: 'Merguez Fresh', desc: 'Merguez alla griglia, pomodoro e cipolla, lattuga fresca e salsa.', price: '12.00 €', img: '/images/tacos_merguez_fresh_opt.png', allergens: ['G', 'So'], imgPos: 'center 50%' },
      { name: 'Menu Combo Tacos', desc: 'Tacos-Msemen a scelta + patatine croccanti + bibita in vetro.', price: '15.00 €', img: '/images/dish_1_21.jpeg', badge: 'bestseller', allergens: ['G', 'L', 'U', 'So'], imgPos: 'center 40%' },
    ],
  },
  {
    id: 'couscous', name: 'Couscous', subtitle: 'Tradizione a vapore',
    dishes: [
      { name: 'Couscous della Casa', desc: "Sgranato a mano, carne tenera, verdure, brodo speziato e Tfaya d'autore.", price: '13.00 €', img: '/images/dish_2_30.jpeg', small: '11.00 €', badge: 'chef', allergens: ['G', 'Se'] },
      { name: 'Couscous Vegetariano', desc: 'Semola sgranata a vapore con verdure di stagione, ceci, brodo speziato e salsa harissa delicata.', price: '11.00 €', img: '/images/dish_2_30.jpeg', veg: true, allergens: ['G', 'Se'] },
    ],
  },
  {
    id: 'tajine', name: 'Tajine', subtitle: 'Cottura lenta, sapori intensi',
    dishes: [
      { name: 'Tajine di Pollo', desc: 'Pollo marinato e dorato in forno, cipolle, limone, olive e patate.', price: '14.00 €', img: '/images/dish_3_64.jpeg', badge: 'bestseller', allergens: ['So'] },
      { name: 'Tajine di Manzo', desc: 'Manzo cotto lentamente con prugne caramellate e spezie marocchine.', price: '15.00 €', img: '/images/dish_3_69.jpeg', badge: 'chef', allergens: ['So', 'F'] },
      { name: 'Tajine Polpette', desc: 'Polpette speziate in salsa di pomodoro ricca, erbe fresche e pane caldo.', price: '16.50 €', img: '/images/dish_2_47.jpeg', allergens: ['G', 'U', 'Se'] },
    ],
  },
  {
    id: 'padelle', name: 'Padelle', subtitle: 'Sfrigolanti e saporite',
    dishes: [
      { name: 'Padella Trita', desc: 'Carne tritata, uova, pomodoro, formaggio fuso, prezzemolo e coriandolo.', price: '10.00 €', img: '/images/dish_3_56.jpeg', small: '8.00 €', badge: 'bestseller', allergens: ['U', 'L'] },
      { name: 'Padella Salsiccia', desc: 'Salsiccia saporita, uova strapazzate, pomodoro e formaggio filante.', price: '9.00 €', img: '/images/dish_3_58.jpeg', allergens: ['U', 'L', 'So'] },
      { name: 'Padella Gamberi', desc: 'Gamberi saltati, uova, pomodoro, coriandolo fresco e pane croccante.', price: '11.00 €', img: '/images/dish_3_62.jpeg', badge: 'new', allergens: ['C', 'U', 'G'] },
    ],
  },
  {
    id: 'bevande', name: 'Bibite & Succhi', subtitle: 'Freschi, naturali e in bottiglia',
    dishes: [
      { name: 'Coca-Cola', desc: 'Bibita gassata classica in lattina 0,33 cl. Anche in versione Zero.', price: '2.50 €', img: '/images/bev_cocacola.jpeg', allergens: [], imgFit: 'cover', imgPos: 'center 30%', bg: 'linear-gradient(160deg,#5c0a15 0%,#b80d26 55%,#8c0a1e 100%)' },
      { name: 'Fanta Arancia', desc: "Bibita gassata all'arancia in lattina 0,33 cl.", price: '2.50 €', img: '/images/bev_fanta.jpeg', allergens: [], imgFit: 'cover', imgPos: 'center 30%', bg: 'linear-gradient(160deg,#8c3200 0%,#d95c00 55%,#b84800 100%)' },
      { name: 'Sprite', desc: 'Bibita gassata al limone e lime in lattina 0,33 cl.', price: '2.50 €', img: '/images/bev_sprite.jpeg', allergens: [], imgFit: 'cover', imgPos: 'center 30%', bg: 'linear-gradient(160deg,#0a3c12 0%,#1a7a28 55%,#0d5218 100%)' },
      { name: 'Acqua Naturale', desc: 'Acqua minerale naturale in bottiglia 0,50 cl.', price: '1.50 €', img: '/images/bev_acqua_naturale.jpeg', allergens: [], imgFit: 'cover', imgPos: 'center 40%', bg: 'linear-gradient(160deg,#052840 0%,#0a5a96 55%,#083566 100%)' },
      { name: 'Acqua Frizzante', desc: 'Acqua minerale frizzante in bottiglia 0,50 cl.', price: '1.50 €', img: '/images/bev_acqua_frizzante.jpeg', allergens: [], imgFit: 'cover', imgPos: 'center 40%', bg: 'linear-gradient(160deg,#062e50 0%,#0e68b0 55%,#093e6a 100%)' },
      { name: 'Succo di Frutta', desc: 'Succo in brik — pesca, albicocca, ananas o ACE. Chiedi la disponibilità del giorno.', price: '2.50 €', img: '/images/dish_0_12.jpeg', allergens: [], imgFit: 'cover', imgPos: 'center center', bg: 'linear-gradient(160deg,#4a2200 0%,#9a5000 55%,#6a3400 100%)' },
      { name: 'Spremuta di Arancia', desc: 'Arance fresche spremute al momento. Naturale, senza zuccheri aggiunti.', price: '3.50 €', img: '/images/spremuta_arancia.jpeg', badge: 'chef', veg: true, allergens: [], imgFit: 'cover', imgPos: 'center center' },
    ],
  },
  {
    id: 'kohl', name: 'Succhi Kohl', subtitle: "In collaborazione con Kohl · Succhi di mela dell'Alto Adige",
    dishes: [
      { name: 'Gravensteiner', desc: 'Succo di mela monovarietà Gravensteiner: aromatico, fresco e leggermente acidulo.', price: '6.20 €', img: '/images/kohl_gravensteiner.jpeg', veg: true, badge: 'new', imgFit: 'contain', imgH: 230, bg: 'linear-gradient(160deg,#f0ece0,#ddd4b8)' },
      { name: 'Mela & Ribes Nero', desc: 'Mela di montagna e ribes nero: corposo, fruttato e dal colore intenso.', price: '6.20 €', img: '/images/kohl_ribes_nero.jpeg', veg: true, imgFit: 'contain', imgH: 230, bg: 'linear-gradient(160deg,#1a0a28,#38103c)' },
      { name: 'Mela & Albicocca', desc: 'Mela e albicocca: dolce, vellutato e profumato.', price: '6.20 €', img: '/images/kohl_albicocca.jpeg', veg: true, imgFit: 'contain', imgH: 230, bg: 'linear-gradient(160deg,#f0e8d8,#ddc8a0)' },
      { name: 'Mela & Mirtillo Selvatico', desc: 'Mela e mirtillo selvatico di montagna: ricco, scuro e dal carattere deciso.', price: '7.20 €', img: '/images/kohl_mirtillo_selvatico.jpeg', veg: true, badge: 'chef', imgFit: 'contain', imgH: 230, bg: 'linear-gradient(160deg,#140820,#2a0a30)' },
      { name: 'Mela & Pera', desc: 'Mela e pera: delicato, morbido e naturalmente dolce.', price: '6.20 €', img: '/images/kohl_pera.jpeg', veg: true, imgFit: 'contain', imgH: 230, bg: 'linear-gradient(160deg,#eef0e4,#d4d8c0)' },
      { name: 'Mela & Fiori di Sambuco', desc: 'Mela e fiori di sambuco: floreale, fresco e profumato.', price: '6.20 €', img: '/images/kohl_fiori_di_sambuco.jpeg', veg: true, imgFit: 'contain', imgH: 230, bg: 'linear-gradient(160deg,#f0ecf4,#d8cce8)' },
      { name: 'Mela & Menta', desc: "Mela e menta: dissetante e rinfrescante, ideale d'estate.", price: '6.20 €', img: '/images/kohl_menta.jpeg', veg: true, imgFit: 'contain', imgH: 230, bg: 'linear-gradient(160deg,#e4f0e8,#b8d8c0)' },
      { name: 'Mela & Pesca', desc: 'Mela e pesca: rotondo, succoso e dal gusto estivo.', price: '6.20 €', img: '/images/kohl_pesca.jpeg', veg: true, imgFit: 'contain', imgH: 230, bg: 'linear-gradient(160deg,#f4e8d8,#e0c090)' },
    ],
  },
];

/* ── Haptics ── */
function haptic(type: 'light' | 'medium' | 'heavy' | 'success' = 'light') {
  if (!navigator.vibrate) return;
  const patterns: Record<string, number | number[]> = { light: 8, medium: 18, heavy: 32, success: [10, 50, 10] };
  navigator.vibrate(patterns[type] ?? 8);
}

/* ── AllergenList ── */
function AllergenList({ codes, baseKey }: { codes: AllergenCode[]; baseKey: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!codes || codes.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem', marginTop: '.45rem' }} aria-label="Allergeni presenti">
      {codes.map(code => {
        const key = baseKey + '-' + code;
        const isOpen = !!open[key];
        return (
          <button
            key={code}
            type="button"
            title={ALLERGENS[code]}
            aria-label={ALLERGENS[code]}
            aria-expanded={isOpen}
            onClick={() => setOpen(s => ({ ...s, [key]: !s[key] }))}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.25rem',
              minWidth: 28, minHeight: 28, padding: isOpen ? '.3rem .55rem' : '.3rem .45rem',
              background: isOpen ? '#0daec8' : 'rgba(6,24,37,.07)',
              border: '1px solid ' + (isOpen ? '#0daec8' : 'rgba(6,24,37,.12)'),
              borderRadius: 6, fontFamily: "'DM Sans',sans-serif", fontSize: '.62rem', fontWeight: 700,
              color: isOpen ? '#fff' : '#1e3d52', letterSpacing: '.02em', cursor: 'pointer', transition: 'all .18s ease',
            }}
          >
            {code}
            {isOpen && <span style={{ fontWeight: 500, fontSize: '.58rem', whiteSpace: 'nowrap', letterSpacing: '.01em' }}>{ALLERGENS[code]}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ── DishCard ── */
function DishCard({ dish, index, catId, isContain, onOpen }: { dish: Dish; index: number; catId: string; isContain: boolean; onOpen: () => void }) {
  const badge = dish.badge ? BADGE_CONFIG[dish.badge] : null;
  const delay = Math.min(index, 5) * 40;
  const imgFit = dish.imgFit || (isContain ? 'contain' : 'cover');
  const imgBg = dish.bg || (isContain ? '#e8f5fa' : '#061825');
  const imgPos = dish.imgPos || 'center center';
  const cardImgH = dish.imgH || 172;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <article
      className="mcard reveal"
      onTouchStart={() => haptic('light')}
      style={{
        background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(6,24,37,.08)',
        boxShadow: '0 2px 14px rgba(6,24,37,.06)', display: 'flex', flexDirection: 'column',
        transition: 'transform .22s cubic-bezier(.16,1,.3,1),box-shadow .22s cubic-bezier(.16,1,.3,1)',
        ['--reveal-delay' as string]: `${delay}ms`,
      } as CSSProperties}
    >
      <div
        className="mcard-imgwrap"
        role="button"
        tabIndex={0}
        aria-label={`Ingrandisci foto: ${dish.name}`}
        onClick={onOpen}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
        style={{ position: 'relative', height: cardImgH, width: '100%', background: imgBg, overflow: 'hidden', flexShrink: 0 }}
      >
        <img
          src={dish.img}
          alt={dish.name}
          loading="lazy"
          decoding="async"
          width={320}
          height={320}
          className="mcard-img"
          ref={el => { if (el && el.complete && el.naturalWidth > 0) el.classList.add('loaded'); }}
          onLoad={e => e.currentTarget.classList.add('loaded')}
          style={{ width: '100%', height: '100%', objectFit: imgFit, objectPosition: imgPos, transition: 'opacity .55s ease, transform .5s cubic-bezier(.16,1,.3,1)' }}
          onError={handleImageError}
        />
        {imgFit === 'cover' && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top,rgba(6,24,37,.45),transparent)', pointerEvents: 'none' }} />
        )}
        {dish.veg && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: 'linear-gradient(135deg,#2d6a4f,#3d8a65)', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: '.5rem', fontWeight: 700, letterSpacing: '.09em', padding: '.15rem .42rem', borderRadius: 5, textTransform: 'uppercase', boxShadow: '0 2px 6px rgba(45,106,79,.38)', zIndex: 3 }}>VEG</span>
        )}
        {badge && (
          <span style={{ position: 'absolute', bottom: 8, right: 8, background: badge.bg, color: badge.color, fontFamily: "'DM Sans',sans-serif", fontSize: '.54rem', fontWeight: 700, padding: '.2rem .52rem', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: '.22rem', zIndex: 3, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', letterSpacing: '.02em' }}>
            {badge.icon}&nbsp;{badge.label}
          </span>
        )}
        <span aria-hidden="true" style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: 'rgba(7,30,46,.42)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 3 }}>⤢</span>
      </div>
      <div style={{ padding: '.9rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.02rem', fontWeight: 600, color: '#082030', marginBottom: '.2rem', lineHeight: 1.3 }}>{dish.name}</h3>
        <p style={{ fontSize: '.74rem', color: '#1e3d52', marginBottom: '.55rem', lineHeight: 1.56, flex: 1 }}>{dish.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.92rem', fontWeight: 700, color: '#0779a0', letterSpacing: '-.01em' }}>{dish.price}</span>
          {dish.small && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '.22rem', fontSize: '.67rem', color: '#1a4a62' }}>
              <span style={{ fontSize: '.57rem', textTransform: 'uppercase', letterSpacing: '.04em', opacity: .75 }}>piccola</span>
              {dish.small}
            </span>
          )}
        </div>
        {dish.allergens && dish.allergens.length > 0 && (
          <AllergenList codes={dish.allergens} baseKey={catId + '-' + index} />
        )}
      </div>
    </article>
  );
}

/* ── Lightbox (dettaglio piatto) ── */
function Lightbox({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  const badge = dish.badge ? BADGE_CONFIG[dish.badge] : null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dish.name}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(4,14,22,.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'max(1rem,env(safe-area-inset-top)) 1rem', animation: 'overlayIn .2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', maxWidth: 440, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 70px rgba(0,0,0,.5)', animation: 'lightboxIn .28s cubic-bezier(.16,1,.3,1)' }}
      >
        <div style={{ position: 'relative', width: '100%', background: dish.bg || '#061825' }}>
          <img src={dish.img} alt={dish.name} style={{ width: '100%', maxHeight: '52vh', objectFit: (dish.imgFit || 'cover') as 'cover' | 'contain', objectPosition: dish.imgPos || 'center', display: 'block' }} />
          <button
            className="lightbox-close"
            onClick={onClose}
            aria-label="Chiudi"
            style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(7,30,46,.55)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          >✕</button>
          {badge && (
            <span style={{ position: 'absolute', bottom: 10, left: 10, background: badge.bg, color: badge.color, fontFamily: "'DM Sans',sans-serif", fontSize: '.62rem', fontWeight: 700, padding: '.25rem .6rem', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}>{badge.icon}&nbsp;{badge.label}</span>
          )}
        </div>
        <div style={{ padding: '1.2rem 1.3rem 1.4rem', overflowY: 'auto' }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 700, color: '#082030', marginBottom: '.4rem' }}>{dish.name}</h3>
          <p style={{ fontSize: '.86rem', color: '#1e3d52', lineHeight: 1.6, marginBottom: '.9rem' }}>{dish.desc}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '.7rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '1.3rem', fontWeight: 700, color: '#0779a0' }}>{dish.price}</span>
            {dish.small && <span style={{ fontSize: '.8rem', color: '#1a4a62' }}>piccola {dish.small}</span>}
          </div>
          {dish.allergens && dish.allergens.length > 0 && (
            <p style={{ fontSize: '.72rem', color: '#5c6370', marginTop: '.9rem', lineHeight: 1.5 }}>
              <strong style={{ color: '#1e3d52' }}>Allergeni:</strong> {dish.allergens.map(c => ALLERGENS[c]).join(' · ')}
            </p>
          )}
          {waReady && (
            <a
              href={waLink(`Ciao! Vorrei ordinare: ${dish.name} (${dish.price}). È disponibile?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="order-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', marginTop: '1.1rem', padding: '.8rem 1rem', background: '#25D366', color: '#fff', borderRadius: 12, fontFamily: "'DM Sans',sans-serif", fontSize: '.9rem', fontWeight: 600, textDecoration: 'none', transition: 'background .18s ease, transform .18s ease' }}
            >💬 Ordina su WhatsApp</a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Upsell Banner ── */
function UpsellBanner() {
  return (
    <div style={{ margin: '2rem 0 .5rem', padding: '1.8rem 1.4rem', background: 'linear-gradient(160deg,#071e2e 0%,#0a2d44 62%,#092840 100%)', borderRadius: 20, border: '1px solid rgba(13,174,200,.18)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 12% 88%,rgba(13,174,200,.08) 0%,transparent 52%)', pointerEvents: 'none' }} />
      <div style={{ textAlign: 'center', marginBottom: '1.2rem', position: 'relative' }}>
        <span style={{ fontSize: '1.45rem', display: 'block', marginBottom: '.3rem' }}>💡</span>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>Le nostre Combo</h3>
        <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.62)', marginTop: '.12rem', fontStyle: 'italic' }}>Combinazioni pensate per te — risparmia e godi di più</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', position: 'relative' }}>
        {UPSELL_COMBOS.map((u, i) => (
          <div key={i} className="upsell-row" style={{ display: 'flex', alignItems: 'center', gap: '.85rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.065)', borderRadius: 10, padding: '.82rem 1rem', transition: 'all .22s ease' }}>
            <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{u.emoji}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.1rem', flex: 1, minWidth: 0 }}>
              <strong style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.8rem', fontWeight: 600, color: 'rgba(255,255,255,.9)' }}>{u.title}</strong>
              <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.38)' }}>{u.items}</span>
              <span style={{ fontSize: '.72rem', fontWeight: 600, color: '#45d4ea', marginTop: '.1rem' }}>{u.saving}</span>
            </div>
            {waReady && (
              <a
                href={waLink(`Ciao! Vorrei ordinare la combo "${u.title}" (${u.items}).`)}
                target="_blank"
                rel="noopener noreferrer"
                className="order-btn"
                aria-label={`Ordina ${u.title} su WhatsApp`}
                style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: '#25D366', color: '#fff', borderRadius: 9, padding: '.5rem .7rem', fontSize: '.7rem', fontWeight: 600, textDecoration: 'none', transition: 'background .18s ease, transform .18s ease' }}
              >💬 Ordina</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pulsante CTA hero ── */
function HeroCta({ href, icon, label, external }: { href: string; icon: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="cta-btn"
      onClick={() => haptic('light')}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.16)', color: '#fff', padding: '.55rem .95rem', borderRadius: 30, fontFamily: "'DM Sans',sans-serif", fontSize: '.78rem', fontWeight: 500, textDecoration: 'none', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
    >
      <span style={{ fontSize: '.9rem', lineHeight: 1 }}>{icon}</span>{label}
    </a>
  );
}

/* ══════════════════════════════════════
   APP
   ══════════════════════════════════════ */
export default function App() {
  const [activeCategory, setActiveCategory] = useState('colazione');
  const [showTop, setShowTop] = useState(false);
  const [navAtStart, setNavAtStart] = useState(true);
  const [navAtEnd, setNavAtEnd] = useState(false);
  const [selected, setSelected] = useState<Dish | null>(null);
  const navInnerRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLElement>(null);

  /* Lightbox: chiusura con Esc + blocco scroll body quando aperto */
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [selected]);

  /* Attiva il fade-in delle immagini solo lato client; rete di sicurezza a 3s
     così nessuna immagine può restare invisibile se onLoad non scatta. */
  useEffect(() => {
    document.documentElement.classList.add('js-img-fade');
    const t = setTimeout(() => {
      document.querySelectorAll('.mcard-img:not(.loaded)').forEach(el => el.classList.add('loaded'));
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  /* Scroll-spy */
  useEffect(() => {
    const sections = CATEGORIES.map(c => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) => a.boundingClientRect.top <= b.boundingClientRect.top ? a : b);
        const id = topmost.target.id;
        setActiveCategory(id);
        const ni = navInnerRef.current;
        const btn = document.getElementById('nb-' + id);
        if (ni && btn) {
          const nr = ni.getBoundingClientRect(), br = btn.getBoundingClientRect();
          ni.scrollTo({ left: ni.scrollLeft + br.left - nr.left - nr.width / 2 + br.width / 2, behavior: 'smooth' });
        }
      },
      { rootMargin: '-10% 0px -75% 0px', threshold: 0 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  /* Back-to-top visibility */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowTop(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Nav drag-scroll + fade/arrow state */
  useEffect(() => {
    const ni = navInnerRef.current;
    if (!ni) return;
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    ni.style.cursor = 'grab';

    const onMouseDown = (ev: MouseEvent) => {
      isDown = true; moved = false;
      startX = ev.pageX; startScroll = ni.scrollLeft;
      ni.style.cursor = 'grabbing';
    };
    const onMouseUp = () => { isDown = false; ni.style.cursor = 'grab'; };
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDown) return;
      const dx = ev.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      ni.scrollLeft = startScroll - dx;
    };
    const onClickCapture = (ev: MouseEvent) => {
      if (moved) { ev.stopPropagation(); ev.preventDefault(); }
    };
    const updateFade = () => {
      const overflows = ni.scrollWidth > ni.clientWidth + 2;
      const atStart = !overflows || ni.scrollLeft <= 2;
      const atEnd = !overflows || ni.scrollLeft >= ni.scrollWidth - ni.clientWidth - 2;
      setNavAtStart(atStart);
      setNavAtEnd(atEnd);
    };

    ni.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    ni.addEventListener('click', onClickCapture, true);
    ni.addEventListener('scroll', updateFade, { passive: true });
    window.addEventListener('resize', updateFade);
    updateFade();
    requestAnimationFrame(updateFade);

    let resizeObs: ResizeObserver | undefined;
    if (window.ResizeObserver) {
      resizeObs = new ResizeObserver(updateFade);
      resizeObs.observe(ni);
    }

    return () => {
      ni.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      ni.removeEventListener('click', onClickCapture, true);
      ni.removeEventListener('scroll', updateFade);
      window.removeEventListener('resize', updateFade);
      resizeObs?.disconnect();
    };
  }, []);

  const goTo = useCallback((id: string) => {
    haptic('light');
    setActiveCategory(id);
    const el = document.getElementById(id);
    if (!el) return;
    const nh = navBarRef.current?.offsetHeight ?? 58;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - nh - 8, behavior: 'smooth' });
  }, []);

  const scrollNav = useCallback((dir: number) => {
    haptic('light');
    navInnerRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  }, []);

  return (
    <div className="shell" style={{ minHeight: '100vh', background: '#f0f8fb', fontFamily: "'DM Sans',system-ui,sans-serif", color: '#082030' }}>

      {/* ── Hero ── */}
      <header style={{ background: 'linear-gradient(160deg,#071e2e 0%,#0a2d44 38%,#0d3858 72%,#092840 100%)', textAlign: 'center', padding: '4.5rem 2rem 3.8rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 28% 88%,rgba(13,174,200,.14) 0%,transparent 52%),radial-gradient(ellipse at 78% 14%,rgba(13,174,200,.08) 0%,transparent 48%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(to top,#f0f8fb,transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <img src="/logo.png" alt="Qahwat Blu Caffé" loading="eager" style={{ width: 118, height: 118, objectFit: 'contain', borderRadius: '50%', display: 'block', margin: '0 auto 1.3rem', filter: 'drop-shadow(0 4px 28px rgba(0,0,0,.55))', animation: 'heroIn .95s cubic-bezier(.16,1,.3,1) .05s both' }} />
          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", color: '#fff', fontSize: 'clamp(1.8rem,7vw,3.1rem)', fontWeight: 700, letterSpacing: '.02em', marginBottom: '.5rem', animation: 'heroIn .95s cubic-bezier(.16,1,.3,1) both', textShadow: '0 3px 32px rgba(0,0,0,.45)' }}>
            Qahwat <span style={{ color: '#45d4ea' }}>Blu Caffé</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.88)', fontSize: 'clamp(.7rem,.82rem + .1vw,.82rem)', fontWeight: 300, letterSpacing: '.12em', textTransform: 'uppercase', animation: 'heroIn .95s cubic-bezier(.16,1,.3,1) .15s both' }}>
            Un angolo di Marocco nel cuore di Saronno
          </p>
          <p style={{ color: 'rgba(69,212,234,.9)', fontSize: 'clamp(.68rem,.76rem + .1vw,.76rem)', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', marginTop: '.65rem', animation: 'heroIn .95s cubic-bezier(.16,1,.3,1) .3s both' }}>
            Cucina autentica · Ingredienti freschi · Tradizione artigianale
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.85rem', marginTop: '1.9rem', animation: 'heroIn .95s cubic-bezier(.16,1,.3,1) .42s both' }}>
            <div style={{ width: 64, height: 1, background: 'linear-gradient(90deg,transparent,rgba(69,212,234,.65))' }} />
            <div style={{ width: 8, height: 8, background: '#0daec8', transform: 'rotate(45deg)', boxShadow: '0 0 12px rgba(13,174,200,.6)' }} />
            <div style={{ width: 64, height: 1, background: 'linear-gradient(90deg,rgba(69,212,234,.65),transparent)' }} />
          </div>

        </div>
      </header>

      {/* ── Sticky Nav ── */}
      <nav
        id="nav-bar"
        ref={navBarRef as React.RefObject<HTMLElement>}
        style={{ position: 'sticky', top: 0, background: 'rgba(240,248,251,.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 100, borderBottom: '1px solid rgba(6,24,37,.07)', height: 58, display: 'flex', alignItems: 'center', boxShadow: '0 1px 8px rgba(6,24,37,.05)' } as CSSProperties}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div
            id="nav-inner"
            ref={navInnerRef}
            style={{
              display: 'flex', overflowX: 'auto', padding: '0 .75rem',
              paddingLeft: navAtStart ? 'max(.75rem,env(safe-area-inset-left))' : 44,
              paddingRight: navAtEnd ? 'max(.75rem,env(safe-area-inset-right))' : 44,
              gap: '.35rem', width: '100%', maxWidth: 1120, margin: '0 auto', scrollBehavior: 'smooth',
            }}
          >
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={'nb-' + cat.id}
                  onClick={() => goTo(cat.id)}
                  className={`nav-pill${isActive ? ' active' : ''}`}
                  style={{
                    background: isActive ? '#0daec8' : 'none',
                    border: '1.5px solid ' + (isActive ? '#0daec8' : 'transparent'),
                    color: isActive ? '#fff' : '#1a4a62',
                    fontFamily: "'DM Sans',sans-serif", fontSize: '.78rem', fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer', padding: '.55rem .9rem', minHeight: 40, borderRadius: 28,
                    transition: 'all .18s cubic-bezier(.16,1,.3,1)', display: 'flex', alignItems: 'center', gap: '.3rem',
                    flexShrink: 0, whiteSpace: 'nowrap', boxShadow: isActive ? '0 3px 14px rgba(13,174,200,.38)' : 'none',
                    letterSpacing: isActive ? '.01em' : 'normal',
                  }}
                >
                  <span style={{ fontSize: '.9rem', lineHeight: 1 }}>{cat.icon}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 62, background: 'linear-gradient(90deg,rgba(240,248,251,1) 0%,rgba(240,248,251,.99) 44%,transparent 100%)', pointerEvents: 'none', opacity: navAtStart ? 0 : 1, transition: 'opacity .2s ease', zIndex: 1 }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 62, background: 'linear-gradient(270deg,rgba(240,248,251,1) 0%,rgba(240,248,251,.99) 44%,transparent 100%)', pointerEvents: 'none', opacity: navAtEnd ? 0 : 1, transition: 'opacity .2s ease', zIndex: 1 }} />
          {!navAtStart && (
            <button onClick={() => scrollNav(-1)} aria-label="Categorie precedenti" style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid rgba(6,24,37,.12)', boxShadow: '0 2px 8px rgba(6,24,37,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, color: '#0779a0', fontSize: '.85rem', lineHeight: 1, padding: 0 }}>‹</button>
          )}
          {!navAtEnd && (
            <button onClick={() => scrollNav(1)} aria-label="Altre categorie" style={{ position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '1px solid rgba(6,24,37,.12)', boxShadow: '0 2px 8px rgba(6,24,37,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, color: '#0779a0', fontSize: '.85rem', lineHeight: 1, padding: 0 }}>›</button>
          )}
        </div>
      </nav>

      {/* ── Menu Sections ── */}
      <main id="menu-main" style={{ maxWidth: 1120, margin: '0 auto', padding: '0 max(.75rem,env(safe-area-inset-left)) 0 max(.75rem,env(safe-area-inset-right))' }}>
        {MENU_DATA.map((cat, catIndex) => {
          const isContain = cat.id === 'kohl' || cat.id === 'bevande';
          const gridClass = cat.dishes.length === 1 ? 'mgrid mgrid-one' : cat.dishes.length === 2 ? 'mgrid mgrid-two' : 'mgrid';
          const catMeta = CATEGORIES.find(c => c.id === cat.id);
          return (
            <section id={cat.id} key={cat.id} style={{ padding: '2.4rem 0 1.2rem' }}>
              <div className="reveal" style={{ textAlign: 'center', marginBottom: '1.7rem' }}>
                <span className="sec-badge" aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 46, height: 46, borderRadius: '50%', background: 'rgba(13,174,200,.1)', border: '1px solid rgba(13,174,200,.22)', fontSize: '1.35rem', marginBottom: '.6rem' }}>{catMeta?.icon}</span>
                <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(1.75rem,5vw,2.1rem)', fontWeight: 700, color: '#082030', marginBottom: '.22rem', letterSpacing: '.01em' }}>{cat.name}</h2>
                {cat.subtitle && <p style={{ fontSize: '.78rem', color: '#1a4a62', fontStyle: 'italic', fontFamily: "'Playfair Display',serif", letterSpacing: '.025em', marginBottom: '.4rem' }}>{cat.subtitle}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.55rem', marginTop: '.45rem' }}>
                  <div style={{ width: 30, height: 1.5, background: 'linear-gradient(90deg,transparent,#0daec8)', borderRadius: 2 }} />
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#0daec8', boxShadow: '0 0 7px rgba(13,174,200,.45)' }} />
                  <div style={{ width: 30, height: 1.5, background: 'linear-gradient(90deg,#0daec8,transparent)', borderRadius: 2 }} />
                </div>
              </div>
              <div className={gridClass}>
                {cat.dishes.map((dish, i) => (
                  <DishCard dish={dish} index={i} catId={cat.id} isContain={isContain} onOpen={() => setSelected(dish)} key={i} />
                ))}
              </div>
              {catIndex === 1 && <UpsellBanner />}
            </section>
          );
        })}
      </main>

      {/* ── Back to top ── */}
      <button
        onClick={() => { haptic('medium'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        aria-label="Torna su"
        className="back-to-top"
        style={{
          position: 'fixed', bottom: 'calc(1.5rem + env(safe-area-inset-bottom))', right: 'calc(1.5rem + env(safe-area-inset-right))',
          width: 46, height: 46, borderRadius: '50%', background: '#0daec8', color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 18px rgba(13,174,200,.38)',
          zIndex: 200, transition: 'opacity .25s ease,transform .25s ease,background .2s',
          opacity: showTop ? 1 : 0, transform: showTop ? 'translateY(0)' : 'translateY(10px)', pointerEvents: showTop ? 'auto' : 'none',
        }}
      >↑</button>

      {/* ── Footer ── */}
      <footer style={{ background: 'linear-gradient(160deg,#071e2e 0%,#0a2d44 45%,#092840 100%)', position: 'relative', overflow: 'hidden', marginTop: '2rem' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(13,174,200,.35),transparent)' }} />
        <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem calc(2.2rem + env(safe-area-inset-bottom))', position: 'relative' }}>
          <div style={{ fontFamily: "'Playfair Display',serif", color: '#45d4ea', fontSize: '1.3rem', fontWeight: 600, letterSpacing: '.03em', marginBottom: '.4rem' }}>Qahwat Blu Caffé</div>
          <div style={{ width: 36, height: 1, background: 'rgba(13,174,200,.38)', margin: '.5rem auto' }} />
          <p style={{ color: 'rgba(255,255,255,.78)', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '.82rem', marginBottom: '.3rem' }}>Dove ogni piatto racconta una storia</p>
          <p style={{ color: 'rgba(255,255,255,.58)', fontSize: '.68rem', letterSpacing: '.04em' }}>Menu digitale · Tutti i prezzi sono IVA inclusa</p>

          {/* ── Contatti & orari ── */}
          <div style={{ marginTop: '1.8rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,.08)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '.55rem', marginBottom: '1.1rem' }}>
              {phoneReady && <HeroCta href={telHref} icon="📞" label="Chiama" />}
              {waReady && <HeroCta href={waLink('Ciao! Vorrei avere informazioni.')} icon="💬" label="WhatsApp" external />}
              <HeroCta href={mapsHref} icon="📍" label="Come arrivare" external />
              {isSet(CONTACT.instagram) && <HeroCta href={CONTACT.instagram} icon="📷" label="Instagram" external />}
            </div>
            <div style={{ display: 'grid', gap: '.35rem', maxWidth: 320, margin: '0 auto', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.72rem' }}>📍 {CONTACT.address}</p>
              {phoneReady && <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.72rem' }}>📞 {CONTACT.phone}</p>}
              {CONTACT.hours.length > 0 && (
                <div style={{ marginTop: '.5rem' }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.62rem', fontWeight: 600, color: 'rgba(69,212,234,.85)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '.35rem' }}>Orari</p>
                  {CONTACT.hours.map((o, i) => (
                    <p key={i} style={{ color: 'rgba(255,255,255,.62)', fontSize: '.72rem' }}>
                      <span style={{ color: 'rgba(255,255,255,.82)' }}>{o.d}</span> · {o.h}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '1.8rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,.08)', textAlign: 'left' }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '.66rem', fontWeight: 600, color: 'rgba(255,255,255,.78)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '.8rem', textAlign: 'center' }}>Allergeni — Reg. UE 1169/2011</p>
            <div className="allergen-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.4rem 1rem', marginBottom: '.9rem' }}>
              {(Object.entries(ALLERGENS) as [AllergenCode, string][]).map(([code, label]) => (
                <span key={code} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontFamily: "'DM Sans',sans-serif", fontSize: '.63rem', color: 'rgba(255,255,255,.68)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 16, padding: '0 .3rem', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 4, fontFamily: "'DM Sans',sans-serif", fontSize: '.52rem', fontWeight: 700, color: 'rgba(255,255,255,.92)', flexShrink: 0 }}>{code}</span>
                  {label}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.58)', lineHeight: 1.6, textAlign: 'center', fontStyle: 'italic' }}>
              Le informazioni sugli allergeni sono indicative. Per allergie gravi o intolleranze specifiche, si prega di informare il personale prima di ordinare. Possibile contaminazione crociata in cucina.
            </p>
          </div>
        </div>
      </footer>

      {/* ── WhatsApp flottante ── */}
      {waReady && (
        <a
          href={waLink('Ciao! Vorrei ordinare dal menu.')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ordina o contattaci su WhatsApp"
          className="wa-float"
          onClick={() => haptic('light')}
          style={{
            position: 'fixed', bottom: 'calc(1.5rem + env(safe-area-inset-bottom))', left: 'calc(1.5rem + env(safe-area-inset-left))',
            width: 52, height: 52, borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,211,102,.45)', zIndex: 200, transition: 'transform .2s ease, background .2s ease',
          }}
        >💬</a>
      )}

      {/* ── Lightbox dettaglio piatto ── */}
      {selected && <Lightbox dish={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
