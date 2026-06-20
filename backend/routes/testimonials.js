const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');
const { logActivity } = require('../utils/logger');

// GET all testimonials (public)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create testimonial
router.post('/', adminAuth, async (req, res) => {
  const { name, customer_position, image_url, review } = req.body;
  const { data, error } = await supabase
    .from('testimonials')
    .insert([{ name, customer_position, image_url, review }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  logActivity(req.user?.username, 'Create Testimonial', `Added testimonial from "${name}"`);
  res.status(201).json(data);
});

// PUT update testimonial
router.put('/:id', adminAuth, async (req, res) => {
  const { name, customer_position, image_url, review } = req.body;
  const { data, error } = await supabase
    .from('testimonials')
    .update({ name, customer_position, image_url, review })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  logActivity(req.user?.username, 'Update Testimonial', `Updated testimonial from "${name}"`);
  res.json(data);
});

// DELETE testimonial
router.delete('/:id', adminAuth, async (req, res) => {
  const { data: t } = await supabase
    .from('testimonials')
    .select('name')
    .eq('id', req.params.id)
    .single();
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  logActivity(req.user?.username, 'Delete Testimonial', `Deleted testimonial from "${t?.name || 'Unknown'}"`);
  res.json({ success: true });
});

module.exports = router;
