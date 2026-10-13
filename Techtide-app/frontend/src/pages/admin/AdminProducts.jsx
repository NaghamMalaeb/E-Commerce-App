import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { AdminNav } from './AdminDashboard';
import './Admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    api
      .get('/products/admin/all')
      .then(({ data }) => setProducts(data.products))
      .catch((err) => setError(err.response?.data?.message || 'Could not load products.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(id, name) {
    if (!window.confirm(`Remove "${name}" from the store? This can be reversed by editing the product later.`)) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove product.');
    }
  }

  return (
    <div className="page container admin-page">
      <AdminNav />
      <div className="admin-toolbar">
        <h1 className="admin-title" style={{ marginBottom: 0 }}>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary btn-sm">Add product</Link>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      {loading ? (
        <div className="spinner" />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={p.image_url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', border: '1px solid var(--line)' }} />
                  {p.name}
                </td>
                <td>{p.category_name || '—'}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className="badge badge-outline" style={!p.is_active ? { color: 'var(--danger)', borderColor: 'var(--danger)' } : {}}>
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="admin-actions-cell">
                  <Link to={`/admin/products/${p.id}/edit`}>Edit</Link>
                  <button className="danger" onClick={() => handleDelete(p.id, p.name)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
