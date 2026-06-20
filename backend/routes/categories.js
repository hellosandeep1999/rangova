const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');
const { logActivity } = require('../utils/logger');

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*').order('idx');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('categories').insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(req.user?.username, 'Create Category', `Created category "${data.title || data.name}" (ID: ${data.id})`);
  
  res.status(201).json(data);
});

router.put('/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('categories').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(req.user?.username, 'Update Category', `Updated category "${data.title || data.name}" (ID: ${data.id})`);
  
  res.json(data);
});

router.delete('/:id', adminAuth, async (req, res) => {
  // Fetch details first to log the name
  const { data: cat } = await supabase.from('categories').select('title, name').eq('id', req.params.id).single();
  
  const { error } = await supabase.from('categories').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(req.user?.username, 'Delete Category', `Deleted category "${cat?.title || cat?.name || 'Unknown'}" (ID: ${req.params.id})`);
  
  res.json({ success: true });
});

module.exports = router;
