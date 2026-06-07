import React, { useState, useMemo } from 'react';

export default function AdminCustomers({ customers, onRefresh, loading }) {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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

  return (
    <div className="flex gap-4 h-full">
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
        <div className="bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-variant/30 border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                <tr>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {filtered.map(customer => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(selectedCustomer?.id === customer.id ? null : customer)}
                    className={`cursor-pointer transition-colors ${selectedCustomer?.id === customer.id ? 'bg-surface-variant/40' : 'hover:bg-surface-container-low'}`}
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
                    <td className="py-3 px-4 text-secondary text-xs">
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-secondary">
                      {search ? 'No customers match your search.' : 'No customers found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-xs text-secondary">{filtered.length} customer{filtered.length !== 1 ? 's' : ''} • Click a row to view details</p>
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
                <p className="text-sm">{selectedCustomer.phone || '-'}</p>
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
