const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

// Get all activity logs
router.get('/', adminAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('admin_activity')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Post a new activity log
router.post('/', adminAuth, async (req, res) => {
  const { action, details } = req.body;
  const admin_user = req.user ? req.user.username : 'Admin';
  
  const { data, error } = await supabase
    .from('admin_activity')
    .insert([{ action, details, admin_user, created_at: new Date().toISOString() }])
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;
