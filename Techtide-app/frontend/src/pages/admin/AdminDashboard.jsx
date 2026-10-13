import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (!stats) return null;

  return (
    <div className="page container admin-page">
      <AdminNav />
      <h1 className="admin-title">Dashboard</h1>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <p>Total revenue</p>
          <h2>${stats.totalRevenue.toFixed(2)}</h2>
        </div>
        <div className="admin-stat-card">
          <p>Orders</p>
          <h2>{stats.totalOrders}</h2>
        </div>
        <div className="admin-stat-card">
          <p>Customers</p>
          <h2>{stats.totalCustomers}</h2>
        </div>
        <div className="admin-stat-card">
          <p>Active products</p>
          <h2>{stats.totalProducts}</h2>
        </div>
      </div>

      <div className="admin-two-col">
        <section>
          <h3>Recent orders</h3>
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td><Link to="/admin/orders">#{o.id}</Link></td>
                  <td>{o.customer_name}</td>
                  <td><span className="badge badge-outline">{o.status}</span></td>
                  <td>${Number(o.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3>Low stock</h3>
          {stats.lowStock.length === 0 ? (
            <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem' }}>Nothing running low right now.</p>
          ) : (
            <table className="data-table">
              <thead><tr><th>Product</th><th>Stock</th></tr></thead>
              <tbody>
                {stats.lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export function AdminNav() {
  return (
    <nav className="admin-subnav">
      <Link to="/admin">Overview</Link>
      <Link to="/admin/products">Products</Link>
      <Link to="/admin/orders">Orders</Link>
    </nav>
  );
}
