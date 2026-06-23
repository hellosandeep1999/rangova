const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET all addresses for a customer by email
router.get('/:email', async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('customer_email', email)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// POST create a new address
router.post('/', async (req, res) => {
  const { customer_email, label, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default } = req.body;
  if (!customer_email || !address_line1 || !city || !state || !pincode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // If marking as default, unset other defaults first
  if (is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('customer_email', customer_email);
  }

  const { data, error } = await supabase.from('addresses').insert([{
    customer_email,
    label: label || 'Home',
    full_name,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    pincode,
    country: country || 'India',
    is_default: is_default || false
  }]).select().single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT update an address
router.put('/:id', async (req, res) => {
  const { label, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default, customer_email } = req.body;

  // If marking as default, unset other defaults first
  if (is_default && customer_email) {
    await supabase.from('addresses').update({ is_default: false }).eq('customer_email', customer_email);
  }

  const { data, error } = await supabase
    .from('addresses')
    .update({ label, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE an address
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('addresses').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
