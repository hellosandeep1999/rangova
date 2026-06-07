const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');
const { logActivity } = require('../utils/logger');

router.get('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('inventory').select('*').order('product_id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/:id', adminAuth, async (req, res) => {
  const { stock_qty } = req.body;
  // Get current state first
  const { data: current } = await supabase.from('inventory').select('*').eq('id', req.params.id).single();
  
  const { data, error } = await supabase.from('inventory').update({ stock_qty }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(
    req.user?.username,
    'Update Inventory',
    `Updated inventory quantity for product ID ${current?.product_id || 'Unknown'} (${current?.size || '-'}/${current?.color || '-'}) from ${current?.stock_qty || 0} to ${stock_qty}`
  );
  
  res.json(data);
});

router.post('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('inventory').insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(
    req.user?.username,
    'Add Inventory',
    `Added inventory of ${data.stock_qty} for product ID ${data.product_id} (${data.size || '-'}/${data.color || '-'})`
  );
  
  res.status(201).json(data);
});

router.delete('/:id', adminAuth, async (req, res) => {
  const { data: item } = await supabase.from('inventory').select('*').eq('id', req.params.id).single();
  
  const { error } = await supabase.from('inventory').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(
    req.user?.username,
    'Delete Inventory',
    `Deleted inventory item ID: ${req.params.id} for product ID ${item?.product_id || 'Unknown'} (${item?.size || '-'}/${item?.color || '-'})`
  );
  
  res.json({ success: true });
});

module.exports = router;
