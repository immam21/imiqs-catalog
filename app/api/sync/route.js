import { google } from 'googleapis';
import { put, list, del } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { auth } from '../../../lib/google';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const isImage = (t) => /^image\//.test(t);
const isFolder = (t) => t === 'application/vnd.google-apps.folder';
const skuOf = (name) => name.replace(/\.[^.]+$/, '').trim().toUpperCase();

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const key = new URL(req.url).searchParams.get('key');
  if (!secret || (key !== secret && req.headers.get('authorization') !== `Bearer ${secret}`)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const drive = google.drive({ version: 'v3', auth: auth() });
  const ls = async (id) =>
    (await drive.files.list({
      q: `'${id}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,md5Checksum)',
      orderBy: 'name',
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })).data.files || [];

  // 1. Read Drive: root files = single-photo SKUs, sub-folders = multi-photo SKUs
  const jobs = {};
  for (const f of await ls(process.env.DRIVE_FOLDER_ID)) {
    if (isFolder(f.mimeType)) {
      const kids = (await ls(f.id)).filter((k) => isImage(k.mimeType));
      if (kids.length) (jobs[f.name.trim().toUpperCase()] ||= []).push(...kids);
    } else if (isImage(f.mimeType)) {
      (jobs[skuOf(f.name)] ||= []).push(f);
    }
  }

  // 2. What is already in Blob (path -> url)
  const urls = new Map();
  let cursor;
  do {
    const r = await list({ prefix: 'products/', cursor, limit: 1000 });
    r.blobs.forEach((b) => urls.set(b.pathname, b.url));
    cursor = r.cursor;
  } while (cursor);

  const up = async (path, buf) =>
    (await put(path, buf, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/webp',
      cacheControlMaxAge: 31536000,
    })).url;

  // 3. Upload only new/changed photos (path includes Drive checksum), resized to webp
  const manifest = {};
  const keep = new Set();
  const errors = [];
  let uploaded = 0;

  for (const [sku, files] of Object.entries(jobs)) {
    manifest[sku] = [];
    for (const f of files) {
      const base = `products/${sku}/${f.id}-${(f.md5Checksum || '').slice(0, 8)}`;
      const fullPath = `${base}.webp`;
      const thumbPath = `${base}-t.webp`;
      keep.add(fullPath).add(thumbPath);
      try {
        if (!urls.has(fullPath) || !urls.has(thumbPath)) {
          const res = await drive.files.get(
            { fileId: f.id, alt: 'media', supportsAllDrives: true },
            { responseType: 'arraybuffer' }
          );
          const img = sharp(Buffer.from(res.data)).rotate();
          const resize = (w, q) =>
            img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: q }).toBuffer();
          urls.set(fullPath, await up(fullPath, await resize(1600, 82)));
          urls.set(thumbPath, await up(thumbPath, await resize(600, 78)));
          uploaded++;
        }
        manifest[sku].push({ full: urls.get(fullPath), thumb: urls.get(thumbPath) });
      } catch (e) {
        errors.push(`${sku}/${f.name}: ${e.message}`);
      }
    }
  }

  // 4. Publish manifest, remove photos deleted from Drive
  await put('catalog.json', JSON.stringify(manifest), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
  const stale = [...urls.keys()].filter((p) => !keep.has(p)).map((p) => urls.get(p));
  if (stale.length) await del(stale);

  revalidatePath('/');
  return Response.json({ products: Object.keys(manifest).length, uploaded, removed: stale.length, errors });
}
