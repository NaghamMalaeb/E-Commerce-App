const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price,
              p.image_url, p.stock, p.slug
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? AND p.is_active = TRUE
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );
    const subtotal = rows.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    res.json({ items: rows, subtotal: Number(subtotal.toFixed(2)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load your cart.' });
  }
});

// POST /api/cart  { product_id, quantity }
router.post('/', async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ message: 'product_id is required.' });

  try {
    const [productRows] = await pool.query('SELECT * FROM products WHERE id = ? AND is_active = TRUE', [product_id]);
    if (productRows.length === 0) return res.status(404).json({ message: 'Product not found.' });
    if (productRows[0].stock < quantity) return res.status(400).json({ message: 'Not enough stock available.' });

    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, quantity]
    );

    res.status(201).json({ message: 'Added to cart.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not add to cart.' });
  }
});

// PUT /api/cart/:cartItemId  { quantity }
router.put('/:cartItemId', async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1.' });

  try {
    const [rows] = await pool.query('SELECT * FROM cart_items WHERE id = ? AND user_id = ?', [req.params.cartItemId, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Cart item not found.' });

    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.cartItemId]);
    res.json({ message: 'Cart updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update cart.' });
  }
});

// DELETE /api/cart/:cartItemId
router.delete('/:cartItemId', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.cartItemId, req.user.id]);
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not remove item.' });
  }
});

// DELETE /api/cart  (clear cart)
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not clear cart.' });
  }
});

module.exports = router;
