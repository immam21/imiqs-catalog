# Imiqs Fashion Jewellery Catalog

Product grid for Imiqs Fashion. Photos come from a Google Drive folder, product details from a Google Sheet, and customers confirm orders through a prefilled WhatsApp message.

**How it works:** a sync job (`/api/sync`) copies photos from Drive into Vercel Blob (resized to web-friendly WebP). The website only reads from Blob and the Sheet, so it stays fast and never depends on Drive at runtime.

## 1. Prepare Drive and Sheet

**Drive folder**
```
Imiqs Photos/
  IMQ001.jpg          -> single photo product
  IMQ002/             -> multiple photos product
    1.jpg
    2.jpg
```
File or folder name = SKU. Photos in a folder are shown in name order, and the first one is the cover. Use JPG or PNG (HEIC is not supported, export from your phone as JPG).

**Google Sheet** (tab named `Products`, header in row 1)

| SKU | Name | Price | Category | Description | Stock | Active |
|---|---|---|---|---|---|---|
| IMQ001 | Kemp Ruby Necklace | 1250 | Necklaces | Antique finish | Yes | Yes |

- `Stock = No` shows "Sold out" and blocks selection.
- `Active = No` hides the product.
- SKU must match the file or folder name (case does not matter).
- Products without a photo, or photos without a sheet row, are not shown.

## 2. Create the Google service account (free)

1. Go to <https://console.cloud.google.com>, create a project.
2. **APIs & Services > Library**: enable **Google Drive API** and **Google Sheets API**.
3. **IAM & Admin > Service Accounts > Create**. Then open it, **Keys > Add key > JSON**. A file downloads.
4. From the JSON file you need `client_email` and `private_key`.
5. Share the **Drive folder** and the **Google Sheet** with the `client_email` address as **Viewer**. Nothing needs to be made public.
6. Note the IDs: Drive folder ID is the end of the folder URL; Sheet ID is the part between `/d/` and `/edit`.

## 3. Deploy on Vercel

1. Push this project to a GitHub repository.
2. On <https://vercel.com/new>, import the repository (Framework: Next.js, no other settings).
3. **Before deploying, or right after:** open the project, go to **Storage > Create > Blob**, and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
4. Go to **Settings > Environment Variables** and add (see `.env.example`):

| Name | Value |
|---|---|
| `GOOGLE_CLIENT_EMAIL` | `client_email` from the JSON |
| `GOOGLE_PRIVATE_KEY` | `private_key` from the JSON, pasted as is (with the `\n`) |
| `DRIVE_FOLDER_ID` | your folder ID |
| `SHEET_ID` | your sheet ID |
| `WHATSAPP_NUMBER` | e.g. `919876543210` (country code, digits only) |
| `CRON_SECRET` | a long random string you make up |

5. Click **Deploy** (or **Redeploy** if you added variables afterwards).

## 4. Load your photos (first sync)

Open this in your browser (replace with your domain and secret):

```
https://YOUR-SITE.vercel.app/api/sync?key=YOUR_CRON_SECRET
```

It returns a summary such as `{"products":42,"uploaded":58,"removed":0,"errors":[]}`. Then open your site. Any file that failed is listed in `errors`.

## 5. Day to day

- **New product:** add the photo(s) to Drive, add the row to the Sheet, then open the sync URL.
- **Price, name, stock change:** edit the Sheet only. The site updates within 5 minutes, no sync needed.
- **Automatic sync:** a daily sync runs at 2:30 AM IST (`vercel.json`). The Hobby plan allows one cron per day.
- Replaced or deleted photos are updated and cleaned up on the next sync. Already-uploaded photos are skipped, so later syncs are quick.

## Troubleshooting

| Problem | Fix |
|---|---|
| Empty page | Run the sync URL. Check SKUs match between Drive and Sheet. |
| Sync says Unauthorized | `key` must equal `CRON_SECRET`. Redeploy after adding variables. |
| `File not found` / `403` | Share the Drive folder and Sheet with the service account email. |
| Private key error | Paste `GOOGLE_PRIVATE_KEY` including the BEGIN and END lines. |
| Sync times out | Run it again. Already-uploaded photos are skipped and it continues. |
| WhatsApp opens with no chat | Check `WHATSAPP_NUMBER` has country code and no `+` or spaces. |

## Notes

- WhatsApp links cannot attach images, so each item in the message includes its photo link, which WhatsApp previews in the chat.
- Vercel's Hobby plan is meant for non-commercial use. Move to Pro when the site is live for business.
- Local test: `npm install`, copy `.env.example` to `.env.local`, `npm run dev`.
