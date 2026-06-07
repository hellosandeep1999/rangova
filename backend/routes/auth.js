const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/adminAuth');
const router = express.Router();

router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USERNAME || 'admin';
  const validPass = process.env.ADMIN_PASSWORD || 'Password@1234';

  if (username === validUser && password === validPass) {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
