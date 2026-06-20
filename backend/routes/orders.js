const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { adminAuth } = require('../middleware/adminAuth');
const { logActivity } = require('../utils/logger');

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random2 = Math.floor(Math.random() * 90) + 10;
  const count = Math.floor(Math.random() * 1000);
  return `RG-${dateStr}-${random2}-${String(count).padStart(3, '0')}`;
}

// GET all orders (admin)
router.get('/', adminAuth, async (req, res) => {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (req.query.status) query = query.eq('status', req.query.status);
  if (req.query.start_date) query = query.gte('created_at', req.query.start_date);
  if (req.query.end_date) query = query.lte('created_at', req.query.end_date + 'T23:59:59');
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  
  res.json(data);
});

// GET order by id (for barcode scan which now expects id since order_number isn't in DB)
router.get('/by-id/:id', adminAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Order not found' });
  res.json(data);
});

// POST place order (public)
router.post('/', async (req, res) => {
  try {
    const orderNumber = generateOrderNumber();
    const order = { ...req.body, id: orderNumber, status: 'Pending' };
    // Upsert customer FIRST to avoid foreign key violations if orders.customer_email references customers.email
    if (order.customer_email) {
      const { data: existing } = await supabase.from('customers').select('id, total_orders, total_spent, status, phone').eq('email', order.customer_email).single();
      if (existing) {
        if (existing.status === 'blocked') {
          return res.status(403).json({ error: 'You are blocked please contact from our support team' });
        }
        await supabase.from('customers').update({
          total_orders: (existing.total_orders || 0) + 1,
          total_spent: (parseFloat(existing.total_spent) || 0) + parseFloat(order.total || 0),
          phone: order.customer_phone || existing.phone
        }).eq('id', existing.id);
      } else {
        await supabase.from('customers').insert([{
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone || '',
          total_orders: 1,
          total_spent: order.total || 0,
          status: 'active'
        }]);
      }
    }

    const { data, error } = await supabase.from('orders').insert([order]).select().single();
    if (error) return res.status(500).json({ error: error.message });

    // Decrement inventory for each item ordered
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        // Find inventory row matching product by title, size, color
        // First find the product id
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .ilike('title', item.title)
          .single();

        if (product) {
          const { data: invRow } = await supabase
            .from('inventory')
            .select('id, stock_qty')
            .eq('product_id', product.id)
            .ilike('size', item.size || '')
            .ilike('color', item.color || '')
            .single();

          if (invRow && invRow.stock_qty > 0) {
            const newQty = Math.max(0, invRow.stock_qty - (item.quantity || 1));
            await supabase.from('inventory').update({ stock_qty: newQty }).eq('id', invRow.id);
          }
        }
      }
    }

    logActivity('System', 'Added Order', `New order ${orderNumber} placed by ${order.customer_name || order.customer_email}`);
    res.status(201).json(data);
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH update status (admin)
router.patch('/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  
  logActivity(req.user?.username, 'Updated Order Status', `Updated Order ${data.id} status to ${status}`);
  
  res.json(data);
});

