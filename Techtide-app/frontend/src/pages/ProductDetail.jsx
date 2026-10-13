import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { MOCK_PRODUCTS } from './Shop';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
      if (found) {
        setProduct(found);
        setImages([found.image_url]);
        setActiveImage(found.image_url);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [slug]);

  async function handleAddToCart() {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/product/${slug}` } } });
      return;
    }
    setAdding(true);
    setMessage('');
    try {
      await addToCart(product.id, quantity);
      setMessage('Added to your cart.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="spinner" />;

  if (!product) {
    return (
      <div className="page container">
        <div className="empty-state" style={{ marginTop: 60 }}>
          <h3>Product not found</h3>
          <p>That product may have been removed or the link is broken.</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            onClick={() => navigate('/shop')}
          >
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  const onSale =
    product.compare_at_price &&
    Number(product.compare_at_price) > Number(product.price);

  return (
    <div className="page container product-detail">
      {/* ---------- GALLERY ---------- */}
      <div className="product-detail-gallery">
        <div className="product-detail-main-image">
          <img src={activeImage} alt={product.name} />
        </div>
        {images.length > 1 && (
          <div className="product-detail-thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                className={img === activeImage ? 'active' : ''}
                onClick={() => setActiveImage(img)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------- INFO ---------- */}
      <div className="product-detail-info">
        <h1>{product.name}</h1>

        <p className="product-detail-price">
          {onSale && (
            <span className="price-strike">
              ${Number(product.compare_at_price).toFixed(2)}
            </span>
          )}
          <span className="price">${Number(product.price).toFixed(2)}</span>
        </p>

        <p className="product-detail-desc">
          Premium quality product crafted with attention to detail. Designed
          for everyday performance and lasting durability.
        </p>

        <p className="product-detail-stock">
          {product.stock === 0
            ? 'Out of stock'
            : product.stock <= 5
            ? `Only ${product.stock} left`
            : 'In stock'}
        </p>

        <div className="product-detail-actions">
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={product.stock === 0}
            aria-label="Quantity"
          >
            {Array.from(
              { length: Math.min(product.stock, 10) || 1 },
              (_, i) => i + 1
            ).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            className="btn btn-primary"
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
          >
            {product.stock === 0
              ? 'Sold out'
              : adding
              ? 'Adding…'
              : 'Add to cart'}
          </button>
        </div>

        {message && <p className="product-detail-message">{message}</p>}
      </div>
    </div>
  );
}