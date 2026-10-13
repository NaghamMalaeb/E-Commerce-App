const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();


router.post('/', requireAuth, async (req, res) => {
  const { shipping_address } = req.body;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [items] = await conn.query(
      `SELECT p.id AS product_id, p.name, p.price, p.image_url, p.stock, ci.quantity
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? AND p.is_active = TRUE FOR UPDATE`,
      [req.user.id]
    );

    if (items.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'Your cart is empty.' });
    }

    for (const item of items) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ message: `${item.name} no longer has enough stock.` });
      }
    }

    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const total = Number((subtotal + shipping + tax).toFixed(2));

    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, status, subtotal, shipping_fee, tax, total, shipping_address, payment_status)
       VALUES (?, 'pending', ?, ?, ?, ?, ?, 'paid')`,
      [req.user.id, subtotal, shipping, tax, total, JSON.stringify(shipping_address || {})]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, unit_price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.image_url, item.price, item.quantity]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await conn.query("UPDATE orders SET status = 'processing' WHERE id = ?", [orderId]);

    await conn.commit();
    res.status(201).json({ orderId, total });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Could not place your order.' });
  } finally {
    conn.release();
  }
});

// GET /api/orders  (current user's order history)
router.get('/', requireAuth, async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load your orders.' });
  }
});

// GET /api/orders/:id  (order detail, owner or admin only)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found.' });

    const order = orders[0];
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ order, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load order.' });
  }
});

// ---------- Admin ----------

// GET /api/orders/admin/all
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load orders.' });
  }
});

// PUT /api/orders/:id/status  { status }  (admin only)
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update order status.' });
  }
});

module.exports = router;