// GET order slip (printable HTML) - kept for backward compat
router.get('/:id/slip', adminAuth, async (req, res) => {
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Order not found' });

  // Get store address from settings
  let storeAddress = 'Rangova, Jaipur, Rajasthan – 302020';
  const { data: addrSetting } = await supabase.from('store_settings').select('value').eq('key', 'company_address').single();
  if (addrSetting?.value) storeAddress = addrSetting.value;

  const items = Array.isArray(order.items) ? order.items : [];
  const itemRows = items.map(i => `<tr>
    <td>${i.title}<br/>Size/Color: ${i.size || '-'}/${i.color || '-'}</td>
    <td>-</td>
    <td style="text-align:center">${i.quantity}</td>
    <td style="text-align:right">${Number(i.price).toFixed(2)}</td>
    <td style="text-align:right">${(Number(i.price) * i.quantity).toFixed(2)}</td>
    <td style="text-align:right">0.00</td>
    <td style="text-align:right">${(Number(i.price) * i.quantity).toFixed(2)}</td>
  </tr>`).join('');
  const orderNum = order.id;

  const slip = `<!DOCTYPE html><html><head><title>Order Slip ${orderNum}</title>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: auto; color: #000; }
    .label-container { border: 2px solid #000; padding: 0; }
    .header-row { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding: 15px; }
    .ship-to { width: 60%; }
    .ship-to h2 { margin: 0 0 5px 0; font-size: 16px; font-weight: bold; }
    .ship-to p { margin: 2px 0; font-size: 14px; line-height: 1.4; }
    .brand-logo { width: 35%; text-align: right; font-size: 32px; font-weight: bold; font-family: serif; }
    
    .middle-row { display: flex; border-bottom: 2px solid #000; }
    .middle-left { width: 50%; padding: 15px; border-right: 2px solid #000; }
    .middle-left table { width: 100%; font-size: 14px; }
    .middle-left td { padding: 4px 0; }
    .middle-right { width: 50%; padding: 15px; text-align: center; }
    .middle-right h3 { margin: 0 0 10px 0; font-size: 16px; font-weight: normal; }
    
    .shipped-by-row { display: flex; border-bottom: 2px solid #000; }
    .shipped-left { width: 45%; padding: 15px; font-size: 14px; border-right: 2px solid #000; }
    .shipped-left h3 { margin: 0 0 5px 0; font-size: 14px; font-weight: bold; }
    .shipped-left p { margin: 2px 0; }
    .shipped-right { width: 55%; padding: 15px; text-align: center; }
    .shipped-right h3 { margin: 0 0 10px 0; font-size: 16px; font-weight: normal; }
    .invoice-details { display: flex; justify-content: space-between; font-size: 12px; margin-top: 10px; text-align: left; padding: 0 20px; }
    
    .items-table-container { padding: 0; border-bottom: 2px solid #000; }
    .items-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .items-table th { border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 8px; text-align: center; font-weight: bold; }
    .items-table td { border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 8px; }
    .items-table th:last-child, .items-table td:last-child { border-right: none; }
    .items-table tr:last-child td { border-bottom: none; }
    
    .footer { padding: 15px; font-size: 14px; border-bottom: 2px solid #000; }
    .disclaimer { font-size: 12px; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
    .barcode-svg { max-width: 100%; height: 60px; }
    
    @media print { button { display: none; } body { padding: 0; } }
  </style>
  </head><body>
  
  <div style="margin-bottom: 15px;">
    <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer; background: #1b1c1c; color: white; border: none; font-weight: bold;">Print Label</button>
  </div>

  <div class="label-container">
    <div class="header-row">
      <div class="ship-to">
        <h2>Ship To</h2>
        <p style="font-weight: bold; text-transform: uppercase;">${order.customer_name}</p>
        <p>${order.shipping_address}</p>
        <p>${order.city}, ${order.state}</p>
        <p>${order.pincode}</p>
        <p>Phone No.: ${order.customer_phone}</p>
      </div>
      <div class="brand-logo">
        RANGOVA
      </div>
    </div>

    <div class="middle-row">
      <div class="middle-left">
        <table>
          <tr><td>Dimensions:</td><td>Standard</td></tr>
          <tr><td>Payment:</td><td><strong>PREPAID</strong></td></tr>
          <tr><td>ORDER TOTAL:</td><td>${Number(order.total).toFixed(2)} INR</td></tr>
          <tr><td>Weight:</td><td>Standard</td></tr>
          <tr><td>eWaybill No.:</td><td>N/A</td></tr>
        </table>
      </div>
      <div class="middle-right">
        <h3>Standard Delivery</h3>
        <svg id="barcode1" class="barcode-svg"></svg>
        <p style="font-size: 12px; margin-top: 5px;">Routing Code: STD/RNG</p>
      </div>
    </div>

    <div class="shipped-by-row">
      <div class="shipped-left">
        <h3>Shipped By (If undelivered, return to)</h3>
        <p style="font-style: italic;">Rangova</p>
        <p style="white-space: pre-line;">${storeAddress}</p>
      </div>
      <div class="shipped-right">
        <h3>Order #: ${orderNum}</h3>
        <svg id="barcode2" class="barcode-svg"></svg>
        <div class="invoice-details">
          <div>Invoice No.: -</div>
          <div>Invoice Date: ${new Date(order.created_at).toISOString().split('T')[0]}</div>
        </div>
      </div>
    </div>

    <div class="items-table-container">
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 40%;">Product Name & SKU</th>
            <th>HSN</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Taxable Value</th>
            <th>IGST</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <div class="footer">
      All disputes are subject to jurisdiction. Goods once sold will only be taken back or exchanged as per the store's exchange/return policy.
    </div>

    <div class="disclaimer">
      <div style="text-transform: uppercase;">THIS IS AN AUTO-GENERATED LABEL AND DOES NOT NEED SIGNATURE.</div>
      <div style="text-align: right; font-size: 10px;">
        Powered By:<br/><strong>RANGOVA</strong>
      </div>
    </div>
  </div>

  <script>
    // Primary routing barcode
    JsBarcode("#barcode1", "${orderNum.replace(/-/g, '')}", { format: "CODE128", width: 2, height: 50, displayValue: true, fontSize: 14, margin: 0 });
    // Order number barcode
    JsBarcode("#barcode2", "${orderNum}", { format: "CODE128", width: 2, height: 50, displayValue: false, margin: 0 });
  </script>
  </body></html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(slip);
});

module.exports = router;
