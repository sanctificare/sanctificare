#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ASSETS_DIR = path.resolve(process.cwd(), 'client', 'public', 'assets');

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return; // skip existing .webp/.avif

  const rel = path.relative(ASSETS_DIR, filePath);
  const webpOut = path.join(path.dirname(filePath), path.basename(filePath, ext) + '.webp');
  const avifOut = path.join(path.dirname(filePath), path.basename(filePath, ext) + '.avif');

  try {
    const img = sharp(filePath);
    await img
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(webpOut);

    await img
      .resize({ width: 1600, withoutEnlargement: true })
      .avif({ quality: 50 })
      .toFile(avifOut);

    console.log('Optimized:', rel);
  } catch (err) {
    console.error('Failed to process', rel, err);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else processFile(full);
  }
}

if (!fs.existsSync(ASSETS_DIR)) {
  console.error('Assets dir not found:', ASSETS_DIR);
  process.exit(1);
}

walk(ASSETS_DIR);
