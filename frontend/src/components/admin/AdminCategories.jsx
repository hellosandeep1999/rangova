import React, { useState } from 'react';
import { createCategory, updateCategory, deleteCategory, uploadFileToSupabase } from '../../lib/api';

export default function AdminCategories({ categories, setCategories, triggerNotification, onRefresh, loading }) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // DB columns: id (uuid), title, idx, image_url, slug, created_at
  const [categoryForm, setCategoryForm] = useState({ title: '', slug: '', idx: '', image_url: '' });

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        title: category.title || '',
        slug: category.slug || '',
        idx: category.idx || '',
        image_url: category.image_url || '',
      });
      setImagePreview(category.image_url || null);
    } else {
      setEditingCategory(null);
      setCategoryForm({ title: '', slug: '', idx: '', image_url: '' });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowCategoryModal(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    // Validate all fields
    if (!categoryForm.title.trim()) { triggerNotification('Title is required'); return; }
    if (!categoryForm.slug.trim()) { triggerNotification('Slug is required'); return; }
    if (!categoryForm.idx.toString().trim()) { triggerNotification('Display order (idx) is required'); return; }
    let uploadedUrl = categoryForm.image_url;

    try {
      if (imageFile) {
        setIsUploading(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `categories/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const { supabase } = await import('../../lib/api');
        const { error: uploadError } = await supabase.storage.from('rangova').upload(fileName, imageFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from('rangova').getPublicUrl(fileName);
        uploadedUrl = publicData.publicUrl;
      }
    } catch (err) {
      console.error('Upload error:', err);
      triggerNotification(`Error uploading image: ${err.message || err}`);
      setIsUploading(false);
      return; // Stop save if upload fails
    }

    if (!uploadedUrl.trim()) { triggerNotification('Image is required'); setIsUploading(false); return; }

    const payload = {
      title: categoryForm.title.trim(),
      slug: categoryForm.slug.trim(),
      idx: parseInt(categoryForm.idx, 10),
      image_url: uploadedUrl.trim(),
    };

    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, payload);
        setCategories(categories.map(c => c.id === editingCategory.id ? updated : c));
        if (selectedCategory?.id === editingCategory.id) setSelectedCategory(updated);
        triggerNotification('Category updated successfully');
      } else {
        const created = await createCategory(payload);
        setCategories([created, ...categories]);
        triggerNotification('Category added successfully');
      }
      setShowCategoryModal(false);
    } catch (err) {
      console.error('Save category error:', err);
      triggerNotification(`Error saving category: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
        if (selectedCategory?.id === id) setSelectedCategory(null);
        triggerNotification('Category deleted successfully');
      } catch (err) {
        triggerNotification('Error deleting category');
      }
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    return (a.idx || 0) - (b.idx || 0);
  });

  return (
    <div className="flex gap-4 h-full">
      {/* Main List */}
      <div className={`flex flex-col transition-all duration-300 ${selectedCategory ? 'flex-1 min-w-0' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-sm text-2xl font-bold text-primary">Categories</h2>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-outline-variant/30 text-[10px] font-label-caps uppercase tracking-widest text-primary hover:bg-surface-variant/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refresh
            </button>
          </div>
          <button
            onClick={() => handleOpenCategoryModal()}
            style={{ backgroundColor: '#1b1c1c', color: '#fff' }}
            className="font-label-caps text-[10px] uppercase tracking-widest px-6 py-3 hover:opacity-80 transition-opacity border-none cursor-pointer"
          >
            + Add Category
          </button>
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-variant/30 border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                <tr>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Order (idx)</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {sortedCategories.map(cat => (
                  <tr
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory?.id === cat.id ? null : cat)}
                    className={`cursor-pointer transition-colors ${selectedCategory?.id === cat.id ? 'bg-surface-variant/40' : 'hover:bg-surface-container-low'}`}
                  >
                    <td className="py-3 px-4">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.title} className="w-12 h-12 object-cover border border-outline-variant/20" />
                      ) : (
                        <div className="w-12 h-12 bg-surface-variant border border-outline-variant/20 flex items-center justify-center text-[9px] text-secondary">No Img</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">{cat.title}</td>
                    <td className="py-3 px-4 text-secondary font-mono text-xs">{cat.slug}</td>
                    <td className="py-3 px-4 text-secondary">{cat.idx || '-'}</td>
                    <td className="py-3 px-4 text-secondary text-xs">
                      {cat.created_at ? new Date(cat.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="text-[10px] font-label-caps uppercase text-primary hover:text-muted-terracotta transition-colors bg-transparent border-none cursor-pointer mr-3"
                      >Edit</button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-[10px] font-label-caps uppercase text-muted-terracotta hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-secondary">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-xs text-secondary">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} • Click a row to view details</p>
      </div>

      {/* Right Detail Panel */}
      {selectedCategory && (
        <div className="w-72 flex-shrink-0 bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <div className="flex justify-between items-center p-4 border-b border-outline-variant/20 sticky top-0 bg-white z-10">
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary">Category</p>
              <p className="font-bold text-primary">{selectedCategory.title}</p>
            </div>
            <button onClick={() => setSelectedCategory(null)} className="bg-transparent border-none cursor-pointer text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Image */}
            {selectedCategory.image_url ? (
              <img src={selectedCategory.image_url} alt={selectedCategory.title} className="w-full aspect-square object-cover border border-outline-variant/20" />
            ) : (
              <div className="w-full aspect-square bg-surface-variant flex items-center justify-center text-secondary">No Image</div>
            )}

            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">ID</p>
              <p className="font-mono text-xs bg-surface-variant/40 p-2 rounded break-all">{selectedCategory.id}</p>
            </div>
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Title</p>
              <p className="font-bold">{selectedCategory.title}</p>
            </div>
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Slug</p>
              <p className="font-mono text-sm">{selectedCategory.slug}</p>
            </div>
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Display Order (idx)</p>
              <p>{selectedCategory.idx || '-'}</p>
            </div>
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Created</p>
              <p className="text-sm">{selectedCategory.created_at ? new Date(selectedCategory.created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) : '-'}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleOpenCategoryModal(selectedCategory)}
                style={{ backgroundColor: '#1b1c1c', color: '#fff' }}
                className="flex-1 py-2 font-label-caps text-[10px] uppercase tracking-widest border-none cursor-pointer hover:opacity-80 transition-opacity"
              >Edit</button>
              <button
                onClick={() => handleDeleteCategory(selectedCategory.id)}
                className="flex-1 py-2 font-label-caps text-[10px] uppercase tracking-widest border border-red-300 text-red-600 bg-transparent cursor-pointer hover:bg-red-50 transition-colors"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-sm shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">

              {/* Title */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">
                  Title <span style={{ color: '#9B3018' }}>*</span>
                </label>
                <input
                  required
                  className="w-full border border-outline-variant/30 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                  placeholder="e.g. Men's Kurtas"
                  value={categoryForm.title}
                  onChange={e => setCategoryForm({
                    ...categoryForm,
                    title: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  })}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">
                  Slug <span style={{ color: '#9B3018' }}>*</span>
                </label>
                <input
                  required
                  className="w-full border border-outline-variant/30 p-2.5 text-sm bg-transparent outline-none focus:border-primary font-mono"
                  placeholder="e.g. mens-kurtas"
                  value={categoryForm.slug}
                  onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">
                  Display Order (idx) <span style={{ color: '#9B3018' }}>*</span>
                </label>
                <input
                  required
                  type="text"
                  className="w-full border border-outline-variant/30 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                  placeholder="e.g. 1, 2, 3 (controls sort order)"
                  value={categoryForm.idx}
                  onChange={e => setCategoryForm({ ...categoryForm, idx: e.target.value })}
                />
              </div>

              {/* Image Upload */}
              <div className="border border-outline-variant/30 p-4 bg-surface-container-low">
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-2">
                  Category Image <span style={{ color: '#9B3018' }}>*</span>
                </label>
                {imagePreview && (
                  <img src={imagePreview} className="h-20 object-cover mb-3 border border-outline-variant/30" alt="preview" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-xs w-full mb-2"
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-xs text-secondary animate-pulse">Uploading to Supabase storage...</p>
                )}
                <p className="text-[10px] text-secondary mt-1">Or enter image URL directly:</p>
                <input
                  className="w-full border border-outline-variant/30 p-2 text-xs bg-transparent outline-none mt-1 focus:border-primary"
                  placeholder="https://..."
                  value={categoryForm.image_url}
                  onChange={e => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-2.5 border border-outline-variant/30 font-label-caps text-[10px] tracking-widest uppercase hover:bg-surface-variant/30 transition-colors cursor-pointer bg-transparent"
                >Cancel</button>
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{ backgroundColor: isUploading ? '#888' : '#1b1c1c', color: '#fff' }}
                  className="px-6 py-2.5 font-label-caps text-[10px] tracking-widest uppercase cursor-pointer border-none disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                >
                  {isUploading ? 'Uploading...' : editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
