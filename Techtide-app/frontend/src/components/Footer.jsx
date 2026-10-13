import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* Decorative top accent */}
      <div className="footer-accent" />

      <div className="container footer-inner">
        {/* ---------- BRAND ---------- */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Kindred
            <span className="footer-logo-dot" />
          </Link>
          <p className="footer-tagline">
            Hand-picked tech, tested in real life. No filler, no noise.
          </p>

          <div className="footer-socials">
            <a href="https://instagram.com" aria-label="Instagram" className="footer-social">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
              </svg>
            </a>
            <a href="https://twitter.com" aria-label="Twitter" className="footer-social">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.3L1.6 2h6.5l4.4 5.8L18.9 2zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20z" />
              </svg>
            </a>
            <a href="https://youtube.com" aria-label="YouTube" className="footer-social">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="5" width="20" height="14" rx="4" />
                <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        {/* ---------- SHOP ---------- */}
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/shop?category=audio">Audio</Link></li>
            <li><Link to="/shop?category=computers">Computers</Link></li>
            <li><Link to="/shop?category=phones">Phones</Link></li>
            <li><Link to="/shop?category=cameras">Cameras</Link></li>
            <li><Link to="/shop?category=gaming">Gaming</Link></li>
          </ul>
        </div>

        {/* ---------- COMPANY ---------- */}
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About us</Link></li>
          </ul>
        </div>

        {/* ---------- ACCOUNT ---------- */}
        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><Link to="/orders">Order history</Link></li>
            <li><Link to="/login">Sign in</Link></li>
            <li><Link to="/register">Create account</Link></li>
            <li><Link to="/cart">Your cart</Link></li>
            <li><Link to="/about">Help center</Link></li>
          </ul>
        </div>

        {/* ---------- NEWSLETTER ---------- */}
        <div className="footer-newsletter">
          <h4>The Drop</h4>
          <p>New arrivals, restocks, and stories. Once a month, never more.</p>

          <form
            className="footer-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              required
            />
            <button type="submit" aria-label="Subscribe">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

          <p className="footer-form-note">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* ---------- BOTTOM BAR ---------- */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} Kindred. All rights reserved.</p>

          <ul className="footer-legal">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Cookies</a></li>
          </ul>

          <p className="footer-credit">
            Made with care, shipped worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}