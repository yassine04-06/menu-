import sharp from 'sharp';

/* Genera public/og.png (1200×630) per le anteprime social (WhatsApp, Facebook, X). */

const W = 1200, H = 630;

const bg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#071e2e"/>
      <stop offset="0.4" stop-color="#0a2d44"/>
      <stop offset="0.75" stop-color="#0d3858"/>
      <stop offset="1" stop-color="#092840"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.28" r="0.6">
      <stop offset="0" stop-color="#0daec8" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#0daec8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="#0daec8" opacity="0.5"/>

  <text x="470" y="278" font-family="Georgia, 'Times New Roman', serif" font-size="66" font-weight="700" fill="#ffffff">Qahwat <tspan fill="#45d4ea">Blu Caffé</tspan></text>
  <text x="472" y="326" font-family="Arial, Helvetica, sans-serif" font-size="26" letter-spacing="4" fill="#c9dbe6">CUCINA MAROCCHINA AUTENTICA</text>

  <g transform="translate(472,368)">
    <rect x="0" y="0" width="70" height="3" fill="#45d4ea" opacity="0.7"/>
    <rect x="82" y="-4" width="11" height="11" fill="#0daec8" transform="rotate(45 87 1)"/>
    <rect x="108" y="0" width="70" height="3" fill="#45d4ea" opacity="0.4"/>
  </g>
  <text x="472" y="428" font-family="Georgia, serif" font-size="25" font-style="italic" fill="#9fc4d6">Colazioni · Tajine · Couscous · Tacos · Succhi</text>
</svg>`;

const logo = await sharp('public/logo.png')
  .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(Buffer.from(bg))
  .composite([{ input: logo, left: 120, top: 165 }])
  .png()
  .toFile('public/og.png');

const meta = await sharp('public/og.png').metadata();
console.log(`✔ public/og.png generata: ${meta.width}×${meta.height}`);
