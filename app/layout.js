import './globals.css';

export const metadata = {
  title: 'Imiqs Fashion Jewellery | Luxury Collection',
  description: 'Browse luxury jewellery, curated statement pieces, and enquire over WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
