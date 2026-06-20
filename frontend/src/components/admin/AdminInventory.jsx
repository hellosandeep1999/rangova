import React, { useState, useEffect, useMemo } from 'react';
import { getInventory, addInventory, updateInventory, deleteInventory } from '../../lib/api';
import ConfirmModal from '../ConfirmModal';

export default function AdminInventory({ products = [], triggerNotification, onRefresh, loading }) {
  const [inventoryList, setInventoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const [addForm, setAddForm] = useState({
    product_id: '',
    size: '',
    color: '',
    stock_qty: 0
  });

  const [editQty, setEditQty] = useState('');

  const fetchInventoryData = async () => {
    try {
      setLocalLoading(true);
      const data = await getInventory();
      setInventoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      triggerNotification(`Error loading inventory: ${err.message || err}`);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleRefresh = async () => {
    await fetchInventoryData();
    if (onRefresh) onRefresh();
    triggerNotification('Inventory refreshed');
  };

  // Find product helper
  const getProductInfo = (productId) => {
    return products.find(p => String(p.id) === String(productId)) || { title: `Product ID: ${productId}`, image_main: '' };
  };

  // Filtered inventory list
  const filteredInventory = useMemo(() => {
    return inventoryList.filter(item => {
      const prod = getProductInfo(item.product_id);
      const query = searchQuery.toLowerCase();
      return (
        prod.title.toLowerCase().includes(query) ||
        String(item.product_id).toLowerCase().includes(query) ||
        (item.size && item.size.toLowerCase().includes(query)) ||
        (item.color && item.color.toLowerCase().includes(query))
      );
    });
  }, [inventoryList, searchQuery, products]);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, products]);

  const displayedInventory = useMemo(() => filteredInventory.slice(0, visibleCount), [filteredInventory, visibleCount]);

  const loadMoreRef = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filteredInventory.length) {
        setVisibleCount(prev => prev + 20);
      }
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredInventory.length]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setEditQty(item.stock_qty);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.product_id) {
      triggerNotification('Please select a product');
      return;
    }
    try {
      setIsSubmitting(true);
      const newItem = await addInventory({
        product_id: addForm.product_id,
        size: addForm.size || '-',
        color: addForm.color || '-',
        stock_qty: parseInt(addForm.stock_qty) || 0
      });
      triggerNotification('Inventory added successfully');
      setShowAddModal(false);
      setAddForm({ product_id: '', size: '', color: '', stock_qty: 0 });
      fetchInventoryData();
    } catch (err) {
      triggerNotification(`Error adding inventory: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateQty = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      setIsSubmitting(true);
      const updated = await updateInventory(selectedItem.id, parseInt(editQty) || 0);
      triggerNotification('Inventory quantity updated');
      fetchInventoryData();
      setSelectedItem(prev => prev ? { ...prev, stock_qty: parseInt(editQty) || 0 } : null);
    } catch (err) {
      triggerNotification(`Error updating inventory: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = (id) => {
    setItemToDelete(id);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      setLocalLoading(true);
      await deleteInventory(itemToDelete);
      triggerNotification('Inventory record deleted');
      setSelectedItem(null);
      fetchInventoryData();
    } catch (err) {
      triggerNotification(`Error deleting inventory record: ${err.message || err}`);
    } finally {
      setLocalLoading(false);
      setItemToDelete(null);
    }
  };

  // Find product's options for dropdown details (like sizes/colors)
  const selectedProductDetails = useMemo(() => {
    if (!addForm.product_id) return null;
    return products.find(p => String(p.id) === String(addForm.product_id));
  }, [addForm.product_id, products]);

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 h-full overflow-hidden">
      {/* Left panel - Inventory table list */}
      <div className="flex-grow flex flex-col min-w-0 bg-white border border-outline-variant/30 rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-outline-variant/20 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-sm text-xl font-bold text-primary">Inventory</h2>
            <button 
              onClick={handleRefresh}
              disabled={localLoading || loading}
              className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-colors cursor-pointer bg-transparent border-none"
              title="Refresh Inventory"
            >
              <span className={`material-symbols-outlined ${(localLoading || loading) ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-lg">search</span>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-outline-variant/50 focus:border-primary outline-none w-full sm:w-64"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white hover:bg-secondary font-label-caps text-[10px] tracking-widest uppercase px-5 py-2.5 transition-colors cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add Inventory
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto">
          {localLoading && inventoryList.length === 0 ? (
            <div className="p-12 text-center text-secondary">Loading inventory...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-12 text-center text-secondary">No inventory records found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-wider uppercase bg-surface-container-low">
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Color</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {displayedInventory.map(item => {
                  const prod = getProductInfo(item.product_id);
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => handleSelectItem(item)}
                      className={`cursor-pointer hover:bg-surface-container-low transition-colors ${isSelected ? 'bg-surface-container font-medium' : ''}`}
                    >
                      <td className="py-4 px-6 flex items-center gap-3">
                        {prod.image_main && (
                          <img src={prod.image_main} alt={prod.title} className="w-8 h-10 object-cover rounded" />
                        )}
                        <div>
                          <div className="font-bold text-primary max-w-xs truncate">{prod.title}</div>
                          <div className="text-[11px] text-secondary">ID: {item.product_id}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-secondary">{item.size || '-'}</td>
                      <td className="py-4 px-4 text-secondary">{item.color || '-'}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${item.stock_qty <= 0 ? 'bg-red-100 text-red-800' : item.stock_qty < 5 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                          {item.stock_qty}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-muted-terracotta hover:text-red-700 bg-transparent border-none cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {visibleCount < filteredInventory.length && (
                  <tr ref={loadMoreRef}>
                    <td colSpan="5" className="py-4 text-center text-secondary">Loading more...</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right details panel */}
      {selectedItem ? (
        <div className="w-full md:w-80 flex-shrink-0 bg-white border border-outline-variant/30 rounded-lg shadow-sm p-6 flex flex-col h-fit text-left">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-headline-sm text-base font-bold text-primary">Inventory Details</h3>
            <button onClick={() => setSelectedItem(null)} className="text-secondary hover:text-primary bg-transparent border-none cursor-pointer p-0">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {(() => {
            const prod = getProductInfo(selectedItem.product_id);
            return (
              <div className="space-y-6">
                <div className="flex gap-4">
                  {prod.image_main && (
                    <img src={prod.image_main} alt={prod.title} className="w-16 h-20 object-cover rounded border border-outline-variant/20" />
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-primary">{prod.title}</h4>
                    <p className="text-xs text-secondary mt-1">ID: {selectedItem.product_id}</p>
                    <p className="text-xs text-secondary mt-0.5">Price: ₹{prod.price || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-outline-variant/10 py-4 text-xs">
                  <div>
                    <span className="text-secondary block">Size</span>
                    <span className="font-bold text-primary">{selectedItem.size || '-'}</span>
                  </div>
                  <div>
                    <span className="text-secondary block">Color</span>
                    <span className="font-bold text-primary">{selectedItem.color || '-'}</span>
                  </div>
                </div>

                <form onSubmit={handleUpdateQty} className="space-y-4">
                  <div>
                    <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Update Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white hover:bg-secondary font-label-caps text-[10px] tracking-widest uppercase py-3 transition-colors cursor-pointer border-none"
                  >
                    {isSubmitting ? 'Updating...' : 'Save Stock Quantity'}
                  </button>
                </form>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="w-full md:w-80 flex-shrink-0 bg-white border border-outline-variant/30 rounded-lg shadow-sm p-6 text-center text-secondary h-fit hidden md:block">
          Select an inventory item to view and edit details.
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-outline-variant/30 w-full max-w-md p-6 relative text-left">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-secondary hover:text-primary bg-transparent border-none cursor-pointer p-0"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-sm text-lg font-bold text-primary mb-6">Add New Inventory Record</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Select Product</label>
                <select
                  required
                  value={addForm.product_id}
                  onChange={(e) => setAddForm({ ...addForm, product_id: e.target.value, size: '', color: '' })}
                  className="w-full bg-transparent border border-outline-variant/50 p-2.5 text-sm outline-none focus:border-primary rounded-none"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Size</label>
                  {selectedProductDetails?.sizes && Array.isArray(selectedProductDetails.sizes) ? (
                    <select
                      value={addForm.size}
                      onChange={(e) => setAddForm({ ...addForm, size: e.target.value })}
                      className="w-full bg-transparent border border-outline-variant/50 p-2.5 text-sm outline-none focus:border-primary rounded-none"
                    >
                      <option value="">-- Size --</option>
                      {selectedProductDetails.sizes.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. S, M, L"
                      value={addForm.size}
                      onChange={(e) => setAddForm({ ...addForm, size: e.target.value })}
                      className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                    />
                  )}
                </div>

                <div>
                  <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Color</label>
                  {selectedProductDetails?.colors && Array.isArray(selectedProductDetails.colors) ? (
                    <select
                      value={addForm.color}
                      onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                      className="w-full bg-transparent border border-outline-variant/50 p-2.5 text-sm outline-none focus:border-primary rounded-none"
                    >
                      <option value="">-- Color --</option>
                      {selectedProductDetails.colors.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. Red, Black"
                      value={addForm.color}
                      onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                      className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Initial Stock Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={addForm.stock_qty}
                  onChange={(e) => setAddForm({ ...addForm, stock_qty: e.target.value })}
                  className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-grow bg-primary text-white hover:bg-secondary font-label-caps text-[10px] tracking-widest uppercase py-3 transition-colors cursor-pointer border-none"
                >
                  {isSubmitting ? 'Creating...' : 'Create Inventory Record'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-transparent text-secondary hover:text-primary font-label-caps text-[10px] tracking-widest uppercase border border-outline-variant/50 px-6 py-3 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onConfirm={confirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
        message="Are you sure you want to delete this inventory record? This action cannot be undone."
      />
    </div>
  );
}
