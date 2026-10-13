const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// GET /api/products?category=&search=&sort=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = 'WHERE p.is_active = TRUE';
    const params = [];

    if (category) {
      where += ' AND c.slug = ?';
      params.push(category);
    }
    if (search) {
      where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    if (sort === 'price_desc') orderBy = 'p.price DESC';
    if (sort === 'name_asc') orderBy = 'p.name ASC';

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );

    res.json({ products: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load products.' });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load categories.' });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [req.params.slug]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Product not found.' });

    const [images] = await pool.query(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
      [rows[0].id]
    );

    res.json({ product: rows[0], images: images.map((i) => i.image_url) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load product.' });
  }
});

//-- Admin-only product management --

// POST /api/products  (admin: create product)
router.post(
  '/',
  requireAuth,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be 0 or more'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description, price, compare_at_price, category_id, image_url, stock, sku } = req.body;
    const slug = slugify(name) + '-' + Date.now().toString(36);

    try {
      const [result] = await pool.query(
        `INSERT INTO products (name, slug, description, price, compare_at_price, category_id, image_url, stock, sku)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, slug, description || null, price, compare_at_price || null, category_id || null, image_url || null, stock, sku || null]
      );
      const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
      res.status(201).json({ product: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Could not create product.' });
    }
  }
);

// PUT /api/products/:id  (admin: update product)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, description, price, compare_at_price, category_id, image_url, stock, sku, is_active } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Product not found.' });

    await pool.query(
      `UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        compare_at_price = ?,
        category_id = ?,
        image_url = COALESCE(?, image_url),
        stock = COALESCE(?, stock),
        sku = COALESCE(?, sku),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name, description, price,
        compare_at_price ?? existing[0].compare_at_price,
        category_id ?? existing[0].category_id,
        image_url, stock, sku,
        typeof is_active === 'boolean' ? is_active : existing[0].is_active,
        req.params.id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({ product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update product.' });
  }
});

// DELETE /api/products/:id  (admin: soft-delete product)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product removed.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not delete product.' });
  }
});

// GET /api/products/admin/all  (admin: see inactive + active products)
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC`
    );
    res.json({ products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load products.' });
  }
});

module.exports = router;
