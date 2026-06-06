const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

router.get('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('inventory').select('*').order('product_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/:id', adminAuth, async (req, res) => {
  const { stock_qty } = req.body;
  const { data, error } = await supabase.from('inventory').update({ stock_qty }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('inventory').insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.delete('/:id', adminAuth, async (req, res) => {
  const { error } = await supabase.from('inventory').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
