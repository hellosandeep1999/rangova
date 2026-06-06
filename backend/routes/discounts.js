const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/active', async (req, res) => {
  const { data, error } = await supabase.from('discounts').select('*').eq('active', true).limit(1).single();
  if (error) return res.json(null);
  res.json(data);
});

router.post('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('discounts').insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('discounts').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('discounts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
