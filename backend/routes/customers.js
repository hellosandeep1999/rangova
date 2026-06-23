const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');
const { logActivity } = require('../utils/logger');

router.get('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET check if customer email exists (public - used during signup)
router.get('/check-email/:email', async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const { data } = await supabase.from('customers').select('id, email').eq('email', email).single();
  res.json({ exists: !!data });
});


// GET customer orders
router.get('/:id/orders', adminAuth, async (req, res) => {
  const { data: customer } = await supabase.from('customers').select('email').eq('id', req.params.id).single();
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  const { data, error } = await supabase.from('orders').select('*').eq('customer_email', customer.email).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET orders by email (for customer portal)
router.get('/orders-by-email/:email', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_email', decodeURIComponent(req.params.email))
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST sync customer upon Auth verify
router.post('/sync', async (req, res) => {
  const { name, email, phone } = req.body;
  const { data: existing } = await supabase.from('customers').select('*').eq('email', email).single();
  if (existing) {
    return res.json(existing);
  } else {
    const { data, error } = await supabase.from('customers').insert([{
      name, email, phone, status: 'active', total_orders: 0, total_spent: 0
    }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
});


// PATCH update customer status (block/unblock)
router.patch('/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be "active" or "blocked".' });
  }
  const { data, error } = await supabase
    .from('customers')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  logActivity(req.user?.username, status === 'blocked' ? 'Blocked Customer' : 'Unblocked Customer', `Customer "${data.name || data.email}" status set to ${status}`);
  res.json(data);
});

module.exports = router;
