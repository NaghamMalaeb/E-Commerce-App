import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => {
        setOrder(data.order);
        setItems(data.items);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!order) return <div className="empty-state"><h3>Order not found</h3></div>;

  return (
    <div className="page container narrow" style={{ textAlign: 'center' }}>
      <span className="badge" style={{ marginBottom: 16 }}>Order placed</span>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Thank you — order #{order.id}</h1>
      <p style={{ color: 'var(--ink-soft)', marginBottom: 32 }}>
        A confirmation has been recorded for your order. You can track its status from your order history.
      </p>

      <div style={{ textAlign: 'left', border: '1px solid var(--line)', borderRadius: 6, padding: 24, marginBottom: 24 }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.92rem' }}>
            <span>{item.product_name} × {item.quantity}</span>
            <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <Link to="/shop" className="btn btn-primary">Continue shopping</Link>
    </div>
  );
}
