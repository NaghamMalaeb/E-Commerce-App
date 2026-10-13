import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { AdminNav } from './AdminDashboard';
import './Admin.css';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api.get('/orders/admin/all').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatusChange(orderId, status) {
    setError('');
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update order status.');
    }
  }

  return (
    <div className="page container admin-page">
      <AdminNav />
      <h1 className="admin-title">Orders</h1>

      {error && <div className="form-error-banner">{error}</div>}

      {loading ? (
        <div className="spinner" />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name}<br /><span style={{ color: 'var(--ink-soft)', fontSize: '0.8rem' }}>{o.customer_email}</span></td>
                <td>{new Date(o.created_at).toLocaleDateString()}</td>
                <td>
                  <span className="badge badge-outline" style={o.payment_status !== 'paid' ? { color: 'var(--danger)', borderColor: 'var(--danger)' } : {}}>
                    {o.payment_status}
                  </span>
                </td>
                <td>${Number(o.total).toFixed(2)}</td>
                <td>
                  <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
