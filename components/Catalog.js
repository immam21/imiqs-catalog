'use client';
import { useMemo, useState } from 'react';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.2c-5.4 0-9.8 4.4-9.8 9.8 0 1.7.45 3.35 1.3 4.8L2 22l5.35-1.4a9.8 9.8 0 0 0 4.65 1.18h.01c5.4 0 9.8-4.4 9.8-9.8s-4.4-9.78-9.8-9.78zm0 17.9h-.01a8.1 8.1 0 0 1-4.14-1.14l-.3-.18-3.17.83.85-3.1-.2-.32a8.1 8.1 0 1 1 6.97 3.9zm4.46-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.35-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.83-.84 2.02s.86 2.35.98 2.51c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28z"
      />
    </svg>
  );
}

export default function Catalog({ products, phone }) {
  const [sel, setSel] = useState([]);
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);
  const [pic, setPic] = useState(0);

  const cats = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );
  const shown = cat === 'All' ? products : products.filter((p) => p.category === cat);
  const chosen = products.filter((p) => sel.includes(p.sku));
  const total = chosen.reduce((a, p) => a + p.price, 0);

  const toggle = (sku) => setSel((s) => (s.includes(sku) ? s.filter((x) => x !== sku) : [...s, sku]));
  const show = (p) => { setOpen(p); setPic(0); };

  const send = () => {
    const lines = chosen.map(
      (p, i) => `${i + 1}. ${p.sku} — ${p.name} — ${inr(p.price)}\n${p.images[0].full}`
    );
    const text = `Hi Imiqs Fashion, I'd like to confirm this order:\n\n${lines.join('\n\n')}\n\nTotal: ${inr(total)}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className={chosen.length ? 'has-bar' : ''}>
      <header className="top">
        <p className="mark">Imiqs</p>
        <h1>Fashion jewellery, chosen by hand</h1>
        <p className="sub">Tap a piece to look closer. Select what you love, and confirm on WhatsApp.</p>
      </header>

      {cats.length > 2 && (
        <nav className="cats">
          {cats.map((c) => (
            <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </nav>
      )}

      {shown.length === 0 && (
        <p className="empty">Nothing to show here yet — new pieces are on their way.</p>
      )}

      <section className="grid">
        {shown.map((p) => {
          const on = sel.includes(p.sku);
          return (
            <article key={p.sku} className={on ? 'card picked' : 'card'}>
              <button className="pic" onClick={() => show(p)} aria-label={`View ${p.name}`}>
                <img src={p.images[0].thumb} alt={p.name} loading="lazy" />
                {p.images.length > 1 && <span className="count">{p.images.length} photos</span>}
                {!p.inStock && <span className="sold">Sold out</span>}
                <span className={on ? 'check on' : 'check'} aria-hidden="true">✓</span>
              </button>
              <div className="info">
                <h2>{p.name}</h2>
                <p className="sku">{p.sku}</p>
                <div className="row">
                  <strong>{inr(p.price)}</strong>
                  <button className="sel" disabled={!p.inStock} onClick={() => toggle(p.sku)}>
                    {!p.inStock ? 'Unavailable' : on ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {open && (
        <div className="lb" onClick={() => setOpen(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setOpen(null)} aria-label="Close">×</button>
            <div className="sheet-pic">
              <img src={open.images[pic].full} alt={open.name} />
            </div>
            {open.images.length > 1 && (
              <div className="strip">
                {open.images.map((im, i) => (
                  <button key={i} className={i === pic ? 'on' : ''} onClick={() => setPic(i)} aria-label={`Photo ${i + 1}`}>
                    <img src={im.thumb} alt="" />
                  </button>
                ))}
              </div>
            )}
            <div className="detail">
              <h2>{open.name}</h2>
              <p className="sku">{open.sku}</p>
              <strong>{inr(open.price)}</strong>
              {open.description && <p className="desc">{open.description}</p>}
              <button className="sel wide" disabled={!open.inStock} onClick={() => toggle(open.sku)}>
                {!open.inStock ? 'Unavailable' : sel.includes(open.sku) ? 'Selected' : 'Select this piece'}
              </button>
            </div>
          </div>
        </div>
      )}

      {chosen.length > 0 && (
        <div className="bar">
          <span>{chosen.length} selected · {inr(total)}</span>
          <button onClick={send}><WhatsAppIcon /> Confirm on WhatsApp</button>
        </div>
      )}
    </main>
  );
}