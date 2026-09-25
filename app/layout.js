import './globals.css';

export const metadata = {
  title: 'Imiqs Fashion Jewellery',
  description: 'Browse our jewellery collection and order on WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
