import { list } from '@vercel/blob';
import { readSheet } from './google';

// Image manifest written by /api/sync: { SKU: [{ full, thumb }] }
async function getMedia() {
  const { blobs } = await list({ prefix: 'catalog.json' });
  if (!blobs[0]) return {};
  const r = await fetch(blobs[0].url, { next: { revalidate: 300 } });
  return r.ok ? r.json() : {};
}

export async function getProducts() {
  const [rows, media] = await Promise.all([readSheet(), getMedia()]);
  return rows
    .filter((p) => p.active && media[p.sku]?.length)
    .map((p) => ({ ...p, images: media[p.sku] }));
}
