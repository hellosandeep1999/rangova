import React, { useState, useEffect, useMemo } from 'react';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../lib/api';

export default function AdminDiscounts({ triggerNotification, onRefresh, loading }) {
  const [discountsList, setDiscountsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  // Forms
  const [addForm, setAddForm] = useState({
    code: '',
    text: '',
    percent: 10,
    active: true
  });

  const [editForm, setEditForm] = useState({
    code: '',
    text: '',
    percent: 10,
    active: true
  });

  const fetchDiscountsData = async () => {
    try {
      setLocalLoading(true);
      const data = await getDiscounts();
      setDiscountsList(Array.isArray(data) ? data : []);
    } catch (err) {
      triggerNotification(`Error loading discounts: ${err.message || err}`);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountsData();
  }, []);

  const handleRefresh = async () => {
    await fetchDiscountsData();
    if (onRefresh) onRefresh();
    triggerNotification('Discounts refreshed');
  };

  const filteredDiscounts = useMemo(() => {
    return discountsList.filter(item => {
      const query = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(query) ||
        (item.text && item.text.toLowerCase().includes(query))
      );
    });
  }, [discountsList, searchQuery]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setEditForm({
      code: item.code || '',
      text: item.text || '',
      percent: item.percent || 0,
      active: item.active !== undefined ? item.active : true
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.code) {
      triggerNotification('Please enter a code');
      return;
    }
    try {
      setIsSubmitting(true);
      await createDiscount({
        code: addForm.code.toUpperCase().trim(),
        text: addForm.text.trim(),
        percent: parseInt(addForm.percent) || 0,
        active: addForm.active
      });
      triggerNotification('Discount code created successfully');
      setShowAddModal(false);
      setAddForm({ code: '', text: '', percent: 10, active: true });
      fetchDiscountsData();
    } catch (err) {
      triggerNotification(`Error creating discount: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDiscount = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      setIsSubmitting(true);
      await updateDiscount(selectedItem.id, {
        code: editForm.code.toUpperCase().trim(),
        text: editForm.text.trim(),
        percent: parseInt(editForm.percent) || 0,
        active: editForm.active
      });
      triggerNotification('Discount code updated successfully');
      fetchDiscountsData();
      setSelectedItem(prev => prev ? { ...prev, ...editForm, code: editForm.code.toUpperCase() } : null);
    } catch (err) {
      triggerNotification(`Error updating discount: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) return;
    try {
      setLocalLoading(true);
      await deleteDiscount(id);
      triggerNotification('Discount code deleted');
      setSelectedItem(null);
      fetchDiscountsData();
    } catch (err) {
      triggerNotification(`Error deleting discount: ${err.message || err}`);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
      {/* Left panel - Discounts Table */}
      <div className="flex-grow flex flex-col min-w-0 bg-white border border-outline-variant/30 rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-outline-variant/20 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-sm text-xl font-bold text-primary">Discounts</h2>
            <button 
              onClick={handleRefresh}
              disabled={localLoading || loading}
              className="p-2 text-secondary hover:text-primary hover:bg-surface-container rounded-full transition-colors cursor-pointer bg-transparent border-none"
              title="Refresh Discounts"
            >
              <span className={`material-symbols-outlined ${(localLoading || loading) ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-lg">search</span>
              <input
                type="text"
                placeholder="Search discount codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-outline-variant/50 focus:border-primary outline-none w-full sm:w-64"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary text-white hover:bg-secondary font-label-caps text-[10px] tracking-widest uppercase px-5 py-2.5 transition-colors cursor-pointer border-none flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">add</span> Add Discount
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto">
          {localLoading && discountsList.length === 0 ? (
            <div className="p-12 text-center text-secondary">Loading discounts...</div>
          ) : filteredDiscounts.length === 0 ? (
            <div className="p-12 text-center text-secondary">No discount codes found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-wider uppercase bg-surface-container-low">
                  <th className="py-3 px-6">Code</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {filteredDiscounts.map(item => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => handleSelectItem(item)}
                      className={`cursor-pointer hover:bg-surface-container-low transition-colors ${isSelected ? 'bg-surface-container font-medium' : ''}`}
                    >
                      <td className="py-4 px-6 font-bold text-primary tracking-wider uppercase">{item.code}</td>
                      <td className="py-4 px-4 text-secondary">{item.text || '-'}</td>
                      <td className="py-4 px-4 text-center font-bold text-primary">{item.percent}%</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-label-caps tracking-widest uppercase font-bold ${item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.active ? 'Active' : 'Inactive'}
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
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right details / edit panel */}
      {selectedItem ? (
        <div className="w-full md:w-80 flex-shrink-0 bg-white border border-outline-variant/30 rounded-lg shadow-sm p-6 flex flex-col h-fit text-left">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-headline-sm text-base font-bold text-primary">Edit Discount</h3>
            <button onClick={() => setSelectedItem(null)} className="text-secondary hover:text-primary bg-transparent border-none cursor-pointer p-0">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleUpdateDiscount} className="space-y-4">
            <div>
              <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Code</label>
              <input
                type="text"
                required
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary uppercase"
              />
            </div>

            <div>
              <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Description</label>
              <input
                type="text"
                value={editForm.text}
                onChange={(e) => setEditForm({ ...editForm, text: e.target.value })}
                className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Percentage Discount</label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={editForm.percent}
                onChange={(e) => setEditForm({ ...editForm, percent: e.target.value })}
                className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editForm.active}
                onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                className="cursor-pointer"
              />
              <label htmlFor="edit-active" className="text-sm font-bold text-primary cursor-pointer select-none">Active Code</label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white hover:bg-secondary font-label-caps text-[10px] tracking-widest uppercase py-3 transition-colors cursor-pointer border-none"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full md:w-80 flex-shrink-0 bg-white border border-outline-variant/30 rounded-lg shadow-sm p-6 text-center text-secondary h-fit hidden md:block">
          Select a discount code to view and edit details.
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
            <h3 className="font-headline-sm text-lg font-bold text-primary mb-6">Create Discount Code</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER25"
                  value={addForm.code}
                  onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
                  className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary uppercase"
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 10% off on all summer products"
                  value={addForm.text}
                  onChange={(e) => setAddForm({ ...addForm, text: e.target.value })}
                  className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-secondary tracking-wider block mb-2 uppercase">Percentage Discount</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={addForm.percent}
                  onChange={(e) => setAddForm({ ...addForm, percent: e.target.value })}
                  className="w-full border border-outline-variant/50 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="add-active"
                  checked={addForm.active}
                  onChange={(e) => setAddForm({ ...addForm, active: e.target.checked })}
                  className="cursor-pointer"
                />
                <label htmlFor="add-active" className="text-sm font-bold text-primary cursor-pointer select-none">Active Immediately</label>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-grow bg-primary text-white hover:bg-secondary font-label-caps text-[10px] tracking-widest uppercase py-3 transition-colors cursor-pointer border-none"
                >
                  {isSubmitting ? 'Creating...' : 'Create Discount'}
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
    </div>
  );
}
