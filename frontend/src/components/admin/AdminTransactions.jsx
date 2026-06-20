import React, { useState, useEffect, useMemo } from 'react';
import { getTransactions } from '../../lib/api';

export default function AdminTransactions({ orders = [], triggerNotification, onRefresh, loading }) {
  const [transactionsList, setTransactionsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  const fetchTransactionsData = async () => {
    try {
      setLocalLoading(true);
      const data = await getTransactions();
      setTransactionsList(Array.isArray(data) ? data : []);
    } catch (err) {
      triggerNotification(`Error loading transactions: ${err.message || err}`);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsData();
  }, []);

  const handleRefresh = async () => {
    await fetchTransactionsData();
    if (onRefresh) onRefresh();
    triggerNotification('Transactions refreshed');
  };

  // Find order helper
  const getOrderInfo = (orderId) => {
    return orders.find(o => String(o.id) === String(orderId));
  };

  const filteredTransactions = useMemo(() => {
    return transactionsList.filter(item => {
      const query = searchQuery.toLowerCase();
      const order = getOrderInfo(item.order_id);
      const customerName = order?.customer_name || '';
      
      return (
        String(item.id).toLowerCase().includes(query) ||
        String(item.order_id).toLowerCase().includes(query) ||
        (item.method && item.method.toLowerCase().includes(query)) ||
        (item.status && item.status.toLowerCase().includes(query)) ||
        customerName.toLowerCase().includes(query)
      );
    });
  }, [transactionsList, searchQuery, orders]);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, orders]);

  const displayedTransactions = useMemo(() => filteredTransactions.slice(0, visibleCount), [filteredTransactions, visibleCount]);

  const loadMoreRef = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filteredTransactions.length) {
        setVisibleCount(prev => prev + 20);
      }
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredTransactions.length]);

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 h-full overflow-hidden">
      {/* Left panel - Transactions List */}
      <div className="flex-grow flex flex-col min-w-0 bg-white border border-outline-variant/30 rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-outline-variant/20 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-sm text-xl font-bold text-primary">Transactions</h2>
            <button 
              onClick={handleRefresh}
              disabled={localLoading || loading}
              className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-colors cursor-pointer bg-transparent border-none"
              title="Refresh Transactions"
            >
              <span className={`material-symbols-outlined ${(localLoading || loading) ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-lg">search</span>
            <input
              type="text"
              placeholder="Search by txn, order, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-outline-variant/50 focus:border-primary outline-none w-full sm:w-64"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto">
          {localLoading && transactionsList.length === 0 ? (
            <div className="p-12 text-center text-secondary">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-secondary">No transactions found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-wider uppercase bg-surface-container-low">
                  <th className="py-3 px-6">Transaction ID</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Amount</th>
                  <th className="py-3 px-4 text-center">Method</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {displayedTransactions.map(item => {
                  const isSelected = selectedItem?.id === item.id;
                  const order = getOrderInfo(item.order_id);
                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedItem(item)}
                      className={`cursor-pointer hover:bg-surface-container-low transition-colors ${isSelected ? 'bg-surface-container font-medium' : ''}`}
                    >
                      <td className="py-4 px-6 font-mono text-xs text-primary">{item.id.slice(0, 8).toUpperCase()}...</td>
                      <td className="py-4 px-4 font-mono text-xs text-secondary">{item.order_id.slice(0, 8).toUpperCase()}...</td>
                      <td className="py-4 px-4 text-primary font-medium">{order?.customer_name || 'Guest'}</td>
                      <td className="py-4 px-4 text-center font-bold text-primary">₹{parseFloat(item.amount).toLocaleString()}</td>
                      <td className="py-4 px-4 text-center text-secondary">{item.method || '-'}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-label-caps tracking-widest uppercase font-bold ${item.status === 'success' || item.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {visibleCount < filteredTransactions.length && (
                  <tr ref={loadMoreRef}>
                    <td colSpan="6" className="py-4 text-center text-secondary">Loading more...</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right Details Panel */}
      {selectedItem ? (
        <div className="w-full md:w-96 flex-shrink-0 bg-white border border-outline-variant/30 rounded-lg shadow-sm p-6 flex flex-col h-fit text-left">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-headline-sm text-base font-bold text-primary">Transaction Info</h3>
            <button onClick={() => setSelectedItem(null)} className="text-secondary hover:text-primary bg-transparent border-none cursor-pointer p-0">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className="border-b border-outline-variant/10 pb-4">
              <div className="text-xs text-secondary">Transaction ID</div>
              <div className="font-mono text-sm font-bold text-primary break-all">{selectedItem.id}</div>
              
              <div className="text-xs text-secondary mt-3">Date & Time</div>
              <div className="text-sm font-bold text-primary">
                {new Date(selectedItem.created_at).toLocaleString('en-IN')}
              </div>
            </div>

            {(() => {
              const order = getOrderInfo(selectedItem.order_id);
              if (!order) {
                return (
                  <div className="text-sm text-secondary bg-surface-container-low p-4 rounded text-center">
                    No order data found associated with this transaction ID ({selectedItem.order_id}).
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <h4 className="font-label-caps text-[10px] text-secondary tracking-wider uppercase font-bold border-b border-outline-variant/10 pb-2">Associated Order</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-secondary block">Order ID</span>
                      <span className="font-mono font-bold text-primary">{order.id.slice(0, 8).toUpperCase()}...</span>
                    </div>
                    <div>
                      <span className="text-secondary block">Order Status</span>
                      <span className="font-bold text-primary">{order.status}</span>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-secondary block">Customer Details</span>
                    <span className="font-bold text-primary block">{order.customer_name}</span>
                    <span className="text-secondary block">{order.customer_email}</span>
                    {order.customer_phone && <span className="text-secondary block">{order.customer_phone}</span>}
                  </div>

                  <div className="text-xs">
                    <span className="text-secondary block">Shipping Address</span>
                    <span className="text-primary block whitespace-pre-wrap">{order.shipping_address}</span>
                    <span className="text-primary block">{order.city}{order.state ? `, ${order.state}` : ''} {order.pincode ? `- ${order.pincode}` : ''}</span>
                  </div>

                  <div className="border-t border-outline-variant/10 pt-4 text-xs">
                    <span className="text-secondary block mb-2 font-bold uppercase tracking-wider">Items Ordered</span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {Array.isArray(order.items) && order.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-4 bg-surface-container-low p-2 rounded">
                          <div>
                            <div className="font-bold text-primary">{i.title}</div>
                            <div className="text-secondary text-[10px]">{i.size || '-'} / {i.color || '-'} (Qty: {i.quantity || 1})</div>
                          </div>
                          <div className="font-bold text-primary">₹{((i.price || 0) * (i.quantity || 1)).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="w-full md:w-96 flex-shrink-0 bg-white border border-outline-variant/30 rounded-lg shadow-sm p-6 text-center text-secondary h-fit hidden md:block">
          Select a transaction to view associated order and customer details.
        </div>
      )}
    </div>
  );
}
