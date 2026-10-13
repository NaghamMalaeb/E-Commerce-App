import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLORS = {
  pending: 'var(--ink-soft)',
  processing: 'var(--gold)',
  shipped: 'var(--pine)',
  delivered: 'var(--pine-dark)',
  cancelled: 'var(--danger)',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <h3>No orders yet</h3>
        <p>Once you place an order, it will show up here.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 20 }}>Shop now</Link>
      </div>
    );
  }

  return (
    <div className="page container">
      <h1 style={{ marginBottom: 28, fontSize: '1.8rem' }}>Your orders</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{new Date(o.created_at).toLocaleDateString()}</td>
              <td>
                <span className="badge" style={{ background: STATUS_COLORS[o.status] || 'var(--ink-soft)' }}>
                  {o.status}
                </span>
              </td>
              <td>${Number(o.total).toFixed(2)}</td>
              <td><Link to={`/order-confirmation/${o.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
