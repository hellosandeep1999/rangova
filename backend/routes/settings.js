const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');
const { logActivity } = require('../utils/logger');

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('store_settings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  
  // Convert array of {key, value} to a single object {key: value}
  const settingsObj = data.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
  
  res.json(settingsObj);
});

router.get('/:key', async (req, res) => {
  const { data, error } = await supabase.from('store_settings').select('value').eq('key', req.params.key).single();
  if (error) return res.json(null);
  res.json(data?.value);
});

router.put('/:key', adminAuth, async (req, res) => {
  const { value } = req.body;
  const { data, error } = await supabase.from('store_settings')
    .upsert({ key: req.params.key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(req.user?.username, 'Update Site Settings', `Updated setting "${req.params.key}" to "${value}"`);
  
  res.json(data);
});

module.exports = router;
