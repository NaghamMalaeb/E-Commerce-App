const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET && process.env.JWT_SECRET.trim()
    ? process.env.JWT_SECRET.trim()
    : 'dev-only-insecure-fallback-secret-change-me';

if (JWT_SECRET === 'dev-only-insecure-fallback-secret-change-me') {
  console.warn(
    '⚠️  JWT_SECRET is not set — using insecure fallback. Set it before deploying.'
  );
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,   
      role: user.role,       
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  const {
    password,
    password_hash,
    ...safe
  } = user;
  return safe;
}

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    try {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (existing.length > 0) {
        return res
          .status(409)
          .json({ message: 'An account with this email already exists.' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashed, 'customer']
      );

      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [
        result.insertId,
      ]);
      const user = rows[0];
      const token = signToken(user);

      res.status(201).json({ token, user: sanitizeUser(user) });
    } catch (err) {
      console.error('register error:', err);
      res
        .status(500)
        .json({ message: 'Something went wrong while registering.' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      // ⬇ This token now carries { id, email, role } — admin works
      const token = signToken(user);

      res.json({ token, user: sanitizeUser(user) });
    } catch (err) {
      console.error('login error:', err);
      res.status(500).json({ message: 'Something went wrong while logging in.' });
    }
  }
);


router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [
      req.user.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user: sanitizeUser(rows[0]) });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

module.exports = router;