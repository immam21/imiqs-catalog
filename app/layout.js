import Script from 'next/script';
import './globals.css';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata = {
  title: 'Imiqs Fashion Jewellery | Luxury Collection',
  description: 'Browse luxury jewellery, curated statement pieces, and enquire over WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {PIXEL_ID ? (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        ) : null}
        {children}
      </body>
    </html>
  );
}
