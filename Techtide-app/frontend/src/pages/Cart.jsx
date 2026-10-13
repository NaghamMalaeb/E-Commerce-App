import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, subtotal, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="spinner" />;

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h3>Your cart is empty</h3>
        <p>Browse the shop to find something you'll love.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Shop now</Link>
      </div>
    );
  }

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="page container cart-page">
      <h1>Your cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.cart_item_id}>
              <img src={item.image_url} alt={item.name} />
              <div className="cart-item-info">
                <Link to={`/product/${item.slug}`}>{item.name}</Link>
                <p className="price">${Number(item.price).toFixed(2)}</p>
              </div>
              <select
                value={item.quantity}
                onChange={(e) => updateQuantity(item.cart_item_id, Number(e.target.value))}
              >
                {Array.from({ length: Math.min(item.stock, 10) || 1 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <p className="cart-item-line-total">${(item.price * item.quantity).toFixed(2)}</p>
              <button className="cart-item-remove" onClick={() => removeItem(item.cart_item_id)} aria-label="Remove item">
                Remove
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h3>Order summary</h3>
          <div className="cart-summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="cart-summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
          <div className="cart-summary-row cart-summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Checkout
          </button>
        </aside>
      </div>
    </div>
  );
}
