import sharp from 'sharp';
import { stat, rename } from 'fs/promises';
import { extname } from 'path';

// Solo le immagini effettivamente usate nel menu (src/App.tsx) + logo
const USED = [
  'bev_acqua_frizzante.jpeg', 'bev_acqua_naturale.jpeg', 'bev_cocacola.jpeg', 'bev_fanta.jpeg', 'bev_sprite.jpeg',
  'brioche_1.jpeg',
  'caf_cappuccino_opt.png', 'caf_espresso_opt.png', 'caf_latte_opt.png', 'caf_macchiato_opt.png', 'caf_orzo_opt.png',
  'dish_0_12.jpeg', 'dish_0_14.jpeg', 'dish_0_17.jpeg', 'dish_0_2.jpeg', 'dish_0_4.jpeg', 'dish_0_5.jpeg', 'dish_0_6.jpeg', 'dish_0_9.jpeg',
  'dish_1_18.jpeg', 'dish_1_21.jpeg', 'dish_1_23.jpeg',
  'dish_2_24.jpeg', 'dish_2_26.jpeg', 'dish_2_28.jpeg', 'dish_2_30.jpeg', 'dish_2_32.jpeg', 'dish_2_36.jpeg', 'dish_2_41.jpeg', 'dish_2_43.jpeg', 'dish_2_45.jpeg', 'dish_2_47.jpeg',
  'dish_3_56.jpeg', 'dish_3_58.jpeg', 'dish_3_62.jpeg', 'dish_3_64.jpeg', 'dish_3_69.jpeg',
  'kohl_albicocca.jpeg', 'kohl_fiori_di_sambuco.jpeg', 'kohl_gravensteiner.jpeg', 'kohl_menta.jpeg', 'kohl_mirtillo_selvatico.jpeg', 'kohl_pera.jpeg', 'kohl_pesca.jpeg', 'kohl_ribes_nero.jpeg',
  'msemen_1.jpeg', 'msemen_2.jpeg', 'msemen_3.jpeg', 'msemen_4.jpeg',
  'spremuta_arancia.jpeg',
  'tacos_manzo_bbq_opt.png', 'tacos_manzo_cheddar_opt.png', 'tacos_merguez_classic_opt.png', 'tacos_merguez_fresh_opt.png',
  'logo.png',
];

const IMG_DIR = 'public/images';
const LOGO_DIR = 'public';

// Max dimensioni display (2× retina) per foto piatto: card alte 172-230px
const MAX_W = 800;
const MAX_H = 700;
// I PNG con trasparenza (prodotti ritagliati) sono mostrati più piccoli, contain
const MAX_W_ALPHA = 700;
const MAX_H_ALPHA = 700;
const JPEG_QUALITY = 78;
const PNG_QUALITY = 80;
// Sotto questa soglia non vale la pena ricomprimere (già leggero)
const SKIP_UNDER_BYTES = 60 * 1024;

let totalBefore = 0;
let totalAfter = 0;
let skipped = 0;

const kb = (b) => `${Math.round(b / 1024)}KB`.padStart(8);

async function optimizeJpeg(inputPath) {
  const { size: before } = await stat(inputPath);
  if (before < SKIP_UNDER_BYTES) { skipped++; return; }
  totalBefore += before;

  const tmpPath = inputPath + '.tmp';
  await sharp(inputPath)
    .resize(MAX_W, MAX_H, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(tmpPath);

  const { size: after } = await stat(tmpPath);
  totalAfter += after;
  await rename(tmpPath, inputPath);

  const pct = Math.round((1 - after / before) * 100);
  console.log(`  ${inputPath.split('/').pop().padEnd(28)} ${kb(before)} -> ${kb(after)}  (-${pct}%)`);
}

async function optimizePng(inputPath) {
  const { size: before } = await stat(inputPath);
  if (before < SKIP_UNDER_BYTES) { skipped++; return; }
  totalBefore += before;

  const meta = await sharp(inputPath).metadata();
  const hasAlpha = !!meta.hasAlpha;
  const tmpPath = inputPath + '.tmp';

  if (hasAlpha) {
    // Foto con trasparenza (prodotti ritagliati) -> PNG a palette (lossy-ish) per ridurre drasticamente il peso
    await sharp(inputPath)
      .resize(MAX_W_ALPHA, MAX_H_ALPHA, { fit: 'inside', withoutEnlargement: true })
      .png({ palette: true, quality: PNG_QUALITY, effort: 10, dither: 1 })
      .toFile(tmpPath);
  } else {
    await sharp(inputPath)
      .resize(MAX_W, MAX_H, { fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(tmpPath);
  }

  const { size: after } = await stat(tmpPath);
  totalAfter += after;
  await rename(tmpPath, inputPath);

  const pct = Math.round((1 - after / before) * 100);
  console.log(`  ${inputPath.split('/').pop().padEnd(28)} ${kb(before)} -> ${kb(after)}  (-${pct}%)`);
}

console.log('\nOttimizzazione immagini menu\n');

for (const file of USED) {
  const ext = extname(file).toLowerCase();
  const dir = file === 'logo.png' ? LOGO_DIR : IMG_DIR;
  const fullPath = `${dir}/${file}`;

  try {
    if (ext === '.jpeg' || ext === '.jpg') {
      await optimizeJpeg(fullPath);
    } else if (ext === '.png') {
      await optimizePng(fullPath);
    }
  } catch (e) {
    console.warn(`  SKIP ${file}: ${e.message}`);
  }
}

console.log('\n' + '-'.repeat(50));
console.log(`  File saltati (gia' leggeri):  ${skipped}`);
console.log(`  Totale prima: ${Math.round(totalBefore / 1024)}KB`);
console.log(`  Totale dopo:  ${Math.round(totalAfter / 1024)}KB`);
console.log(`  Risparmio:    ${Math.round((totalBefore - totalAfter) / 1024)}KB  (-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`);
console.log('');
