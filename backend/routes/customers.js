const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

router.get('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id/orders', adminAuth, async (req, res) => {
  const { data: customer } = await supabase.from('customers').select('email').eq('id', req.params.id).single();
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  const { data, error } = await supabase.from('orders').select('*').eq('customer_email', customer.email).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
