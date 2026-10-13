import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { AdminNav } from './AdminDashboard';
import './Admin.css';

const EMPTY_FORM = {
  name: '', description: '', price: '', compare_at_price: '', category_id: '',
  image_url: '', stock: '', sku: '', is_active: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get('/products/admin/all').then(({ data }) => {
      const product = data.products.find((p) => String(p.id) === id);
      if (product) {
        setForm({
          name: product.name,
          description: product.description || '',
          price: product.price,
          compare_at_price: product.compare_at_price || '',
          category_id: product.category_id || '',
          image_url: product.image_url || '',
          stock: product.stock,
          sku: product.sku || '',
          is_active: Boolean(product.is_active),
        });
      }
      setLoading(false);
    });
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      category_id: form.category_id || null,
    };

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="spinner" />;

  return (
    <div className="page container admin-page">
      <AdminNav />
      <h1 className="admin-title">{isEdit ? 'Edit product' : 'Add product'}</h1>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form-grid">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="name">Product name</label>
          <input id="name" name="name" required value={form.name} onChange={handleChange} />
        </div>

        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="price">Price ($)</label>
          <input id="price" name="price" type="number" step="0.01" min="0.01" required value={form.price} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="compare_at_price">Compare-at price ($, optional)</label>
          <input id="compare_at_price" name="compare_at_price" type="number" step="0.01" min="0" value={form.compare_at_price} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="stock">Stock</label>
          <input id="stock" name="stock" type="number" min="0" required value={form.stock} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="sku">SKU (optional)</label>
          <input id="sku" name="sku" value={form.sku} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="category_id">Category</label>
          <select id="category_id" name="category_id" value={form.category_id} onChange={handleChange}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="image_url">Image URL</label>
          <input id="image_url" name="image_url" required value={form.image_url} onChange={handleChange} />
        </div>

        {isEdit && (
          <div className="field" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input id="is_active" name="is_active" type="checkbox" style={{ width: 'auto' }} checked={form.is_active} onChange={handleChange} />
            <label htmlFor="is_active" style={{ marginBottom: 0 }}>Visible in store</label>
          </div>
        )}

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
