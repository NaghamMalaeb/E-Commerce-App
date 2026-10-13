import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { MOCK_PRODUCTS } from './Shop';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setProducts(MOCK_PRODUCTS.slice(0, 4));
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="home">
      {/* ==================== HERO ==================== */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />

        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">Now open · New tech store</p>
            <h1>
              The tech you <em>actually</em> want. No filler, no noise.
            </h1>
            <p className="hero-lede">
              Hand-picked headphones, laptops, cameras and gear from the brands
              that get the details right. Only what we'd buy ourselves.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn-hero-primary">
                <span>Browse the shop</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link to="/about" className="btn-hero-ghost">
                Our story
              </Link>
            </div>

            <div className="hero-meta">
              <div>
                <span className="hero-meta-num">24</span>
                <span className="hero-meta-label">Curated products</span>
              </div>
              <div>
                <span className="hero-meta-num">6</span>
                <span className="hero-meta-label">Categories</span>
              </div>
              <div>
                <span className="hero-meta-num">Free</span>
                <span className="hero-meta-label">Shipping over $50</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80"
                alt="A clean desk setup with a laptop and headphones"
              />
            </div>
            <div className="hero-badge">
              <span>Launched</span>
              <strong>This year</strong>
            </div>
          </div>
        </div>

        <div className="hero-scroll">
          <span>Scroll</span>
          <i />
        </div>
      </section>

      {/* ==================== VALUE STRIP ==================== */}
      <section className="value-strip">
        <div className="container value-strip-inner">
          <div className="value-item">
            <span className="value-icon">◆</span>
            <div>
              <h4>Free shipping</h4>
              <p>On every order over $50.</p>
            </div>
          </div>
          <div className="value-item">
            <span className="value-icon">◇</span>
            <div>
              <h4>Easy returns</h4>
              <p>30 days, no questions asked.</p>
            </div>
          </div>
          <div className="value-item">
            <span className="value-icon">●</span>
            <div>
              <h4>Secure checkout</h4>
              <p>Your details stay protected.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURED ==================== */}
      <section className="featured container">
        <div className="featured-heading">
          <div>
            <span className="featured-eyebrow">Just landed</span>
            <h2>Recently added</h2>
          </div>
          <Link to="/shop" className="featured-link">
            <span>View all</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== EDITORIAL BANNER ==================== */}
      <section className="editorial">
        <div className="container editorial-inner">
          <div className="editorial-image">
            <img
              src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&q=80"
              alt="A selection of tech devices on a table"
            />
          </div>
          <div className="editorial-copy">
            <span className="editorial-eyebrow">Why we're different</span>
            <h2>
              We don't list everything. We only list the <em>right</em> things.
            </h2>
            <p>
              Every product on this site has been tested, used, and argued over
              before it earned a spot. If we wouldn't buy it with our own
              money, it doesn't make the cut.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}