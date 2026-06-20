import React, { useState, useEffect } from 'react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../lib/api';
import ConfirmModal from '../ConfirmModal';

const EMPTY_FORM = { name: '', customer_position: '', image_url: '', review: '' };

export default function AdminTestimonials({ triggerNotification }) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTestimonials();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      triggerNotification(`Error loading testimonials: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name || '',
        customer_position: item.customer_position || '',
        image_url: item.image_url || '',
        review: item.review || '',
      });
      setImagePreview(item.image_url || null);
    } else {
      setEditingItem(null);
      setForm(EMPTY_FORM);
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.review.trim()) {
      triggerNotification('Name and Review are required.');
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = form.image_url;

      if (imageFile) {
        const { supabase } = await import('../../lib/api');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `testimonials/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('rangova').upload(fileName, imageFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from('rangova').getPublicUrl(fileName);
        imageUrl = pub.publicUrl;
      }

      const payload = {
        name: form.name.trim(),
        customer_position: form.customer_position.trim(),
        image_url: imageUrl,
        review: form.review.trim(),
      };

      if (editingItem) {
        const updated = await updateTestimonial(editingItem.id, payload);
        setTestimonials(prev => prev.map(t => t.id === editingItem.id ? updated : t));
        triggerNotification('Testimonial updated!');
      } else {
        const created = await createTestimonial(payload);
        setTestimonials(prev => [created, ...prev]);
        triggerNotification('Testimonial added!');
      }
      setShowModal(false);
    } catch (err) {
      triggerNotification(`Error saving: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteTestimonial(confirmDelete.id);
      setTestimonials(prev => prev.filter(t => t.id !== confirmDelete.id));
      triggerNotification('Testimonial deleted.');
    } catch (err) {
      triggerNotification(`Error deleting: ${err.message || err}`);
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-sm text-2xl font-bold text-primary">Voice of Rangova</h2>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-outline-variant/30 text-[10px] font-label-caps uppercase tracking-widest text-primary hover:bg-surface-variant/30 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh
          </button>
        </div>
        <button
          onClick={() => handleOpen()}
          style={{ backgroundColor: '#1b1c1c', color: '#fff' }}
          className="font-label-caps text-[10px] uppercase tracking-widest px-6 py-3 hover:opacity-80 transition-opacity border-none cursor-pointer"
        >
          + Add Testimonial
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-secondary">Loading testimonials...</div>
      ) : testimonials.length === 0 ? (
        <div className="py-16 text-center text-secondary bg-white border border-outline-variant/20 rounded-sm">
          <span className="material-symbols-outlined text-4xl block mb-3 opacity-30">format_quote</span>
          No testimonials yet. Add your first one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white border border-outline-variant/20 rounded-sm shadow-sm overflow-hidden flex flex-col">
              <div className="flex gap-4 p-5 flex-1">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-outline-variant/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary border-2 border-outline-variant/20">
                      <span className="material-symbols-outlined text-2xl">person</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-primary text-sm">{t.name}</p>
                  {t.customer_position && (
                    <p className="text-xs text-muted-terracotta font-label-caps uppercase tracking-wide mb-2">{t.customer_position}</p>
                  )}
                  <p className="text-xs text-secondary leading-relaxed italic line-clamp-4">"{t.review}"</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex border-t border-outline-variant/10">
                <button
                  onClick={() => handleOpen(t)}
                  className="flex-1 py-2.5 text-[10px] font-label-caps uppercase tracking-widest text-primary hover:bg-surface-container-low transition-colors bg-transparent border-none cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete({ id: t.id, name: t.name })}
                  className="flex-1 py-2.5 text-[10px] font-label-caps uppercase tracking-widest text-muted-terracotta hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer border-l border-outline-variant/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-sm shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-xl font-bold text-primary">
                {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={() => setShowModal(false)} className="bg-transparent border-none cursor-pointer text-secondary hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Customer Name <span className="text-muted-terracotta">*</span></label>
                <input
                  required
                  className="w-full border border-outline-variant/30 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Position / Role</label>
                <input
                  className="w-full border border-outline-variant/30 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                  placeholder="e.g. Architect, Designer, Curator"
                  value={form.customer_position}
                  onChange={e => setForm({ ...form, customer_position: e.target.value })}
                />
              </div>

              <div className="border border-outline-variant/30 p-4 bg-surface-container-low">
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-2">Customer Image</label>
                {imagePreview && (
                  <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-full object-cover mb-3 border border-outline-variant/20" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="text-xs w-full mb-2"
                  disabled={isUploading}
                />
                <p className="text-[10px] text-secondary mb-1">Or paste image URL:</p>
                <input
                  className="w-full border border-outline-variant/30 p-2 text-xs bg-transparent outline-none focus:border-primary"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={e => { setForm({ ...form, image_url: e.target.value }); setImagePreview(e.target.value); }}
                />
              </div>

              <div>
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Review <span className="text-muted-terracotta">*</span></label>
                <textarea
                  required
                  rows={4}
                  className="w-full border border-outline-variant/30 p-2.5 text-sm bg-transparent outline-none focus:border-primary resize-none"
                  placeholder="Customer's review text..."
                  value={form.review}
                  onChange={e => setForm({ ...form, review: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-outline-variant/30 font-label-caps text-[10px] tracking-widest uppercase hover:bg-surface-variant/30 transition-colors cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{ backgroundColor: '#1b1c1c', color: '#fff' }}
                  className="px-6 py-2.5 font-label-caps text-[10px] tracking-widest uppercase cursor-pointer border-none hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : editingItem ? 'Update' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
