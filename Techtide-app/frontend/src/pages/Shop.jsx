import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Shop.css';

/* ------------------------------------------------------------------
   MOCK DATA — 54 products across 6 categories
   All image URLs are now unique per product.
------------------------------------------------------------------ */
const MOCK_CATEGORIES = [
  { id: 1, name: 'Audio',     slug: 'audio' },
  { id: 2, name: 'Computers', slug: 'computers' },
  { id: 3, name: 'Phones',    slug: 'phones' },
  { id: 4, name: 'Cameras',   slug: 'cameras' },
  { id: 5, name: 'Gaming',    slug: 'gaming' },
  { id: 6, name: 'Wearables', slug: 'wearables' },
];

export const MOCK_PRODUCTS = [
  /* ============================= AUDIO (10) ============================= */
  { id: 1,  name: 'Acoustic Max Headphones',    slug: 'acoustic-max',      price: 299.99, compare_at_price: 349.99, category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop', stock: 12 },
  { id: 2,  name: 'Sonos Era 300',              slug: 'sonos-era-300',     price: 449.00, compare_at_price: 499.00, category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&h=600&fit=crop', stock: 10 },
  { id: 3,  name: 'Sony WF-1000XM5',            slug: 'sony-wf-xm5',       price: 299.99, compare_at_price: null,   category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop', stock: 14 },
  { id: 4,  name: 'AirPods Pro 2',              slug: 'airpods-pro-2',     price: 249.00, compare_at_price: 279.00, category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&h=600&fit=crop', stock: 18 },
  { id: 5,  name: 'Bose QuietComfort',          slug: 'bose-qc',           price: 349.00, compare_at_price: 399.00, category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&h=600&fit=crop', stock: 13 },
  { id: 6,  name: 'Marshall Emberton II',       slug: 'marshall-emberton', price: 169.99, compare_at_price: null,   category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop', stock: 20 },
  { id: 7,  name: 'Sennheiser Momentum 4',      slug: 'sennheiser-m4',     price: 349.99, compare_at_price: 399.99, category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=600&fit=crop', stock: 8 },
  { id: 8,  name: 'JBL Flip 6',                 slug: 'jbl-flip-6',        price: 129.99, compare_at_price: null,   category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop', stock: 30 },
  { id: 9,  name: 'Beats Studio Pro',           slug: 'beats-studio-pro',  price: 349.99, compare_at_price: 379.99, category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop', stock: 11 },
  { id: 10, name: 'Audio-Technica ATH-M50x',    slug: 'ath-m50x',          price: 149.00, compare_at_price: 179.00, category_slug: 'audio',     image_url: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&h=600&fit=crop', stock: 25 },

  /* =========================== COMPUTERS (10) =========================== */
  { id: 11, name: 'MacBook Pro 16"',            slug: 'macbook-pro-16',    price: 2399.00, compare_at_price: null,   category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop', stock: 5 },
  { id: 12, name: 'Dell UltraSharp 32"',        slug: 'dell-32',           price: 899.99,  compare_at_price: null,   category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop', stock: 4 },
  { id: 13, name: 'Keychron Q1 Pro',            slug: 'keychron-q1',       price: 199.00,  compare_at_price: null,   category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop', stock: 20 },
  { id: 14, name: 'iPad Pro 12.9"',             slug: 'ipad-pro',          price: 1099.99, compare_at_price: 1199.99, category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=600&fit=crop', stock: 9 },
  { id: 15, name: 'Logitech MX Master 3S',      slug: 'mx-master-3s',      price: 99.99,   compare_at_price: null,   category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop', stock: 25 },
  { id: 16, name: 'Samsung 49" Odyssey G9',     slug: 'odyssey-g9',        price: 1299.00, compare_at_price: 1499.00, category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&h=600&fit=crop', stock: 3 },
  { id: 17, name: 'MacBook Air M3 13"',         slug: 'macbook-air-m3',    price: 1099.00, compare_at_price: null,   category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop', stock: 12 },
  { id: 18, name: 'LG UltraFine 27" 5K',        slug: 'lg-ultrafine-27',   price: 1299.00, compare_at_price: null,   category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&h=600&fit=crop', stock: 6 },
  { id: 19, name: 'iPad Air 11"',               slug: 'ipad-air-11',       price: 599.00,  compare_at_price: 649.00, category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop', stock: 15 },
  { id: 20, name: 'Herman Miller Monitor Arm',  slug: 'hm-arm',            price: 295.00,  compare_at_price: null,   category_slug: 'computers', image_url: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=600&h=600&fit=crop', stock: 18 },

  /* ============================ PHONES (8) ============================= */
  { id: 21, name: 'Galaxy S24 Ultra',           slug: 'galaxy-s24',        price: 1199.99, compare_at_price: 1299.99, category_slug: 'phones',    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop', stock: 8 },
  { id: 22, name: 'Pixel 8 Pro',                slug: 'pixel-8-pro',       price: 899.00,  compare_at_price: null,   category_slug: 'phones',    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop', stock: 7 },
  { id: 23, name: 'iPhone 15 Pro Max',          slug: 'iphone-15-pro-max', price: 1199.00, compare_at_price: null,   category_slug: 'phones',    image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop', stock: 10 },
  { id: 24, name: 'OnePlus 12',                 slug: 'oneplus-12',        price: 799.99,  compare_at_price: 899.99, category_slug: 'phones',    image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=600&fit=crop', stock: 9 },
  { id: 25, name: 'Nothing Phone (2)',          slug: 'nothing-phone-2',   price: 599.00,  compare_at_price: 699.00, category_slug: 'phones',    image_url: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=600&h=600&fit=crop', stock: 11 },
  { id: 26, name: 'iPhone 15',                  slug: 'iphone-15',         price: 799.00,  compare_at_price: null,   category_slug: 'phones',    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop', stock: 14 },
  { id: 27, name: 'Galaxy Z Flip 5',            slug: 'galaxy-z-flip-5',   price: 999.99,  compare_at_price: 1099.99, category_slug: 'phones',   image_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop', stock: 5 },
  { id: 28, name: 'Xiaomi 14 Ultra',            slug: 'xiaomi-14-ultra',   price: 1099.00, compare_at_price: null,   category_slug: 'phones',    image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop', stock: 6 },

  /* ============================ CAMERAS (9) ============================ */
  { id: 29, name: 'Fujifilm X-T5',              slug: 'fujifilm-xt5',      price: 1699.00, compare_at_price: null,   category_slug: 'cameras',   image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop', stock: 3 },
  { id: 30, name: 'DJI Air 3 Drone',            slug: 'dji-air-3',         price: 1099.00, compare_at_price: null,   category_slug: 'cameras',   image_url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&h=600&fit=crop', stock: 6 },
  { id: 31, name: 'Canon EOS R6 Mark II',       slug: 'canon-r6-ii',       price: 2499.00, compare_at_price: null,   category_slug: 'cameras',   image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop', stock: 2 },
  { id: 32, name: 'GoPro Hero 12',              slug: 'gopro-hero-12',     price: 399.99,  compare_at_price: null,   category_slug: 'cameras',   image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop', stock: 9 },
  { id: 33, name: 'Sony A7 IV',                 slug: 'sony-a7-iv',        price: 2499.00, compare_at_price: null,   category_slug: 'cameras',   image_url: 'https://images.unsplash.com/photo-1552168324-d612d77725e3?w=600&h=600&fit=crop', stock: 4 },
  { id: 34, name: 'Leica Q3',                   slug: 'leica-q3',          price: 5995.00, compare_at_price: null,   category_slug: 'cameras',   image_url: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=600&h=600&fit=crop', stock: 2 },
  { id: 35, name: 'Nikon Z6 II',                slug: 'nikon-z6-ii',       price: 1999.00, compare_at_price: 2199.00, category_slug: 'cameras',  image_url: 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=600&h=600&fit=crop', stock: 5 },
  { id: 36, name: 'Insta360 X4',                slug: 'insta360-x4',       price: 499.99,  compare_at_price: null,   category_slug: 'cameras',   image_url: 'https://i.pinimg.com/736x/d0/e4/e3/d0e4e3468acc7186f9049f01ea0615ed.jpg', stock: 12 },
  { id: 37, name: 'DJI Osmo Pocket 3',          slug: 'osmo-pocket-3',     price: 519.00,  compare_at_price: 549.00, category_slug: 'cameras',   image_url: 'https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?w=600&h=600&fit=crop', stock: 7 },

  /* ============================ GAMING (8) ============================= */
  { id: 38, name: 'PlayStation 5',              slug: 'ps5',               price: 499.99,  compare_at_price: null,   category_slug: 'gaming',    image_url: 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=600&h=600&fit=crop', stock: 15 },
  { id: 39, name: 'Nintendo Switch OLED',       slug: 'switch-oled',       price: 349.99,  compare_at_price: null,   category_slug: 'gaming',    image_url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&h=600&fit=crop', stock: 11 },
  { id: 40, name: 'Xbox Series X',              slug: 'xbox-series-x',     price: 499.99,  compare_at_price: null,   category_slug: 'gaming',    image_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=600&fit=crop', stock: 6 },
  { id: 41, name: 'Razer BlackWidow V4',        slug: 'razer-bw-v4',       price: 169.99,  compare_at_price: 199.99, category_slug: 'gaming',    image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop', stock: 16 },
  { id: 42, name: 'Steam Deck OLED',            slug: 'steam-deck-oled',   price: 549.00,  compare_at_price: null,   category_slug: 'gaming',    image_url: 'https://i.pinimg.com/736x/d5/9d/c6/d59dc6eeed6961b3e5ada39c30147bdc.jpg', stock: 8 },
  { id: 43, name: 'Logitech G Pro X Superlight',slug: 'gpro-superlight',   price: 159.99,  compare_at_price: null,   category_slug: 'gaming',    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=600&fit=crop', stock: 22 },
  { id: 44, name: 'Elgato Stream Deck MK.2',    slug: 'stream-deck-mk2',   price: 149.99,  compare_at_price: null,   category_slug: 'gaming',    image_url: 'https://i.pinimg.com/736x/bb/da/90/bbda90475a710f203af73d394d697d19.jpg', stock: 14 },
  { id: 45, name: 'HyperX Cloud Alpha',         slug: 'hyperx-cloud-alpha',price: 99.99,   compare_at_price: 119.99, category_slug: 'gaming',    image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop', stock: 25 },

  /* =========================== WEARABLES (9) =========================== */
  { id: 46, name: 'Apple Watch Ultra 2',        slug: 'watch-ultra-2',     price: 799.00,  compare_at_price: null,   category_slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop', stock: 7 },
  { id: 47, name: 'Garmin Fenix 7',             slug: 'garmin-fenix-7',    price: 699.99,  compare_at_price: 799.99, category_slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop', stock: 5 },
  { id: 48, name: 'Oura Ring Gen 3',            slug: 'oura-ring-3',       price: 299.00,  compare_at_price: null,   category_slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop', stock: 22 },
  { id: 49, name: 'Apple Watch Series 9',       slug: 'watch-s9',          price: 399.00,  compare_at_price: null,   category_slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&h=600&fit=crop', stock: 15 },
  { id: 50, name: 'Samsung Galaxy Watch 6',     slug: 'galaxy-watch-6',    price: 299.99,  compare_at_price: 349.99, category_slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&h=600&fit=crop', stock: 12 },
  { id: 51, name: 'Whoop 4.0',                  slug: 'whoop-4',           price: 239.00,  compare_at_price: null,   category_slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&h=600&fit=crop', stock: 18 },
  { id: 52, name: 'Fitbit Charge 6',            slug: 'fitbit-charge-6',   price: 159.95,  compare_at_price: null,   category_slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=600&fit=crop', stock: 20 },
  { id: 53, name: 'Amazfit GTR 4',              slug: 'amazfit-gtr-4',     price: 199.99,  compare_at_price: 249.99, category_slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=600&fit=crop', stock: 14 },
  { id: 54, name: 'Garmin Venu 3',              slug: 'garmin-venu-3',     price: 449.99,  compare_at_price: null,   category_slug: 'wearables', image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&h=600&fit=crop', stock: 9 },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const sort     = searchParams.get('sort')     || '';
  const page     = Number(searchParams.get('page') || 1);
  const limit    = 12;

  useEffect(() => {
    setCategories(MOCK_CATEGORIES);
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      let list = [...MOCK_PRODUCTS];

      if (category) list = list.filter((p) => p.category_slug === category);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q));
      }

      if (sort === 'price_asc')  list.sort((a, b) => a.price - b.price);
      if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      if (sort === 'name_asc')   list.sort((a, b) => a.name.localeCompare(b.name));

      const totalCount = list.length;
      const start = (page - 1) * limit;
      const paged = list.slice(start, start + limit);

      setProducts(paged);
      setTotal(totalCount);
      setLoading(false);
    }, 350);

    return () => clearTimeout(t);
  }, [category, search, sort, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  const totalPages = Math.ceil(total / limit);
  const activeCategoryName =
    MOCK_CATEGORIES.find((c) => c.slug === category)?.name || 'All products';

  return (
    <div className="shop-page">
      <header className="shop-header">
        <div className="container">
          <p className="shop-eyebrow">
            <span>The shop</span>
            <span className="shop-eyebrow-sep" />
            <span>{total} products</span>
          </p>
          <h1 className="shop-title">{activeCategoryName}</h1>
          <p className="shop-subtitle">
            {search
              ? `Showing results for "${search}"`
              : 'Hand-picked tech, tested in real life. No filler, no noise.'}
          </p>
        </div>
      </header>

      <div className="shop-toolbar-wrap">
        <div className="container">
          <div className="shop-toolbar">
            <div className="shop-toolbar-info">
              <span className="shop-toolbar-count">
                <strong>{total}</strong> {total === 1 ? 'item' : 'items'}
              </span>
              {search && (
                <span className="shop-toolbar-search">
                  “{search}”
                  <button onClick={() => updateParam('search', '')} aria-label="Clear search">×</button>
                </span>
              )}
            </div>

            <div className="shop-toolbar-sort">
              <label htmlFor="sort">Sort</label>
              <select id="sort" value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                <option value="">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container shop-layout">
        <aside className="shop-sidebar">
          <div className="shop-sidebar-inner">
            <div className="shop-filter-group">
              <h3>Categories</h3>
              <ul>
                <li>
                  <button
                    className={!category ? 'active' : ''}
                    onClick={() => updateParam('category', '')}
                  >
                    <span>All</span>
                    <span className="shop-filter-count">{MOCK_PRODUCTS.length}</span>
                  </button>
                </li>
                {categories.map((c) => {
                  const count = MOCK_PRODUCTS.filter((p) => p.category_slug === c.slug).length;
                  return (
                    <li key={c.id}>
                      <button
                        className={category === c.slug ? 'active' : ''}
                        onClick={() => updateParam('category', c.slug)}
                      >
                        <span>{c.name}</span>
                        <span className="shop-filter-count">{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="shop-sidebar-note">
              <p className="shop-sidebar-note-eyebrow">Why we're different</p>
              <p className="shop-sidebar-note-text">
                Every product on this page has been tested by us. If it didn't
                earn its place, it isn't here.
              </p>
            </div>
          </div>
        </aside>

        <main className="shop-main">
          {loading ? (
            <div className="shop-loading">
              <div className="spinner" />
              <p>Loading products…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="shop-empty">
              <div className="shop-empty-icon">◯</div>
              <h3>Nothing matches those filters</h3>
              <p>Try a different search or clear your filters.</p>
              <button className="shop-empty-btn" onClick={() => setSearchParams({})}>
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="shop-grid">
                {products.map((p, i) => (
                  <div
                    key={p.id}
                    className="shop-grid-item"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="shop-pagination" aria-label="Pagination">
                  <button
                    className="shop-page-btn shop-page-btn-prev"
                    disabled={page === 1}
                    onClick={() => updateParam('page', String(page - 1))}
                    aria-label="Previous page"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`shop-page-btn ${p === page ? 'active' : ''}`}
                      onClick={() => updateParam('page', String(p))}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    className="shop-page-btn shop-page-btn-next"
                    disabled={page === totalPages}
                    onClick={() => updateParam('page', String(page + 1))}
                    aria-label="Next page"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}