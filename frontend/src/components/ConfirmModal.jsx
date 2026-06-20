import React, { useEffect } from 'react';

/**
 * Global centered confirm-delete modal.
 * Replaces window.confirm() for all delete operations.
 * 
 * Props:
 *   isOpen       {boolean}   – controls visibility
 *   title        {string}    – dialog heading (default: "Confirm Delete")
 *   message      {string}    – body text
 *   confirmLabel {string}    – confirm button label (default: "Delete")
 *   onConfirm    {function}  – called when user confirms
 *   onCancel     {function}  – called when user cancels / closes
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Card */}
      <div
        className="relative bg-white w-full max-w-sm shadow-2xl border border-outline-variant/30 animate-fadeIn"
        style={{ animation: 'fadeInScale 0.2s ease-out' }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-muted-terracotta" />

        <div className="p-8">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 border border-red-100 mx-auto mb-5">
            <span className="material-symbols-outlined text-muted-terracotta text-[22px]">
              delete_forever
            </span>
          </div>

          {/* Title */}
          <h2
            id="confirm-modal-title"
            className="font-headline-sm text-xl font-bold text-primary text-center mb-2"
          >
            {title}
          </h2>

          {/* Message */}
          <p className="text-sm text-secondary text-center leading-relaxed mb-8">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-outline-variant/40 font-label-caps text-[10px] tracking-widest uppercase text-primary hover:bg-surface-container-low transition-colors bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-muted-terracotta text-white font-label-caps text-[10px] tracking-widest uppercase hover:bg-red-700 transition-colors border-none cursor-pointer"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
