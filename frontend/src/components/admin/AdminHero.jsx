import React, { useState, useEffect } from 'react';
import { getSetting, updateSetting } from '../../lib/api';
import ConfirmModal from '../ConfirmModal';

const DEFAULT_SLIDES = [];

export default function AdminHero({ triggerNotification }) {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [form, setForm] = useState({ img: '', headline: '', sub: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const resData = await getSetting('hero_slides');
      let parsed = resData?.value || resData;
      if (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch(e) {}
      }
      if (Array.isArray(parsed)) {
        setSlides(parsed);
      } else {
        setSlides(DEFAULT_SLIDES);
      }
    } catch (err) {
      triggerNotification(`Error loading hero slides: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpen = (idx = null) => {
    if (idx !== null) {
      const slide = slides[idx];
      setEditingIdx(idx);
      setForm({ img: slide.img || '', headline: slide.headline || '', sub: slide.sub || '' });
      setImagePreview(slide.img || null);
    } else {
      setEditingIdx(null);
      setForm({ img: '', headline: '', sub: '' });
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

  const saveToDB = async (newSlides) => {
    try {
      await updateSetting('hero_slides', newSlides);
      setSlides(newSlides);
      triggerNotification('Hero slides updated successfully');
    } catch (err) {
      triggerNotification(`Error saving slides: ${err.message}`);
      throw err;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.headline.trim()) {
      triggerNotification('Headline is required');
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = form.img;

      if (imageFile) {
        const { supabase } = await import('../../lib/api');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `hero/${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('rangova').upload(fileName, imageFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from('rangova').getPublicUrl(fileName);
        imageUrl = pub.publicUrl;
      }

      if (!imageUrl) {
        triggerNotification('Image is required');
        return;
      }

      const updatedSlide = {
        img: imageUrl,
        headline: form.headline.trim(),
        sub: form.sub.trim()
      };

      let newSlides = [...slides];
      if (editingIdx !== null) {
        newSlides[editingIdx] = updatedSlide;
      } else {
        newSlides.push(updatedSlide);
      }

      await saveToDB(newSlides);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteIdx === null) return;
    const newSlides = slides.filter((_, i) => i !== confirmDeleteIdx);
    await saveToDB(newSlides);
    setConfirmDeleteIdx(null);
  };

  const handleMove = async (idx, dir) => {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === slides.length - 1)) return;
    const newSlides = [...slides];
    const temp = newSlides[idx];
    newSlides[idx] = newSlides[idx + dir];
    newSlides[idx + dir] = temp;
    await saveToDB(newSlides);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-sm text-2xl font-bold text-primary">Hero Carousel</h2>
          <button
            onClick={fetchSlides}
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
          + Add Slide
        </button>
      </div>

      <div className="text-sm text-secondary bg-surface-container-low p-4 border border-outline-variant/20 flex items-start gap-3">
        <span className="material-symbols-outlined text-muted-terracotta">info</span>
        <div>
          <p className="font-bold text-primary mb-1">Hero Section Management</p>
          <p>These slides appear at the top of the Home page. Images should ideally be landscape orientation and high quality. Dragging to reorder is not supported yet, use the up/down arrows.</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-secondary">Loading slides...</div>
      ) : slides.length === 0 ? (
        <div className="py-16 text-center text-secondary bg-white border border-outline-variant/20 rounded-sm">
          No slides added. Add a slide to show the hero carousel on the home page.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {slides.map((slide, idx) => (
            <div key={idx} className="bg-white border border-outline-variant/20 rounded-sm shadow-sm flex flex-col md:flex-row overflow-hidden group">
              {/* Image Preview */}
              <div className="w-full md:w-64 h-40 md:h-auto relative flex-shrink-0 bg-surface-variant">
                {slide.img ? (
                  <img src={slide.img} alt={slide.headline} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary text-sm">No Image</div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 p-5 flex flex-col justify-center">
                <p className="font-label-caps text-[10px] text-muted-terracotta uppercase tracking-[0.2em] mb-2">{slide.sub || 'No Subheading'}</p>
                <h3 className="font-display-lg text-2xl text-primary font-bold mb-4">{slide.headline || 'No Headline'}</h3>
              </div>

              {/* Actions & Ordering */}
              <div className="border-t md:border-t-0 md:border-l border-outline-variant/20 flex md:flex-col bg-surface-container-low w-full md:w-16 flex-shrink-0">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  className="flex-1 py-3 text-secondary hover:text-primary hover:bg-surface-variant/50 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-30 flex items-center justify-center"
                  title="Move Up"
                >
                  <span className="material-symbols-outlined">keyboard_arrow_up</span>
                </button>
                <button
                  disabled={idx === slides.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  className="flex-1 py-3 text-secondary hover:text-primary hover:bg-surface-variant/50 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-30 flex items-center justify-center"
                  title="Move Down"
                >
                  <span className="material-symbols-outlined">keyboard_arrow_down</span>
                </button>
                <button
                  onClick={() => handleOpen(idx)}
                  className="flex-1 py-3 text-primary hover:bg-surface-variant/50 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
                  title="Edit"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  onClick={() => setConfirmDeleteIdx(idx)}
                  className="flex-1 py-3 text-muted-terracotta hover:bg-red-50 hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
                  title="Delete"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-sm shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-sm text-xl font-bold text-primary">
                {editingIdx !== null ? 'Edit Slide' : 'Add Slide'}
              </h2>
              <button onClick={() => setShowModal(false)} className="bg-transparent border-none cursor-pointer text-secondary hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Headline <span className="text-muted-terracotta">*</span></label>
                <input
                  required
                  className="w-full border border-outline-variant/30 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                  value={form.headline}
                  placeholder="e.g. Modern Tradition"
                  onChange={e => setForm({ ...form, headline: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Subheading</label>
                <input
                  className="w-full border border-outline-variant/30 p-2.5 text-sm bg-transparent outline-none focus:border-primary"
                  placeholder="e.g. Ancestral Craft, Contemporary Grace"
                  value={form.sub}
                  onChange={e => setForm({ ...form, sub: e.target.value })}
                />
              </div>

              <div className="border border-outline-variant/30 p-4 bg-surface-container-low">
                <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-2">Slide Image <span className="text-muted-terracotta">*</span></label>
                {imagePreview && (
                  <img src={imagePreview} alt="preview" className="w-full h-32 object-cover mb-3 border border-outline-variant/20" />
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
                  value={form.img}
                  onChange={e => { setForm({ ...form, img: e.target.value }); setImagePreview(e.target.value); }}
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
                  {isUploading ? 'Uploading...' : editingIdx !== null ? 'Update Slide' : 'Add Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={confirmDeleteIdx !== null}
        title="Delete Slide"
        message="Are you sure you want to remove this slide from the hero carousel?"
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteIdx(null)}
      />
    </div>
  );
}
