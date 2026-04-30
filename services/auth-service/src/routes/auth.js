const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const users = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'agnector-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function makeToken(userId, email) {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const existing = [...users.values()].find((u) => u.email === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const id = uuidv4();
    const user = {
      id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366F1&color=fff&size=128`,
      plan: 'free',
      createdAt: new Date().toISOString(),
    };
    users.set(id, user);
    const token = makeToken(id, user.email);
    res.status(201).json({ user: sanitize(user), token });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = [...users.values()].find((u) => u.email === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = makeToken(user.id, user.email);
    res.json({ user: sanitize(user), token });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  const user = users.get(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: sanitize(user) });
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const user = users.get(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { name, avatar } = req.body;
    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;
    user.updatedAt = new Date().toISOString();
    users.set(user.id, user);
    res.json({ user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
