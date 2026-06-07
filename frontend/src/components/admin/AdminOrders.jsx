import React, { useState, useMemo } from 'react';
import { updateOrderStatus } from '../../lib/api';

const STATUS_COLORS = {
  Pending:    { bg: '#FEF9C3', text: '#854D0E' },
  Processing: { bg: '#DBEAFE', text: '#1E40AF' },
  Shipped:    { bg: '#E0F2FE', text: '#0369A1' },
  Delivered:  { bg: '#DCFCE7', text: '#166534' },
  Cancelled:  { bg: '#FEE2E2', text: '#991B1B' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span style={{ backgroundColor: s.bg, color: s.text }}
      className="px-2 py-0.5 rounded-full text-[10px] font-label-caps uppercase tracking-widest font-bold">
      {status}
    </span>
  );
}

function printOrderSlips(orders) {
  const slips = orders.map(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    const itemRows = items.map(i => `
      <tr>
        <td style="padding:6px 8px;border:1px solid #ddd;">${i.title || '-'}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;">${i.size || '-'}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;">${i.color || '-'}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center;">${i.quantity || 1}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;">₹${i.price || 0}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right;">₹${(i.price || 0) * (i.quantity || 1)}</td>
      </tr>`).join('');

    return `
    <div class="slip">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
        <div>
          <h1 style="margin:0;font-size:22px;font-family:'Playfair Display',serif;letter-spacing:0.05em;">RANGOVA</h1>
          <p style="margin:2px 0 0;font-size:11px;color:#666;font-family:Arial;">Heritage · Editorial · Modern</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:11px;font-weight:700;font-family:Arial;">ORDER SLIP</p>
          <p style="margin:2px 0 0;font-size:12px;color:#555;font-family:Arial;">#${order.id.slice(0,8).toUpperCase()}</p>
          <p style="margin:2px 0 0;font-size:11px;color:#666;font-family:Arial;">${new Date(order.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
        </div>
      </div>
      <hr style="border:none;border-top:2px solid #1b1c1c;margin-bottom:14px;" />
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
        <div>
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.1em;color:#888;font-family:Arial;text-transform:uppercase;">Customer</p>
          <p style="margin:0;font-size:13px;font-weight:700;font-family:Arial;">${order.customer_name || '-'}</p>
          <p style="margin:2px 0;font-size:11px;color:#555;font-family:Arial;">${order.customer_email || ''}</p>
          <p style="margin:2px 0;font-size:11px;color:#555;font-family:Arial;">${order.customer_phone || ''}</p>
        </div>
        <div>
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.1em;color:#888;font-family:Arial;text-transform:uppercase;">Ship To</p>
          <p style="margin:0;font-size:12px;font-family:Arial;">${order.shipping_address || '-'}</p>
          ${order.city ? `<p style="margin:2px 0;font-size:12px;font-family:Arial;">${order.city}${order.state ? ', ' + order.state : ''}</p>` : ''}
          ${order.pincode ? `<p style="margin:2px 0;font-size:12px;font-weight:700;font-family:Arial;">PIN: ${order.pincode}</p>` : ''}
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-family:Arial;font-size:12px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Product</th>
            <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Size</th>
            <th style="padding:6px 8px;border:1px solid #ddd;text-align:left;">Color</th>
            <th style="padding:6px 8px;border:1px solid #ddd;text-align:center;">Qty</th>
            <th style="padding:6px 8px;border:1px solid #ddd;text-align:right;">Price</th>
            <th style="padding:6px 8px;border:1px solid #ddd;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="text-align:right;font-family:Arial;">
        <p style="margin:2px 0;font-size:12px;color:#555;">Subtotal: ₹${order.subtotal || 0}</p>
        ${parseFloat(order.discount_amount) > 0 ? `<p style="margin:2px 0;font-size:12px;color:#9B3018;">Discount: -₹${order.discount_amount}</p>` : ''}
        <p style="margin:4px 0 0;font-size:16px;font-weight:700;">Total: ₹${order.total}</p>
      </div>
      <div style="margin-top:12px;padding:8px;background:#f9f9f9;border:1px solid #eee;font-family:Arial;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.1em;color:#888;text-transform:uppercase;">Status</p>
        <p style="margin:2px 0 0;font-size:13px;font-weight:700;">${order.status}</p>
        ${order.notes ? `<p style="margin:4px 0 0;font-size:11px;color:#555;">Notes: ${order.notes}</p>` : ''}
      </div>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html><head><title>Rangova — Order Slips</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; background: #fff; font-family: Arial, sans-serif; }
  .slip { max-width: 680px; margin: 40px auto; padding: 32px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  @media print {
    .slip { box-shadow: none; border: 1px solid #ccc; margin: 0; page-break-after: always; }
    .slip:last-child { page-break-after: avoid; }
    .no-print { display: none !important; }
  }
</style>
</head><body>
<div class="no-print" style="text-align:center;padding:16px;background:#1b1c1c;color:#fff;position:sticky;top:0;z-index:99;">
  <button onclick="window.print()" style="background:#fff;color:#1b1c1c;border:none;padding:10px 28px;font-weight:700;font-size:13px;cursor:pointer;letter-spacing:0.05em;">🖨️ PRINT ALL SLIPS</button>
  <span style="margin-left:16px;font-size:12px;opacity:0.7;">${orders.length} slip(s) ready</span>
</div>
${slips}
</body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

export default function AdminOrders({ orders, setOrders, triggerNotification, onRefresh, loading }) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(o =>
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.customer_email || '').toLowerCase().includes(q) ||
      (o.customer_phone || '').toLowerCase().includes(q) ||
      (o.id || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q) ||
      (o.shipping_address || '').toLowerCase().includes(q) ||
      (o.pincode || '').toLowerCase().includes(q)
    );
  }, [orders, search]);

  const allSelected = filtered.length > 0 && filtered.every(o => selectedIds.has(o.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(o => n.delete(o.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(o => n.add(o.id)); return n; });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, status }));
      triggerNotification('Order status updated');
    } catch (err) {
      triggerNotification('Error updating order status');
    }
  };

  const selectedOrders = orders.filter(o => selectedIds.has(o.id));

  return (
    <div className="flex gap-4 h-full">
      {/* Main Orders Panel */}
      <div className={`flex flex-col transition-all duration-300 ${selectedOrder ? 'flex-1 min-w-0' : 'w-full'}`}>
        {/* Header */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <h2 className="font-headline-sm text-2xl font-bold text-primary">Orders</h2>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={() => printOrderSlips(selectedOrders)}
                style={{ backgroundColor: '#1b1c1c', color: '#fff' }}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-label-caps uppercase tracking-widest border-none cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print Slips ({selectedIds.size})
              </button>
            )}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-outline-variant/30 text-[10px] font-label-caps uppercase tracking-widest text-primary hover:bg-surface-variant/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base">search</span>
          <input
            type="text"
            placeholder="Search by name, email, phone, order ID, status, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant/40 bg-white text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-variant/30 border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                <tr>
                  <th className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {filtered.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className={`cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-surface-variant/40' : 'hover:bg-surface-container-low'}`}
                  >
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-primary whitespace-nowrap">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 text-secondary whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold whitespace-nowrap">{order.customer_name || '-'}</div>
                      <div className="text-xs text-secondary">{order.customer_email}</div>
                      <div className="text-xs text-secondary">{order.customer_phone}</div>
                    </td>
                    <td className="py-3 px-4 text-secondary text-xs max-w-[160px]">
                      <div className="truncate">{order.shipping_address || '-'}</div>
                      <div>{[order.city, order.state].filter(Boolean).join(', ')}</div>
                      {order.pincode && <div className="font-bold text-primary">PIN: {order.pincode}</div>}
                    </td>
                    <td className="py-3 px-4 text-secondary">
                      {Array.isArray(order.items) ? (
                        <span className="text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap">₹{order.total}</td>
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                        style={{ fontSize: '10px' }}
                        className="bg-transparent border border-outline-variant/30 rounded px-2 py-1 font-label-caps uppercase text-primary outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-secondary">
                      {search ? 'No orders match your search.' : 'No orders found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-xs text-secondary">{filtered.length} order{filtered.length !== 1 ? 's' : ''} • Click a row to view details</p>
      </div>

      {/* Right Detail Panel */}
      {selectedOrder && (
        <div className="w-96 flex-shrink-0 bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Panel Header */}
          <div className="flex justify-between items-center p-4 border-b border-outline-variant/20 sticky top-0 bg-white z-10">
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary">Order Details</p>
              <p className="font-bold text-primary">#{selectedOrder.id.slice(0,8).toUpperCase()}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="bg-transparent border-none cursor-pointer text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Status */}
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1.5">Status</p>
              <StatusBadge status={selectedOrder.status} />
            </div>

            {/* Date */}
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Date</p>
              <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
            </div>

            {/* Customer */}
            <div className="bg-surface-container-low p-3 rounded-sm">
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-2">Customer</p>
              <p className="font-bold text-sm">{selectedOrder.customer_name || '-'}</p>
              <p className="text-xs text-secondary mt-0.5">{selectedOrder.customer_email || '-'}</p>
              <p className="text-xs text-secondary mt-0.5">{selectedOrder.customer_phone || '-'}</p>
            </div>

            {/* Shipping Address */}
            <div className="bg-surface-container-low p-3 rounded-sm">
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-2">Shipping Address</p>
              <p className="text-sm">{selectedOrder.shipping_address || '-'}</p>
              {(selectedOrder.city || selectedOrder.state) && (
                <p className="text-sm mt-0.5">{[selectedOrder.city, selectedOrder.state].filter(Boolean).join(', ')}</p>
              )}
              {selectedOrder.pincode && (
                <p className="text-sm font-bold mt-0.5">Pincode: {selectedOrder.pincode}</p>
              )}
            </div>

            {/* Items */}
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-2">Items Ordered</p>
              <div className="space-y-2">
                {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, i) => (
                  <div key={i} className="bg-surface-container-low p-3 rounded-sm">
                    <p className="font-bold text-sm">{item.title}</p>
                    <div className="flex gap-3 mt-1 text-xs text-secondary">
                      {item.size && <span>Size: <span className="font-bold text-primary">{item.size}</span></span>}
                      {item.color && <span>Color: <span className="font-bold text-primary">{item.color}</span></span>}
                      <span>Qty: <span className="font-bold text-primary">{item.quantity || 1}</span></span>
                    </div>
                    <p className="text-sm font-bold mt-1">₹{item.price} × {item.quantity || 1} = ₹{(item.price || 0) * (item.quantity || 1)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-outline-variant/20 pt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-secondary">Subtotal</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              {parseFloat(selectedOrder.discount_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#9B3018' }}>Discount</span>
                  <span style={{ color: '#9B3018' }}>-₹{selectedOrder.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total</span>
                <span>₹{selectedOrder.total}</span>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div>
                <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Notes</p>
                <p className="text-sm text-secondary">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Update Status */}
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-2">Update Status</p>
              <select
                value={selectedOrder.status}
                onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Print this slip */}
            <button
              onClick={() => printOrderSlips([selectedOrder])}
              className="w-full py-2.5 border border-outline-variant/30 font-label-caps text-[10px] uppercase tracking-widest hover:bg-surface-variant/30 transition-colors cursor-pointer bg-transparent flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print This Slip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
