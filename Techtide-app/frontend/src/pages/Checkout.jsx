import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import './Checkout.css';

const EMPTY_ADDRESS = {
  full_name: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: '', phone: '',
};

const EMPTY_CARD = { card_number: '', expiry: '', cvc: '' };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [card, setCard] = useState(EMPTY_CARD);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const addressComplete = address.full_name && address.line1 && address.city && address.postal_code && address.country;
  const cardComplete = card.card_number.replace(/\s/g, '').length >= 12 && card.expiry.length >= 4 && card.cvc.length >= 3;

  function handleAddressChange(e) {
    setAddress({ ...address, [e.target.name]: e.target.value });
  }

  function handleCardChange(e) {
    setCard({ ...card, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!addressComplete) {
      setError('Please complete your shipping address.');
      return;
    }
    if (!cardComplete) {
      setError('Please enter card details to continue (this is a simulated payment — no real card is charged).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Simulated payment: no real charge happens here. A short delay
      // stands in for a payment processor round-trip.
      await new Promise((resolve) => setTimeout(resolve, 700));

      const { data } = await api.post('/orders', { shipping_address: address });
      await clearCart();
      navigate(`/order-confirmation/${data.orderId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place your order.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page container checkout-page">
      <h1>Checkout</h1>
      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="checkout-layout">
        <div>
          <section className="checkout-section">
            <h3>Shipping address</h3>
            <div className="checkout-address-grid">
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="full_name">Full name</label>
                <input id="full_name" name="full_name" value={address.full_name} onChange={handleAddressChange} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="line1">Address</label>
                <input id="line1" name="line1" value={address.line1} onChange={handleAddressChange} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="line2">Apartment, suite, etc. (optional)</label>
                <input id="line2" name="line2" value={address.line2} onChange={handleAddressChange} />
              </div>
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" name="city" value={address.city} onChange={handleAddressChange} />
              </div>
              <div className="field">
                <label htmlFor="state">State / Province</label>
                <input id="state" name="state" value={address.state} onChange={handleAddressChange} />
              </div>
              <div className="field">
                <label htmlFor="postal_code">Postal code</label>
                <input id="postal_code" name="postal_code" value={address.postal_code} onChange={handleAddressChange} />
              </div>
              <div className="field">
                <label htmlFor="country">Country</label>
                <input id="country" name="country" value={address.country} onChange={handleAddressChange} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="phone">Phone (optional)</label>
                <input id="phone" name="phone" value={address.phone} onChange={handleAddressChange} />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h3>Payment</h3>
            <p className="checkout-simulated-note">
              This is a simulated checkout — no real card is charged and no payment data is stored.
            </p>
            <div className="checkout-address-grid">
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="card_number">Card number</label>
                <input
                  id="card_number"
                  name="card_number"
                  placeholder="4242 4242 4242 4242"
                  value={card.card_number}
                  onChange={handleCardChange}
                />
              </div>
              <div className="field">
                <label htmlFor="expiry">Expiry (MM/YY)</label>
                <input id="expiry" name="expiry" placeholder="12/28" value={card.expiry} onChange={handleCardChange} />
              </div>
              <div className="field">
                <label htmlFor="cvc">CVC</label>
                <input id="cvc" name="cvc" placeholder="123" value={card.cvc} onChange={handleCardChange} />
              </div>
            </div>

            <button className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Processing…' : `Place order — $${total.toFixed(2)}`}
            </button>
          </section>
        </div>

        <aside className="cart-summary">
          <h3>Order summary</h3>
          {items.map((item) => (
            <div className="cart-summary-row" key={item.cart_item_id}>
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="cart-summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="cart-summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
          <div className="cart-summary-row cart-summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </aside>
      </form>
    </div>
  );
}