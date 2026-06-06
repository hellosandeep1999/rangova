const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

router.get('/:key', async (req, res) => {
  const { data, error } = await supabase.from('site_settings').select('value').eq('key', req.params.key).single();
  if (error) return res.json(null);
  res.json(data?.value);
});

router.put('/:key', adminAuth, async (req, res) => {
  const { value } = req.body;
  const { data, error } = await supabase.from('site_settings')
    .upsert({ key: req.params.key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
