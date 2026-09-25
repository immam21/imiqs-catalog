import { google } from 'googleapis';

export function auth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    ],
  });
}

const no = /^(no|n|0|false)$/i;

// Sheet columns: SKU | Name | Price | Category | Description | Stock | Active
export async function readSheet() {
  const sheets = google.sheets({ version: 'v4', auth: auth() });
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: process.env.SHEET_RANGE || 'Products!A2:G',
  });
  return (r.data.values || [])
    .map(([sku, name, price, category, description, stock, active]) => ({
      sku: (sku || '').trim().toUpperCase(),
      name: name || '',
      price: Number(String(price || '').replace(/[^\d.]/g, '')) || 0,
      category: category || '',
      description: description || '',
      inStock: !no.test((stock || 'yes').trim()),
      active: !no.test((active || 'yes').trim()),
    }))
    .filter((p) => p.sku);
}
