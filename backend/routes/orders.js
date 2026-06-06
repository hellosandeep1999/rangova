const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');

// GET all orders (admin)
router.get('/', adminAuth, async (req, res) => {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (req.query.status) query = query.eq('status', req.query.status);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST place order (public)
router.post('/', async (req, res) => {
  const order = { ...req.body, status: 'Pending' };
  const { data, error } = await supabase.from('orders').insert([order]).select().single();
  if (error) return res.status(500).json({ error: error.message });

  // Upsert customer
  if (order.customer_email) {
    const { data: existing } = await supabase.from('customers').select('id, total_orders, total_spent').eq('email', order.customer_email).single();
    if (existing) {
      await supabase.from('customers').update({
        total_orders: (existing.total_orders || 0) + 1,
        total_spent: (parseFloat(existing.total_spent) || 0) + parseFloat(order.total || 0)
      }).eq('id', existing.id);
    } else {
      await supabase.from('customers').insert([{
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone || '',
        total_orders: 1,
        total_spent: order.total || 0
      }]);
    }
  }

  res.status(201).json(data);
});

// PATCH update status (admin)
router.patch('/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET order slip (printable HTML)
router.get('/:id/slip', adminAuth, async (req, res) => {
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Order not found' });

  const items = Array.isArray(order.items) ? order.items : [];
  const itemRows = items.map(i => `<tr><td>${i.title}</td><td>${i.size || '-'} / ${i.color || '-'}</td><td>${i.quantity}</td><td>₹${i.price}</td><td>₹${i.price * i.quantity}</td></tr>`).join('');

  const slip = `<!DOCTYPE html><html><head><title>Order Slip #${order.id.slice(0,8)}</title>
  <style>body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:auto}h1{color:#2E2F30}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.total{font-size:1.2em;font-weight:bold}@media print{button{display:none}}</style>
  </head><body>
  <h1>RANGOVA — Order Slip</h1>
  <p><strong>Order ID:</strong> ${order.id}</p>
  <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
  <p><strong>Status:</strong> ${order.status}</p>
  <hr/>
  <h3>Customer Details</h3>
  <p>${order.customer_name}<br/>${order.customer_email}<br/>${order.customer_phone}</p>
  <p><strong>Shipping:</strong> ${order.shipping_address}, ${order.city}, ${order.state} - ${order.pincode}</p>
  <h3>Items</h3>
  <table><thead><tr><th>Product</th><th>Size/Color</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
  <tbody>${itemRows}</tbody></table>
  <p>Subtotal: ₹${order.subtotal}</p>
  <p>Discount: -₹${order.discount_amount || 0}</p>
  <p class="total">Total: ₹${order.total}</p>
  <button onclick="window.print()">Print Slip</button>
  </body></html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(slip);
});

module.exports = router;
