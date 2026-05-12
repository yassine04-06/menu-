import sharp from 'sharp';
import { readdir, stat, rename } from 'fs/promises';
import { join, extname } from 'path';

// Solo le immagini effettivamente usate nel menu
const USED = [
  'dish_0_0.jpeg', 'dish_0_2.jpeg', 'dish_0_4.jpeg', 'dish_0_5.jpeg', 'dish_0_6.jpeg',
  'dish_1_18.jpeg', 'dish_1_20.jpeg',
  'dish_2_24.jpeg', 'dish_2_26.jpeg', 'dish_2_28.jpeg', 'dish_2_30.jpeg',
  'dish_2_32.jpeg', 'dish_2_34.jpeg', 'dish_2_36.jpeg', 'dish_2_38.jpeg',
  'dish_2_43.jpeg', 'dish_2_47.jpeg',
  'dish_3_56.jpeg', 'dish_3_58.jpeg', 'dish_3_62.jpeg', 'dish_3_64.jpeg', 'dish_3_66.jpeg',
  'msemen_1.jpeg', 'msemen_2.jpeg', 'msemen_3.jpeg', 'msemen_4.jpeg', 'brioche_1.jpeg',
  'logo.png',
];

const IMG_DIR = 'public/images';
const LOGO_DIR = 'public';

// Max dimensioni display (2× retina): 800px larghezza, 600px altezza
const MAX_W = 800;
const MAX_H = 600;
const QUALITY = 82;

let totalBefore = 0;
let totalAfter  = 0;

async function optimizeJpeg(inputPath) {
  const { size: before } = await stat(inputPath);
  totalBefore += before;

  const tmpPath = inputPath + '.tmp';
  await sharp(inputPath)
    .resize(MAX_W, MAX_H, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tmpPath);

  const { size: after } = await stat(tmpPath);
  totalAfter += after;

  await rename(tmpPath, inputPath);

  const pct = Math.round((1 - after / before) * 100);
  console.log(`  ${inputPath.split('/').pop().padEnd(22)} ${kb(before)} → ${kb(after)}  (−${pct}%)`);
}

async function optimizePng(inputPath) {
  const { size: before } = await stat(inputPath);
  totalBefore += before;

  const tmpPath = inputPath + '.tmp';
  await sharp(inputPath)
    .resize(MAX_W, MAX_H, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(tmpPath);

  const { size: after } = await stat(tmpPath);
  totalAfter += after;

  await rename(tmpPath, inputPath);

  const pct = Math.round((1 - after / before) * 100);
  console.log(`  ${inputPath.split('/').pop().padEnd(22)} ${kb(before)} → ${kb(after)}  (−${pct}%)`);
}

const kb = (b) => `${Math.round(b / 1024)}KB`.padStart(8);

console.log('\n🖼  Ottimizzazione immagini menu\n');

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
    console.warn(`  ⚠  ${file}: ${e.message}`);
  }
}

console.log('\n' + '─'.repeat(50));
console.log(`  Totale prima: ${Math.round(totalBefore / 1024)}KB`);
console.log(`  Totale dopo:  ${Math.round(totalAfter  / 1024)}KB`);
console.log(`  Risparmio:    ${Math.round((totalBefore - totalAfter) / 1024)}KB  (−${Math.round((1 - totalAfter/totalBefore)*100)}%)`);
console.log('');
