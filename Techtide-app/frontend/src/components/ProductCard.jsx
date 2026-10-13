import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const onSale =
    product.compare_at_price &&
    Number(product.compare_at_price) > Number(product.price);

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="product-card-image">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        {onSale && <span className="product-card-badge">Sale</span>}
        {product.stock === 0 && <span className="product-card-badge sold">Sold out</span>}
      </div>
      <div className="product-card-body">
        <h3 className="product-title">{product.name}</h3>
        <div className="product-price-row">
          {onSale && (
            <span className="price-strike">
              ${Number(product.compare_at_price).toFixed(2)}
            </span>
          )}
          <span className="price">${Number(product.price).toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}