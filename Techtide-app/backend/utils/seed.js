require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const categories = ['Apparel', 'Footwear', 'Accessories', 'Home Goods'];

const products = [
  { name: 'Ridgeline Wool Jacket', category: 'Apparel', price: 168, stock: 24, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800' },
  { name: 'Everyday Canvas Tote', category: 'Accessories', price: 42, stock: 60, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800' },
  { name: 'Trailhead Leather Boots', category: 'Footwear', price: 210, stock: 15, image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800' },
  { name: 'Ceramic Pour-Over Set', category: 'Home Goods', price: 58, stock: 30, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800' },
  { name: 'Merino Crewneck Sweater', category: 'Apparel', price: 96, stock: 40, image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800' },
  { name: 'Minimalist Leather Wallet', category: 'Accessories', price: 54, stock: 50, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800' },
  { name: 'Cloud-Step Running Shoes', category: 'Footwear', price: 128, stock: 35, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' },
  { name: 'Linen Throw Blanket', category: 'Home Goods', price: 74, stock: 20, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800' },
];

async function seed() {
  console.log('Seeding database...');

  const categoryIds = {};
  for (const name of categories) {
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = name',
      [name, slugify(name)]
    );
    const [rows] = await pool.query('SELECT id FROM categories WHERE name = ?', [name]);
    categoryIds[name] = rows[0].id;
  }

  for (const p of products) {
    const slug = slugify(p.name);
    const [existing] = await pool.query('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existing.length > 0) continue;

    await pool.query(
      `INSERT INTO products (name, slug, description, price, category_id, image_url, stock, sku, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        p.name,
        slug,
        `${p.name} — crafted with quality materials and built to last.`,
        p.price,
        categoryIds[p.category],
        p.image,
        p.stock,
        slug.toUpperCase().replace(/-/g, ''),
      ]
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const [existingAdmin] = await pool.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

  if (existingAdmin.length === 0) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Store Admin', adminEmail, hashed, 'admin']
    );
    console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  console.log('✅ Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
