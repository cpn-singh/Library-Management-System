import React, { useState, useEffect } from 'react';
import { X, BookPlus, Edit3, Image, Layers, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Computer Science',
  'Science Fiction',
  'History',
  'Philosophy',
  'Self-Development',
  'Classic Fiction',
  'Science',
  'Art & Architecture',
  'Business & Economics'
];

const PRESET_COVERS = [
  { label: 'Technology / Code', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80' },
  { label: 'Cloud / Data', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80' },
  { label: 'Sci-Fi / Space', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80' },
  { label: 'History / Manuscript', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80' },
  { label: 'Philosophy / Sculpture', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
  { label: 'General Modern Book', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80' }
];

export default function AddEditBookModal({ isOpen, onClose, onSave, editingBook }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    publisher: '',
    publishedYear: new Date().getFullYear(),
    shelfLocation: 'Stack CS-101 (Shelf A)',
    description: '',
    coverImage: PRESET_COVERS[0].url,
    initialCopiesCount: 2
  });

  useEffect(() => {
    if (editingBook) {
      setFormData({
        title: editingBook.title || '',
        author: editingBook.author || '',
        isbn: editingBook.isbn || '',
        category: editingBook.category || 'Computer Science',
        publisher: editingBook.publisher || '',
        publishedYear: editingBook.publishedYear || new Date().getFullYear(),
        shelfLocation: editingBook.shelfLocation || '',
        description: editingBook.description || '',
        coverImage: editingBook.coverImage || PRESET_COVERS[0].url,
        initialCopiesCount: editingBook.copies?.length || 1
      });
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
        category: 'Computer Science',
        publisher: 'Academic Press',
        publishedYear: 2024,
        shelfLocation: 'Stack CS-101 (Shelf A)',
        description: '',
        coverImage: PRESET_COVERS[0].url,
        initialCopiesCount: 2
      });
    }
  }, [editingBook, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 my-auto sm:my-8">
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {editingBook ? (
              <Edit3 className="w-5 h-5 text-amber-400" />
            ) : (
              <BookPlus className="w-5 h-5 text-indigo-400" />
            )}
            <h3 className="font-serif text-base sm:text-lg font-bold">
              {editingBook ? 'Edit Catalog Record' : 'Catalog New Acquisition'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Structure and Interpretation of Computer Programs"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author(s) *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Harold Abelson, Gerald Jay Sussman"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ISBN-13 Number *
              </label>
              <input
                type="text"
                required
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="e.g. 978-0262510875"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition font-mono"
              />
            </div>
          </div>

          {/* Category & Publisher & Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Genre / Classification
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="e.g. MIT Press"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Publication Year
              </label>
              <input
                type="number"
                min="1800"
                max="2030"
                value={formData.publishedYear}
                onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {/* Shelf Location & Copies (Copies only when adding new) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Shelf / Stack Callout
              </label>
              <input
                type="text"
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                placeholder="e.g. Stack CS-204 (Shelf C)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            {!editingBook && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Initial Physical Copies</span>
                  <span className="text-[10px] text-indigo-600 font-bold">Auto-generates barcodes</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.initialCopiesCount}
                    onChange={(e) => setFormData({ ...formData, initialCopiesCount: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Book Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Abstract / Synopsis
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a comprehensive synopsis for patrons to read..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          {/* Cover Image URL & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Cover Art Image URL</span>
              <span className="text-[10px] text-slate-600">Select preset or paste Unsplash URL</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition truncate"
              />
              <img
                src={formData.coverImage}
                alt="Preview"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                onError={(e) => { e.target.src = PRESET_COVERS[0].url; }}
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_COVERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 text-slate-600 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 text-center"
            >
              {editingBook ? 'Save Catalog Updates' : 'Catalog Book & Generate Copies'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
