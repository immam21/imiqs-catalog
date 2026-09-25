'use client';
import { useMemo, useState } from 'react';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

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
      (p, i) => `${i + 1}. ${p.sku} - ${p.name} - ${inr(p.price)}\n${p.images[0].full}`
    );
    const text = `Hi Imiqs Fashion, I'd like to confirm this order:\n\n${lines.join('\n\n')}\n\nTotal: ${inr(total)}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main>
      <header className="top">
        <h1>Imiqs</h1>
        <p>Fashion jewellery. Pick your pieces and confirm on WhatsApp.</p>
      </header>

      {cats.length > 2 && (
        <nav className="cats">
          {cats.map((c) => (
            <button key={c} className={c === cat ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
          ))}
        </nav>
      )}

      {shown.length === 0 && <p className="empty">No products to show yet. Please check back soon.</p>}

      <section className="grid">
        {shown.map((p) => {
          const on = sel.includes(p.sku);
          return (
            <article key={p.sku} className={on ? 'card picked' : 'card'}>
              <button className="pic" onClick={() => show(p)} aria-label={`View ${p.name}`}>
                <img src={p.images[0].thumb} alt={p.name} loading="lazy" />
                {p.images.length > 1 && <span className="count">{p.images.length} photos</span>}
                {!p.inStock && <span className="sold">Sold out</span>}
              </button>
              <div className="info">
                <div>
                  <h2>{p.name}</h2>
                  <p className="sku">{p.sku}</p>
                </div>
                <strong>{inr(p.price)}</strong>
              </div>
              <button className="sel" disabled={!p.inStock} onClick={() => toggle(p.sku)}>
                {!p.inStock ? 'Unavailable' : on ? 'Selected' : 'Select'}
              </button>
            </article>
          );
        })}
      </section>

      {open && (
        <div className="lb" onClick={() => setOpen(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setOpen(null)} aria-label="Close">×</button>
            <img src={open.images[pic].full} alt={open.name} />
            {open.images.length > 1 && (
              <div className="strip">
                {open.images.map((im, i) => (
                  <button key={i} className={i === pic ? 'on' : ''} onClick={() => setPic(i)}>
                    <img src={im.thumb} alt="" />
                  </button>
                ))}
              </div>
            )}
            <div className="detail">
              <h2>{open.name}</h2>
              <p className="sku">{open.sku}</p>
              <strong>{inr(open.price)}</strong>
              {open.description && <p>{open.description}</p>}
              <button className="sel" disabled={!open.inStock} onClick={() => toggle(open.sku)}>
                {!open.inStock ? 'Unavailable' : sel.includes(open.sku) ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>
        </div>
      )}

      {chosen.length > 0 && (
        <div className="bar">
          <span>{chosen.length} selected · {inr(total)}</span>
          <button onClick={send}>Confirm order on WhatsApp</button>
        </div>
      )}
    </main>
  );
}
