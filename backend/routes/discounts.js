const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');
const { logActivity } = require('../utils/logger');

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/active', async (req, res) => {
  const { data, error } = await supabase.from('discounts').select('*').eq('active', true);
  if (error) return res.json([]);
  res.json(data);
});

router.post('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('discounts').insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  logActivity(req.user?.username, 'Added Discount', `Added discount code "${data.code}" (${data.percent}% off, type: ${data.type || 'all_orders'})`);
  
  res.status(201).json(data);
});

router.put('/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('discounts').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  logActivity(req.user?.username, 'Updated Discount', `Updated discount code "${data.code}" (Active: ${data.active}, Type: ${data.type || 'all_orders'})`);
  
  res.json(data);
});

router.delete('/:id', adminAuth, async (req, res) => {
  const { data: disc } = await supabase.from('discounts').select('code').eq('id', req.params.id).single();
  
  const { error } = await supabase.from('discounts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  
  logActivity(req.user?.username, 'Deleted Discount', `Deleted discount code "${disc?.code || 'Unknown'}" (ID: ${req.params.id})`);
  
  res.json({ success: true });
});

module.exports = router;
