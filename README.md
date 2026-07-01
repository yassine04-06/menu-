# Qahwat Blu Caffé — Menu digitale

Menu digitale (React + TypeScript + Vite) per **Qahwat Blu Caffé**, cucina marocchina.
Pensato per l'accesso da QR al tavolo: navigazione per categorie, foto dei piatti,
allergeni (Reg. UE 1169/2011), combo con ordine su WhatsApp e CTA di contatto.

## Comandi

```bash
npm install       # installa le dipendenze
npm run dev       # avvia in locale (http://localhost:5173)
npm run build     # build di produzione in dist/
npm run preview   # anteprima della build
```

## Aggiornare i contenuti

- **Piatti / prezzi / allergeni** → `MENU_DATA` in [src/App.tsx](src/App.tsx).
- **Contatti (telefono, WhatsApp, indirizzo, orari, Instagram)** → oggetto `CONTACT`
  in cima a [src/App.tsx](src/App.tsx). I pulsanti Chiama/WhatsApp/Ordina compaiono
  solo quando i valori sono compilati (niente più `XXX`).
- **SEO / dati locali Google** → blocco JSON-LD e meta tag in [index.html](index.html)
  (aggiornare telefono, indirizzo e orari con i dati reali).

## Immagini

Le immagini sono in `public/images/`. Per ricomprimerle dopo averle aggiornate:

```bash
node scripts/optimize-images.mjs
```

Lo script ridimensiona e comprime solo le immagini usate nel menu
(riduzione tipica ~80%). Aggiorna la lista `USED` se aggiungi nuovi file.

## Deploy

Configurato per **Vercel** ([vercel.json](vercel.json)): build automatica,
cache lunga su `/images` e `/assets`, rewrite SPA su `index.html`.
