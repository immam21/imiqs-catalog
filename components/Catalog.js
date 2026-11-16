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
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [wish, setWish] = useState([]);

  const cats = useMemo(
    () => ['All', ...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let next = cat === 'All' ? products : products.filter((p) => p.category === cat);

    if (q) {
      next = next.filter((p) => {
        const haystack = [p.name, p.sku, p.category, p.description].join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }

    if (sort === 'low') next = [...next].sort((a, b) => a.price - b.price);
    if (sort === 'high') next = [...next].sort((a, b) => b.price - a.price);
    if (sort === 'name') next = [...next].sort((a, b) => a.name.localeCompare(b.name));

    return next;
  }, [products, cat, search, sort]);

  const chosen = products.filter((p) => sel.includes(p.sku));
  const total = chosen.reduce((a, p) => a + p.price, 0);
  const heroProducts = products.slice(0, 3);
  const bestSellers = [...products].sort((a, b) => b.price - a.price).slice(0, 4);

  const toggle = (sku) =>
    setSel((s) => (s.includes(sku) ? s.filter((x) => x !== sku) : [...s, sku]));
  const toggleWish = (sku) =>
    setWish((s) => (s.includes(sku) ? s.filter((x) => x !== sku) : [...s, sku]));
  const show = (p) => {
    setOpen(p);
    setPic(0);
  };

  const send = () => {
    const lines = chosen.map(
      (p, i) => `${i + 1}. ${p.sku} — ${p.name} — ${inr(p.price)}\n${p.images[0].full}`
    );
    const text = `Hi Imiqs Fashion, I'd like to confirm this order:\n\n${lines.join('\n\n')}\n\nTotal: ${inr(total)}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="catalog-page">
      <header className="lux-header">
        <div className="topbar">
          <div className="brand">
            <span className="brand-mark">IFJ</span>
            <div>
              <span className="brand-name">Imiqs Fashion</span>
              <small>Fine Jewellery</small>
            </div>
          </div>
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#collections">Collections</a>
            <a href="#new-arrivals">New Arrivals</a>
            <a href="#best-sellers">Best Sellers</a>
            <a href="#story">Our Story</a>
          </nav>
          <button className="nav-cta">Book a consultation</button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Crafted for everyday elegance</p>
          <h1>Jewellery that turns everyday moments into heirlooms.</h1>
          <p className="hero-text">
            Discover contemporary statement pieces, delicate layers, and signature adornments designed to celebrate life beautifully.
          </p>
          <div className="hero-actions">
            <a href="#collections" className="primary-btn">Shop Collection</a>
            <a href="#story" className="secondary-btn">Explore the story</a>
          </div>
          <ul className="hero-metrics">
            <li><strong>1200+</strong><span>curated pieces</span></li>
            <li><strong>4.9/5</strong><span>client love</span></li>
            <li><strong>24*7</strong><span>WhatsApp replies</span></li>
          </ul>
        </div>

        <div className="hero-visual" aria-label="Featured jewellery pieces">
          <div className="visual-card tall">
            {heroProducts[0] && <img src={heroProducts[0].images[0].full} alt={heroProducts[0].name} />}
          </div>
          <div className="visual-stack">
            <div className="visual-card short">
              {heroProducts[1] && <img src={heroProducts[1].images[0].full} alt={heroProducts[1].name} />}
            </div>
            <div className="visual-card short secondary-shot">
              {heroProducts[2] && <img src={heroProducts[2].images[0].full} alt={heroProducts[2].name} />}
            </div>
          </div>
        </div>
      </section>

      <section className="collection-overview" id="collections">
        <div className="section-header">
          <p className="eyebrow">Curated collections</p>
          <h2>Thoughtfully selected for every occasion</h2>
        </div>
        <div className="collection-grid">
          {cats.filter((c) => c !== 'All').slice(0, 3).map((category) => {
            const items = products.filter((p) => p.category === category);
            const firstItem = items[0];
            const count = items.length;
            return (
              <button key={category} className="collection-card" onClick={() => setCat(category)}>
                <div className="collection-image">
                  {firstItem && <img src={firstItem.images[0].full} alt={category} />}
                </div>
                <div className="collection-copy">
                  <span>{category}</span>
                  <strong>{count} {count === 1 ? 'signature piece' : 'signature pieces'}</strong>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="catalog-panel" id="new-arrivals">
        <div className="section-header split-header">
          <div>
            <p className="eyebrow">Luxury catalog</p>
            <h2>Elegance, in every collection</h2>
          </div>
          <div className="toolbar" aria-label="Catalogue controls">
            <label className="search-box">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.88 12.8l4.42 4.42 1.41-1.41-4.42-4.42A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" fill="currentColor"/></svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pieces"
                aria-label="Search jewellery catalog"
              />
            </label>
            <label className="sort-box">
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        </div>

        {cats.length > 1 && (
          <div className="category-tabs" aria-label="Filter by category">
            {cats.map((c) => (
              <button key={c} className={c === cat ? 'tab active' : 'tab'} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No pieces match your search yet</h3>
            <p>Try another category or search term to discover more jewellery.</p>
          </div>
        ) : (
          <section className="product-grid">
            {filtered.map((p) => {
              const on = sel.includes(p.sku);
              const wanted = wish.includes(p.sku);

              return (
                <article key={p.sku} className={on ? 'product-card selected' : 'product-card'}>
                  <div className="product-visual">
                    <button
                      className={wanted ? 'wish-btn active' : 'wish-btn'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWish(p.sku);
                      }}
                      aria-label={wanted ? `Remove ${p.name} from wishlist` : `Add ${p.name} to wishlist`}
                    >
                      ♥
                    </button>
                    <button className="image-button" onClick={() => show(p)} aria-label={`View ${p.name}`}>
                      <img src={p.images[0].thumb} alt={p.name} loading="lazy" />
                    </button>
                    <div className="badge-row">
                      <span className="mini-badge">{p.category || 'Jewellery'}</span>
                      {!p.inStock && <span className="sold-badge">Sold out</span>}
                    </div>
                  </div>

                  <div className="product-body">
                    <div className="product-meta">
                      <span>{p.category || 'Signature'}</span>
                      <span className="stock-state">{p.inStock ? 'Ready to ship' : 'Unavailable'}</span>
                    </div>
                    <h3>{p.name}</h3>
                    <p className="sku-text">{p.sku}</p>
                    <div className="product-footer">
                      <strong>{inr(p.price)}</strong>
                      <button
                        className={on ? 'select-btn selected-btn' : 'select-btn'}
                        disabled={!p.inStock}
                        onClick={() => toggle(p.sku)}
                      >
                        {!p.inStock ? 'Unavailable' : on ? 'Selected' : 'Select'}
                      </button>
                    </div>
                    <button className="details-link" onClick={() => show(p)}>View details</button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>

      <section className="best-sellers" id="best-sellers">
        <div className="section-header">
          <p className="eyebrow">Best sellers</p>
          <h2>Most-loved pieces from our signature edit</h2>
        </div>
        <div className="bestseller-grid">
          {bestSellers.map((p) => (
            <button key={p.sku} className="bestseller-card" onClick={() => show(p)}>
              <img src={p.images[0].thumb} alt={p.name} loading="lazy" />
              <div className="bestseller-copy">
                <span>{p.category}</span>
                <h3>{p.name}</h3>
                <strong>{inr(p.price)}</strong>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="brand-story" id="story">
        <div className="story-image">
          <img src={products[0]?.images?.[0]?.full || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80'} alt="Jewellery collection showcase" />
        </div>
        <div className="story-copy">
          <p className="eyebrow">Our story</p>
          <h2>Luxury with a personal touch.</h2>
          <p>
            Every piece in our collection is chosen to feel personal, elevated, and made for moments worth remembering — from thoughtful gifting to everyday rituals of self-expression.
          </p>
          <div className="story-points">
            <div>
              <strong>Handpicked</strong>
              <span>Curated for beauty, detail and lasting wear.</span>
            </div>
            <div>
              <strong>Thoughtful curation</strong>
              <span>Elegant silhouettes designed to mix beautifully.</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="lux-footer">
        <div>
          <p className="brand-mark footer-mark">Imiqs Fashion</p>
          <p>Luxury jewellery designed for life’s most meaningful moments.</p>
        </div>
        <div>
          <h4>Contact</h4>
          <a href={phone ? `https://wa.me/${phone}` : '#'}>WhatsApp concierge</a>
          <a href="mailto:hello@imiqs.com">hello@imiqs.com</a>
        </div>
        <div>
          <h4>Follow</h4>
          <a href="#">Instagram</a>
          <a href="#">Pinterest</a>
          <a href="#">Facebook</a>
        </div>
      </footer>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setOpen(null)} aria-label="Close details">×</button>
            <div className="modal-gallery">
              <img src={open.images[pic].full} alt={open.name} />
            </div>
            {open.images.length > 1 && (
              <div className="gallery-strip">
                {open.images.map((im, i) => (
                  <button key={i} className={i === pic ? 'strip-thumb active' : 'strip-thumb'} onClick={() => setPic(i)} aria-label={`Photo ${i + 1}`}>
                    <img src={im.thumb} alt="" />
                  </button>
                ))}
              </div>
            )}
            <div className="modal-details">
              <div className="detail-head">
                <span>{open.category || 'Signature'}</span>
                <span className="small-state">{open.inStock ? 'In stock' : 'Sold out'}</span>
              </div>
              <h3>{open.name}</h3>
              <p className="sku-text">{open.sku}</p>
              <strong className="detail-price">{inr(open.price)}</strong>
              {open.description && <p className="detail-description">{open.description}</p>}
              <div className="modal-actions">
                <button className={sel.includes(open.sku) ? 'main-select selected-btn' : 'main-select'} onClick={() => toggle(open.sku)} disabled={!open.inStock}>
                  {!open.inStock ? 'Unavailable' : sel.includes(open.sku) ? 'Selected' : 'Select this piece'}
                </button>
                <a className="whatsapp-link" href={phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hi Imiqs Fashion, I'm interested in ${open.name} (${open.sku}).`)}` : '#'} target="_blank" rel="noreferrer">
                  <WhatsAppIcon /> WhatsApp enquiry
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {chosen.length > 0 && (
        <div className="floating-bar">
          <span>{chosen.length} selected · {inr(total)}</span>
          <button onClick={send}><WhatsAppIcon /> Confirm on WhatsApp</button>
        </div>
      )}
    </main>
  );
}
