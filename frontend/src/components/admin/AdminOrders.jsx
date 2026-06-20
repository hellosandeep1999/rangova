import React, { useState, useMemo, useRef, useCallback } from 'react';
import { updateOrderStatus } from '../../lib/api';
import { getSetting } from '../../lib/api';

const STATUS_COLORS = {
  Pending:    { bg: '#FEF9C3', text: '#854D0E' },
  Processing: { bg: '#DBEAFE', text: '#1E40AF' },
  Shipped:    { bg: '#E0F2FE', text: '#0369A1' },
  Delivered:  { bg: '#DCFCE7', text: '#166534' },
  Cancelled:  { bg: '#FEE2E2', text: '#991B1B' },
};

const ALL_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#F3F4F6', text: '#374151' };
  return (
    <span style={{ backgroundColor: s.bg, color: s.text }}
      className="px-2 py-0.5 rounded-full text-[10px] font-label-caps uppercase tracking-widest font-bold">
      {status}
    </span>
  );
}

async function getStoreAddress() {
  try {
    const addr = await getSetting('company_address');
    return addr || 'Rangova, Jaipur, Rajasthan – 302020';
  } catch {
    return 'Rangova, Jaipur, Rajasthan – 302020';
  }
}

function printOrderSlips(orders, storeAddress) {
  const slips = orders.map(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    const itemRows = items.map((i, idx) => `
      <tr>
        <td style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;font-size:11px;">
          ${i.title || '-'}<br/>Size/Color: ${i.size || '-'}/${i.color || '-'}
        </td>
        <td style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:center;font-size:11px;">-</td>
        <td style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:center;font-size:11px;">${i.quantity || 1}</td>
        <td style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:right;font-size:11px;">${parseFloat(i.price || 0).toFixed(2)}</td>
        <td style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:right;font-size:11px;">${parseFloat(i.price || 0).toFixed(2)}</td>
        <td style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:right;font-size:11px;">0.00</td>
        <td style="padding:6px;border-bottom:1px solid #000;text-align:right;font-size:11px;">${parseFloat((i.price || 0) * (i.quantity || 1)).toFixed(2)}</td>
      </tr>`).join('');

    const orderNum = order.id;
    const barcodeId1 = `bc1_${order.id.replace(/-/g, '')}`;
    const barcodeId2 = `bc2_${order.id.replace(/-/g, '')}`;

    return `
    <div class="slip">
      <table style="width:100%;border-collapse:collapse;border:2px solid #000;font-family:Arial, sans-serif;">
        <!-- Top Section -->
        <tr>
          <td style="width:50%;padding:10px;vertical-align:top;border-right:2px solid #000;border-bottom:2px solid #000;">
            <p style="margin:0 0 5px;font-size:14px;font-weight:bold;">Ship To</p>
            <p style="margin:0 0 2px;font-size:13px;font-weight:bold;font-style:italic;">${order.customer_name?.toUpperCase() || 'CUSTOMER'}</p>
            <p style="margin:0 0 2px;font-size:12px;">${order.shipping_address || '-'}</p>
            <p style="margin:0 0 2px;font-size:12px;">${order.city || ''}${order.state ? ', ' + order.state : ''}</p>
            <p style="margin:0 0 5px;font-size:12px;font-style:italic;">${order.pincode || ''}</p>
            <p style="margin:0;font-size:12px;">Phone No.: ${order.customer_phone || order.customer_email || '-'}</p>
          </td>
          <td style="width:50%;padding:10px;vertical-align:middle;text-align:center;border-bottom:2px solid #000;">
            <h1 style="margin:0;font-size:36px;font-family:'Playfair Display',serif;letter-spacing:0.05em;">RANGOVA</h1>
          </td>
        </tr>
        
        <!-- Second Section -->
        <tr>
          <td style="padding:10px;vertical-align:top;border-right:2px solid #000;border-bottom:2px solid #000;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <tr><td style="padding-bottom:4px;width:40%;">Dimensions:</td><td style="padding-bottom:4px;">15.00x5.00x1.00</td></tr>
              <tr><td style="padding-bottom:4px;">Payment:</td><td style="padding-bottom:4px;font-weight:bold;">PREPAID</td></tr>
              <tr><td style="padding-bottom:4px;">ORDER TOTAL:</td><td style="padding-bottom:4px;">${parseFloat(order.total || 0).toFixed(2)} INR</td></tr>
              <tr><td style="padding-bottom:4px;">Weight:</td><td style="padding-bottom:4px;">0.50 KG</td></tr>
              <tr><td>eWaybill No.:</td><td>N/A</td></tr>
            </table>
          </td>
          <td style="padding:10px;vertical-align:middle;text-align:center;border-bottom:2px solid #000;">
            <p style="margin:0 0 5px;font-size:14px;">Standard Delivery</p>
            <svg id="${barcodeId1}" style="width:100%;height:60px;"></svg>
            <p style="margin:5px 0 0;font-size:12px;">Routing Code: STD/RGV</p>
          </td>
        </tr>

        <!-- Third Section -->
        <tr>
          <td style="padding:10px;vertical-align:top;border-right:2px solid #000;border-bottom:2px solid #000;">
            <p style="margin:0 0 5px;font-size:14px;font-weight:bold;">Shipped By<span style="font-size:11px;font-weight:normal;">(If undelivered, return to)</span></p>
            <p style="margin:0 0 2px;font-size:13px;font-style:italic;">Rangova</p>
            <p style="margin:0 0 5px;font-size:12px;font-style:italic;">${storeAddress}</p>
            <p style="margin:0 0 2px;font-size:12px;font-style:italic;">GSTIN: -</p>
            <p style="margin:0 0 2px;font-size:12px;font-style:italic;">Phone No.: -</p>
          </td>
          <td style="padding:10px;vertical-align:middle;text-align:center;border-bottom:2px solid #000;">
            <p style="margin:0 0 5px;font-size:14px;">Order #: ${orderNum}</p>
            <svg id="${barcodeId2}" style="width:100%;height:60px;"></svg>
            <p style="margin:5px 0 0;font-size:12px;text-align:left;">Invoice No.: ${orderNum}</p>
            <p style="margin:2px 0 0;font-size:12px;text-align:left;">Invoice Date: ${new Date(order.created_at).toLocaleDateString('en-CA')}</p>
          </td>
        </tr>

        <!-- Products Table -->
        <tr>
          <td colspan="2" style="padding:0;border-bottom:2px solid #000;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr>
                  <th style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:left;">Product Name & SKU</th>
                  <th style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:center;">HSN</th>
                  <th style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:center;">Qty</th>
                  <th style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:right;">Unit<br/>Price</th>
                  <th style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:right;">Taxable<br/>Value</th>
                  <th style="padding:6px;border-right:1px solid #000;border-bottom:1px solid #000;text-align:right;">IGST</th>
                  <th style="padding:6px;border-bottom:1px solid #000;text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td colspan="2" style="padding:10px;border-bottom:2px solid #000;">
            <p style="margin:0;font-size:13px;">All disputes are subject to Jaipur jurisdiction only. Goods once sold will only be taken back or exchanged as per the store's exchange/return policy.</p>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:10px;display:flex;justify-content:space-between;align-items:flex-end;">
            <p style="margin:0;font-size:10px;">THIS IS AN AUTO-GENERATED LABEL AND DOES NOT NEED SIGNATURE.</p>
            <div style="text-align:right;">
              <p style="margin:0;font-size:10px;">Powered By:</p>
              <p style="margin:2px 0 0;font-size:14px;font-weight:bold;">Rangova</p>
            </div>
          </td>
        </tr>
      </table>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html><head><title>Rangova — Order Slips</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
<style>
  body { margin: 0; padding: 0; background: #fff; font-family: Arial, sans-serif; }
  .slip { max-width: 700px; margin: 40px auto; }
  @media print {
    .slip { margin: 0; padding: 10px; page-break-after: always; }
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
<script>
  document.addEventListener('DOMContentLoaded', function() {
    ${orders.map(o => {
      const val = o.id; 
      const id1 = `bc1_${o.id.replace(/-/g, '')}`;
      const id2 = `bc2_${o.id.replace(/-/g, '')}`;
      return `try { 
        JsBarcode("#${id1}", "${val}", { format: "CODE128", width: 1.5, height: 40, displayValue: true, fontSize: 14, margin: 0 }); 
        JsBarcode("#${id2}", "${val}", { format: "CODE128", width: 1.5, height: 40, displayValue: false, margin: 0 }); 
      } catch(e) { console.warn('Barcode error', e); }`;
    }).join('\n    ')}
  });
</script>
</body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
}

export default function AdminOrders({ orders, setOrders, triggerNotification, onRefresh, loading }) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilters, setStatusFilters] = useState([]); // multi-select
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [storeAddress, setStoreAddress] = useState('Rangova, Jaipur, Rajasthan – 302020');
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const scanRef = useRef(null);

  // Fetch store address once
  React.useEffect(() => {
    getStoreAddress().then(addr => setStoreAddress(addr));
  }, []);

  const toggleStatusFilter = (status) => {
    setStatusFilters(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const filtered = useMemo(() => {
    let result = orders;

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_email || '').toLowerCase().includes(q) ||
        (o.customer_phone || '').toLowerCase().includes(q) ||
        (o.id || '').toLowerCase().includes(q) ||
        (o.status || '').toLowerCase().includes(q) ||
        (o.shipping_address || '').toLowerCase().includes(q) ||
        (o.pincode || '').toLowerCase().includes(q)
      );
    }

    // Status multi-filter
    if (statusFilters.length > 0) {
      result = result.filter(o => statusFilters.includes(o.status));
    }

    // Date range
    if (startDate) {
      result = result.filter(o => new Date(o.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(o => new Date(o.created_at) <= end);
    }

    return result;
  }, [orders, search, statusFilters, startDate, endDate]);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [search, statusFilters, startDate, endDate]);

  const displayedOrders = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const loadMoreRef = useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filtered.length) {
        setVisibleCount(prev => prev + 20);
      }
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);

  const allSelected = displayedOrders.length > 0 && displayedOrders.every(o => selectedIds.has(o.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => { const n = new Set(prev); displayedOrders.forEach(o => n.delete(o.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); displayedOrders.forEach(o => n.add(o.id)); return n; });
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
      if (scanResult?.id === id) setScanResult(prev => ({ ...prev, status }));
      triggerNotification('Order status updated');
    } catch (err) {
      triggerNotification('Error updating order status');
    }
  };

  const selectedOrders = orders.filter(o => selectedIds.has(o.id));

  // Barcode scan logic
  const handleScanLookup = async () => {
    const val = scanInput.trim();
    if (!val) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;
      const token = sessionStorage.getItem('rangova_admin_token');
      // We are scanning the UUID now
      const res = await fetch(`${BASE}/orders/by-id/${encodeURIComponent(val)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        triggerNotification('Order not found for that barcode/ID');
        setScanLoading(false);
        return;
      }
      const order = await res.json();
      setScanResult(order);
    } catch (err) {
      triggerNotification('Error looking up order');
    } finally {
      setScanLoading(false);
    }
  };

  const getNextStatus = (current) => {
    const progression = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const idx = progression.indexOf(current);
    return idx >= 0 && idx < progression.length - 1 ? progression[idx + 1] : null;
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setStartDate('');
    setEndDate('');
    setSearch('');
  };

  const hasFilters = statusFilters.length > 0 || startDate || endDate || search;

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {/* Main Orders Panel */}
      <div className={`flex flex-col transition-all duration-300 ${selectedOrder ? 'flex-1 min-w-0' : 'w-full'}`}>
        {/* Header */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <h2 className="font-headline-sm text-2xl font-bold text-primary">Orders</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {selectedIds.size > 0 && (
              <button
                onClick={() => printOrderSlips(selectedOrders, storeAddress)}
                style={{ backgroundColor: '#1b1c1c', color: '#fff' }}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-label-caps uppercase tracking-widest border-none cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print Slips ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => { setShowScanModal(true); setTimeout(() => scanRef.current?.focus(), 100); }}
              style={{ backgroundColor: '#5B6AF0', color: '#fff' }}
              className="flex items-center gap-2 px-4 py-2 text-[10px] font-label-caps uppercase tracking-widest border-none cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">qr_code_scanner</span>
              Scan Barcode
            </button>
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
        <div className="relative mb-3">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base">search</span>
          <input
            type="text"
            placeholder="Search by name, email, phone, order ID, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant/40 bg-white text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 mb-4 items-center p-3 bg-white border border-outline-variant/20 rounded-sm">
          {/* Status multi-select chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-caps text-[9px] text-secondary uppercase tracking-widest">Status:</span>
            {ALL_STATUSES.map(s => {
              const colors = STATUS_COLORS[s] || {};
              const active = statusFilters.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleStatusFilter(s)}
                  style={active ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.text } : {}}
                  className={`px-3 py-1 text-[10px] font-label-caps uppercase tracking-widest border rounded-full transition-all cursor-pointer ${
                    active ? 'border-current font-bold' : 'border-outline-variant/40 text-secondary hover:border-primary hover:text-primary bg-transparent'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-label-caps text-[9px] text-secondary uppercase tracking-widest">Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border border-outline-variant/40 text-xs px-2 py-1 outline-none focus:border-primary bg-white"
              title="Start date"
            />
            <span className="text-secondary text-xs">–</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border border-outline-variant/40 text-xs px-2 py-1 outline-none focus:border-primary bg-white"
              title="End date"
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] text-muted-terracotta hover:text-red-700 font-label-caps uppercase tracking-widest bg-transparent border-none cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-auto flex-1">
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
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {displayedOrders.map(order => (
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
                      <span className="font-mono text-xs">
                        {order.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary whitespace-nowrap text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold whitespace-nowrap">{order.customer_name || '-'}</div>
                      <div className="text-xs text-secondary">{order.customer_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      {order.customer_phone ? (
                        <a
                          href={`tel:${order.customer_phone}`}
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-muted-terracotta transition-colors whitespace-nowrap"
                          title="Call customer"
                        >
                          <span className="material-symbols-outlined text-sm">call</span>
                          {order.customer_phone}
                        </a>
                      ) : (
                        <span className="text-xs text-secondary">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-secondary text-xs max-w-[140px]">
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
                    <td colSpan="9" className="py-12 text-center text-secondary">
                      {hasFilters ? 'No orders match your filters.' : 'No orders found.'}
                    </td>
                  </tr>
                )}
                {visibleCount < filtered.length && (
                  <tr ref={loadMoreRef}>
                    <td colSpan="9" className="py-4 text-center text-secondary">
                      Loading more...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-xs text-secondary">Showing {displayedOrders.length} of {filtered.length} order{filtered.length !== 1 ? 's' : ''} • Click a row to view details</p>
      </div>

      {/* Right Detail Panel */}
      {selectedOrder && (
        <div className="w-96 flex-shrink-0 bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Panel Header */}
          <div className="flex justify-between items-center p-4 border-b border-outline-variant/20 sticky top-0 bg-white z-10">
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary">Order Details</p>
              <p className="font-bold text-primary font-mono text-sm">
                {selectedOrder.id}
              </p>
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
              {selectedOrder.customer_phone && (
                <a href={`tel:${selectedOrder.customer_phone}`} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-muted-terracotta mt-1 transition-colors">
                  <span className="material-symbols-outlined text-sm">call</span>
                  {selectedOrder.customer_phone}
                </a>
              )}
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
              {parseFloat(selectedOrder.shipping_charge) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">Shipping</span>
                  <span>₹{selectedOrder.shipping_charge}</span>
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
              onClick={() => printOrderSlips([selectedOrder], storeAddress)}
              className="w-full py-2.5 border border-outline-variant/30 font-label-caps text-[10px] uppercase tracking-widest hover:bg-surface-variant/30 transition-colors cursor-pointer bg-transparent flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Print This Slip
            </button>
          </div>
        </div>
      )}

      {/* Barcode Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-outline-variant/30 w-full max-w-md p-6 relative">
            <button
              onClick={() => { setShowScanModal(false); setScanInput(''); setScanResult(null); }}
              className="absolute top-4 right-4 text-secondary hover:text-primary bg-transparent border-none cursor-pointer p-0"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-3xl text-primary">qr_code_scanner</span>
              <div>
                <h3 className="font-headline-sm text-lg font-bold text-primary">Scan Order Barcode</h3>
                <p className="text-xs text-secondary">Scan or type the order number to look up and update status</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                ref={scanRef}
                type="text"
                placeholder="Scan barcode here..."
                value={scanInput}
                onChange={e => setScanInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScanLookup()}
                className="flex-1 border border-outline-variant/40 p-2.5 text-sm font-mono outline-none focus:border-primary"
                autoFocus
              />
              <button
                onClick={handleScanLookup}
                disabled={scanLoading || !scanInput.trim()}
                style={{ backgroundColor: '#1b1c1c', color: '#fff' }}
                className="px-4 py-2 font-label-caps text-[10px] uppercase tracking-widest border-none cursor-pointer hover:opacity-80 disabled:opacity-50"
              >
                {scanLoading ? 'Looking...' : 'Find'}
              </button>
            </div>

            {scanResult && (
              <div className="bg-surface-container-low p-4 rounded-sm border border-outline-variant/20">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-sm font-mono">{scanResult.id}</p>
                    <p className="text-xs text-secondary">{scanResult.customer_name} • {scanResult.customer_phone}</p>
                  </div>
                  <StatusBadge status={scanResult.status} />
                </div>

                {getNextStatus(scanResult.status) ? (
                  <div className="space-y-2">
                    <p className="text-xs text-secondary">
                      Move status from <span className="font-bold">{scanResult.status}</span> to <span className="font-bold text-primary">{getNextStatus(scanResult.status)}</span>?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          const next = getNextStatus(scanResult.status);
                          if (next) {
                            await handleUpdateOrderStatus(scanResult.id, next);
                            setScanResult(prev => ({ ...prev, status: next }));
                            triggerNotification(`Order moved to ${next}`);
                          }
                        }}
                        style={{ backgroundColor: '#166534', color: '#fff' }}
                        className="flex-1 py-2 font-label-caps text-[10px] uppercase tracking-widest border-none cursor-pointer hover:opacity-80"
                      >
                        ✓ Confirm — Move to {getNextStatus(scanResult.status)}
                      </button>
                      <button
                        onClick={() => setScanResult(null)}
                        className="px-4 py-2 font-label-caps text-[10px] uppercase tracking-widest border border-outline-variant/30 text-secondary bg-transparent cursor-pointer hover:text-primary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-secondary italic">Order is already at final status: <strong>{scanResult.status}</strong>.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
