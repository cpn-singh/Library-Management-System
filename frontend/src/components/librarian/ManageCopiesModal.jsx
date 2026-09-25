import React, { useState } from 'react';
import {
  X,
  Layers,
  Plus,
  Trash2,
  Barcode,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function ManageCopiesModal({ book, isOpen, onClose }) {
  const { addBookCopy, updateBookCopy, removeBookCopy, loans } = useLibrary();

  const [newBarcode, setNewBarcode] = useState('');
  const [newCondition, setNewCondition] = useState('Mint');
  const [newShelf, setNewShelf] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen || !book) return null;

  const copies = book.copies || [];

  const handleAddCopy = (e) => {
    e.preventDefault();
    addBookCopy(book.id, {
      barcode: newBarcode.trim() || undefined,
      condition: newCondition,
      shelfLocation: newShelf.trim() || book.shelfLocation
    });
    setNewBarcode('');
    setNewCondition('Mint');
    setNewShelf('');
    setShowAddForm(false);
  };

  // Helper to find who borrowed a specific copy
  const getBorrowerForCopy = (copyId) => {
    const loan = loans.find(l => l.bookId === book.id && l.copyId === copyId && l.status !== 'returned');
    return loan ? loan.userName : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 my-auto sm:my-8">
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-4 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold">Physical Copies Inventory</h3>
              <p className="text-xs text-indigo-200 line-clamp-1">"{book.title}"</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Quick Summary Pill */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Total Registered Copies:</span>
              <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                {copies.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {copies.filter(c => c.status === 'available').length} Available
              </span>
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {copies.filter(c => c.status === 'borrowed').length} On Loan
              </span>
            </div>
          </div>

          {/* Copies List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Physical Inventory Records
              </h4>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Physical Copy</span>
                </button>
              )}
            </div>

            {/* Add New Copy Inline Form */}
            {showAddForm && (
              <form onSubmit={handleAddCopy} className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 text-xs animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Acquire & Register New Copy
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Barcode (Optional)
                    </label>
                    <input
                      type="text"
                      value={newBarcode}
                      onChange={(e) => setNewBarcode(e.target.value)}
                      placeholder="Auto-generated if empty"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Physical Condition
                    </label>
                    <select
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    >
                      <option value="Mint">Mint (Brand New)</option>
                      <option value="Good">Good (Minor wear)</option>
                      <option value="Worn">Worn (Readable)</option>
                      <option value="Damaged">Damaged (Needs repair)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Shelf Location
                    </label>
                    <input
                      type="text"
                      value={newShelf}
                      onChange={(e) => setNewShelf(e.target.value)}
                      placeholder={book.shelfLocation || 'Stack CS-101'}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1 rounded-lg border border-slate-300 bg-white text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm"
                  >
                    Confirm & Save Copy
                  </button>
                </div>
              </form>
            )}

            {/* Existing Copies Card List */}
            <div className="space-y-2.5">
              {copies.map((copy, index) => {
                const borrower = getBorrowerForCopy(copy.copyId);
                const isBorrowed = copy.status === 'borrowed';

                return (
                  <div
                    key={copy.copyId}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                            <Barcode className="w-3.5 h-3.5 text-slate-400" />
                            {copy.barcode}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isBorrowed
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isBorrowed ? 'On Loan' : 'Available'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-slate-500 text-[11px]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {copy.shelfLocation || book.shelfLocation}
                          </span>
                          <span>•</span>
                          <span>Acquired: {copy.acquiredDate || '2023-01-01'}</span>
                        </div>

                        {borrower && (
                          <p className="mt-1 text-[11px] text-amber-700 font-medium">
                            Currently borrowed by <strong>{borrower}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Condition Editor */}
                      <div>
                        <select
                          value={copy.condition}
                          onChange={(e) => updateBookCopy(book.id, copy.copyId, { condition: e.target.value })}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                        >
                          <option value="Mint">Mint Condition</option>
                          <option value="Good">Good Condition</option>
                          <option value="Worn">Worn Condition</option>
                          <option value="Damaged">Damaged Condition</option>
                        </select>
                      </div>

                      {/* Remove Copy */}
                      <button
                        type="button"
                        onClick={() => removeBookCopy(book.id, copy.copyId)}
                        disabled={isBorrowed}
                        className={`p-1.5 rounded-lg border transition ${
                          isBorrowed
                            ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                            : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                        }`}
                        title={isBorrowed ? 'Cannot delete copy while on loan' : 'Delete physical copy'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm text-center"
          >
            Close Copies Manager
          </button>
        </div>
      </div>
    </div>
  );
}
