const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');
const { logActivity } = require('../utils/logger');

// GET all products
router.get('/', async (req, res) => {
  const { data: products, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const { data: inventory, error: iError } = await supabase.from('inventory').select('*');
  if (iError) return res.status(500).json({ error: iError.message });

  const productsWithStock = products.map(p => {
    const pInv = inventory.filter(i => i.product_id === p.id);
    const totalQty = pInv.reduce((acc, curr) => acc + (curr.stock_qty || 0), 0);
    return {
      ...p,
      has_inventory_row: pInv.length > 0,
      in_stock: totalQty > 0,
      inventory: pInv
    };
  });

  const finalProducts = req.query.admin === 'true' 
    ? productsWithStock 
    : productsWithStock.filter(p => p.has_inventory_row);

  res.json(finalProducts);
});

// GET single product
router.get('/:id', async (req, res) => {
  const { data: prod, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Product not found' });

  const { data: pInv } = await supabase.from('inventory').select('*').eq('product_id', prod.id);
  const totalQty = (pInv || []).reduce((acc, curr) => acc + (curr.stock_qty || 0), 0);

  res.json({
    ...prod,
    in_stock: totalQty > 0,
    inventory: pInv || []
  });
});

// POST create product (admin only)
router.post('/', adminAuth, async (req, res) => {
  const product = req.body;
  const { data, error } = await supabase.from('products').insert([product]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(req.user?.username, 'Added Product', `Added product "${data.title}" (ID: ${data.id})`);
  
  res.status(201).json(data);
});

// PUT update product (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('products').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(req.user?.username, 'Updated Product', `Updated product "${data.title}" (ID: ${data.id})`);
  
  res.json(data);
});

// DELETE product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  // Fetch details first to log the title
  const { data: prod } = await supabase.from('products').select('title').eq('id', req.params.id).single();
  
  const { error } = await supabase.from('products').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  
  // Log activity
  logActivity(req.user?.username, 'Deleted Product', `Deleted product "${prod?.title || 'Unknown'}" (ID: ${req.params.id})`);
  
  res.json({ success: true });
});

module.exports = router;
