import React, { useState, useMemo } from 'react';
import { updateCustomerStatus } from '../../lib/api';

export default function AdminCustomers({ customers, setCustomers, onRefresh, loading, triggerNotification }) {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.id || '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [search]);

  const displayedCustomers = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const loadMoreRef = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filtered.length) {
        setVisibleCount(prev => prev + 20);
      }
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filtered.length]);

  const handleToggleStatus = async () => {
    if (!selectedCustomer) return;
    const newStatus = selectedCustomer.status === 'blocked' ? 'active' : 'blocked';
    setUpdatingStatus(true);
    try {
      await updateCustomerStatus(selectedCustomer.id, newStatus);
      const updated = { ...selectedCustomer, status: newStatus };
      setSelectedCustomer(updated);
      if (setCustomers) {
        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updated : c));
      }
      triggerNotification(`Customer ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
      onRefresh();
    } catch (err) {
      triggerNotification(`Error updating customer status: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {/* Main List */}
      <div className={`flex flex-col transition-all duration-300 ${selectedCustomer ? 'flex-1 min-w-0' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-sm text-2xl font-bold text-primary">Customers</h2>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-outline-variant/30 text-[10px] font-label-caps uppercase tracking-widest text-primary hover:bg-surface-variant/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refresh
            </button>
          </div>
          <span className="text-xs text-secondary">{customers.length} total</span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base">search</span>
          <input
            type="text"
            placeholder="Search by name, email, phone or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant/40 bg-white text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-surface-variant/30 border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                <tr>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {displayedCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(selectedCustomer?.id === customer.id ? null : customer)}
                    className={`cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'bg-surface-variant/40' : 'hover:bg-surface-container-low'} ${customer.status === 'blocked' ? 'opacity-60' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-secondary bg-surface-variant/40 px-1.5 py-0.5 rounded">
                        #{customer.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">{customer.name || '-'}</td>
                    <td className="py-3 px-4 text-secondary">{customer.email || '-'}</td>
                    <td className="py-3 px-4 text-secondary">{customer.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold">{customer.total_orders || 0}</span>
                    </td>
                    <td className="py-3 px-4 font-bold">₹{parseFloat(customer.total_spent || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-label-caps uppercase tracking-widest font-bold ${
                        customer.status === 'blocked'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {customer.status === 'blocked' ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary text-xs">
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-secondary">
                      {search ? 'No customers match your search.' : 'No customers found.'}
                    </td>
                  </tr>
                )}
                {visibleCount < filtered.length && (
                  <tr ref={loadMoreRef}>
                    <td colSpan="8" className="py-4 text-center text-secondary">
                      Loading more...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-xs text-secondary">Showing {displayedCustomers.length} of {filtered.length} customer{filtered.length !== 1 ? 's' : ''} • Click a row to view details</p>
      </div>

      {/* Right Detail Panel */}
      {selectedCustomer && (
        <div className="w-80 flex-shrink-0 bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Panel Header */}
          <div className="flex justify-between items-center p-4 border-b border-outline-variant/20 sticky top-0 bg-white z-10">
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary">Customer Details</p>
              <p className="font-bold text-primary">{selectedCustomer.name}</p>
            </div>
            <button onClick={() => setSelectedCustomer(null)} className="bg-transparent border-none cursor-pointer text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Status Badge + Toggle */}
            <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-sm">
              <div>
                <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Account Status</p>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-label-caps uppercase tracking-widest font-bold ${
                  selectedCustomer.status === 'blocked'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {selectedCustomer.status === 'blocked' ? '🚫 Blocked' : '✓ Active'}
                </span>
              </div>
              <button
                onClick={handleToggleStatus}
                disabled={updatingStatus}
                style={selectedCustomer.status === 'blocked'
                  ? { backgroundColor: '#166534', color: '#fff' }
                  : { backgroundColor: '#991B1B', color: '#fff' }
                }
                className="px-3 py-1.5 font-label-caps text-[9px] uppercase tracking-widest border-none cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 rounded"
              >
                {updatingStatus ? '...' : selectedCustomer.status === 'blocked' ? 'Unblock' : 'Block'}
              </button>
            </div>

            {selectedCustomer.status === 'blocked' && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-sm text-xs text-red-700">
                ⚠️ This customer cannot place new orders while blocked. They can still login and browse the portal.
              </div>
            )}

            {/* ID */}
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Customer ID</p>
              <p className="font-mono text-xs bg-surface-variant/40 p-2 rounded break-all">{selectedCustomer.id}</p>
            </div>

            {/* Contact */}
            <div className="bg-surface-container-low p-3 rounded-sm space-y-2">
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary">Contact Info</p>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-widest">Name</p>
                <p className="text-sm font-bold">{selectedCustomer.name || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-widest">Email</p>
                <p className="text-sm">{selectedCustomer.email || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-secondary uppercase tracking-widest">Phone</p>
                {selectedCustomer.phone ? (
                  <a href={`tel:${selectedCustomer.phone}`} className="text-sm font-bold text-primary hover:text-muted-terracotta flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">call</span>
                    {selectedCustomer.phone}
                  </a>
                ) : (
                  <p className="text-sm">-</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-3 rounded-sm text-center">
                <p className="text-2xl font-bold text-primary">{selectedCustomer.total_orders || 0}</p>
                <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mt-1">Total Orders</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-sm text-center">
                <p className="text-xl font-bold text-primary">₹{parseFloat(selectedCustomer.total_spent || 0).toLocaleString('en-IN')}</p>
                <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mt-1">Total Spent</p>
              </div>
            </div>

            {/* Joined */}
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Joined On</p>
              <p className="text-sm">
                {selectedCustomer.created_at
                  ? new Date(selectedCustomer.created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
