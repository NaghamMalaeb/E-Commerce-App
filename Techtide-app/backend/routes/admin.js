const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS totalRevenue FROM orders WHERE payment_status = 'paid'`
    );
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalCustomers }]] = await pool.query("SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'");
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products WHERE is_active = TRUE');
    const [lowStock] = await pool.query('SELECT id, name, stock FROM products WHERE is_active = TRUE AND stock <= 5 ORDER BY stock ASC LIMIT 5');
    const [recentOrders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at, u.name AS customer_name
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC LIMIT 5`
    );
    const [salesByDay] = await pool.query(
      `SELECT DATE(created_at) AS date, SUM(total) AS revenue
       FROM orders WHERE payment_status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`
    );

    res.json({
      totalRevenue: Number(totalRevenue),
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStock,
      recentOrders,
      salesByDay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load dashboard stats.' });
  }
});

module.exports = router;
