import React, { useState } from 'react';
import {
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Barcode,
  Calendar,
  User,
  PlusCircle,
  FileText,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function LibrarianCirculationDesk() {
  const { loans, books, users, returnBook, borrowBook, fineRatePerDay } = useLibrary();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'overdue' | 'returned'
  const [searchQuery, setSearchQuery] = useState('');

  // Desk Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPatronId, setSelectedPatronId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedCopyId, setSelectedCopyId] = useState('');

  // Process Return Modal State
  const [returnModalLoan, setReturnModalLoan] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Good');
  const [returnNotes, setReturnNotes] = useState('');

  // Filtered loans list
  const filteredLoans = loans.filter(loan => {
    // Tab filter
    if (activeFilter === 'active' && loan.status !== 'active') return false;
    if (activeFilter === 'overdue' && loan.status !== 'overdue') return false;
    if (activeFilter === 'returned' && loan.status !== 'returned') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = loan.bookTitle?.toLowerCase().includes(q);
      const matchPatron = loan.userName?.toLowerCase().includes(q) || loan.userEmail?.toLowerCase().includes(q);
      const matchBarcode = loan.copyBarcode?.toLowerCase().includes(q);
      if (!matchTitle && !matchPatron && !matchBarcode) return false;
    }
    return true;
  });

  // Calculate stats
  const activeCount = loans.filter(l => l.status === 'active').length;
  const overdueCount = loans.filter(l => l.status === 'overdue').length;
  const returnedCount = loans.filter(l => l.status === 'returned').length;

  // For Desk Checkout: Patrons and available books
  const patronMembers = users.filter(u => u.role === 'member' && u.status === 'active');
  const availableBooks = books.filter(b => (b.copies || []).some(cp => cp.status === 'available'));
  const currentSelectedBook = books.find(b => b.id === selectedBookId);
  const availableCopiesForSelectedBook = currentSelectedBook
    ? (currentSelectedBook.copies || []).filter(cp => cp.status === 'available')
    : [];

  const handleDeskCheckout = (e) => {
    e.preventDefault();
    if (!selectedPatronId || !selectedBookId) return;

    borrowBook(selectedBookId, selectedCopyId || null, selectedPatronId);
    setShowCheckoutModal(false);
    setSelectedPatronId('');
    setSelectedBookId('');
    setSelectedCopyId('');
  };

  const handleConfirmReturn = () => {
    if (!returnModalLoan) return;
    returnBook(returnModalLoan.id, returnCondition, returnNotes);
    setReturnModalLoan(null);
    setReturnCondition('Good');
    setReturnNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">Circulation & Loan Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time checkouts, process book returns, and issue front-desk loans
          </p>
        </div>

        <button
          onClick={() => setShowCheckoutModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Desk Checkout</span>
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs scrollbar-none">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Loans ({(loans || []).length})
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'active'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Active ({activeCount})
            </button>
            <button
              onClick={() => setActiveFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'overdue'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Overdue ({overdueCount})
            </button>
            <button
              onClick={() => setActiveFilter('returned')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'returned'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Returned ({returnedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patron, title, barcode..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 sm:px-5 py-3.5">Book & Physical Copy</th>
                <th className="px-4 sm:px-5 py-3.5">Borrower (Patron)</th>
                <th className="px-4 sm:px-5 py-3.5">Timeline & Due Date</th>
                <th className="px-4 sm:px-5 py-3.5">Status & Fine</th>
                <th className="px-4 sm:px-5 py-3.5 text-right">Circulation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">No loan records match your search or filter</p>
                    <p className="text-[11px] mt-0.5">Try clearing filters or search query</p>
                  </td>
                </tr>
              ) : (
                filteredLoans.map(loan => {
                  const isOverdue = loan.status === 'overdue';
                  const isReturned = loan.status === 'returned';
                  const dueDateObj = new Date(loan.dueDate);
                  const isLate = !isReturned && new Date() > dueDateObj;

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition">
                      {/* Book & Barcode */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={loan.bookCover}
                            alt={loan.bookTitle}
                            className="w-10 h-14 rounded-md object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-900 leading-snug line-clamp-1">
                              {loan.bookTitle}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{loan.bookAuthor}</p>
                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-600 mt-1">
                              <Barcode className="w-3 h-3 text-slate-400" />
                              <span>{loan.copyBarcode}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Patron */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          {loan.userName}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{loan.userEmail}</p>
                      </td>

                      {/* Timeline */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <p className="text-slate-600 flex items-center gap-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 w-12">Issued:</span>
                            <span>{new Date(loan.borrowDate).toLocaleDateString()}</span>
                          </p>
                          <p className={`flex items-center gap-1 font-semibold ${
                            isOverdue || isLate ? 'text-rose-600' : 'text-slate-800'
                          }`}>
                            <span className="text-[10px] uppercase font-bold text-slate-400 w-12">Due:</span>
                            <span>{dueDateObj.toLocaleDateString()}</span>
                          </p>
                          {isReturned && (
                            <p className="text-emerald-700 font-medium flex items-center gap-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 w-12">Returned:</span>
                              <span>{new Date(loan.returnDate).toLocaleDateString()}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status & Fine */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isReturned
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverdue || isLate
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {isReturned ? 'Returned' : isOverdue || isLate ? 'Overdue' : 'Active'}
                          </span>

                          {(isOverdue || Number(loan.fineAmount) > 0) && (
                            <p className="text-[11px] font-bold text-rose-600">
                              Fine: ${Number(loan.fineAmount) > 0 ? (Number(loan.fineAmount) || 0).toFixed(2) : '5.00'}
                              {loan.finePaid ? ' (Settled)' : ' (Unpaid)'}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => setReturnModalLoan(loan)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 ml-auto"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Process Return</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Archived</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Front-Desk Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold">Issue Front-Desk Checkout</h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeskCheckout} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Registered Member / Patron *
                </label>
                <select
                  required
                  value={selectedPatronId}
                  onChange={(e) => setSelectedPatronId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Member --</option>
                  {patronMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.membershipId}) - {m.membershipTier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Book Title *
                </label>
                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => {
                    setSelectedBookId(e.target.value);
                    setSelectedCopyId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose In-Stock Book --</option>
                  {availableBooks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.copies.filter(c => c.status === 'available').length} available)
                    </option>
                  ))}
                </select>
              </div>

              {selectedBookId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Copy Barcode (Optional - auto picks first available)
                  </label>
                  <select
                    value={selectedCopyId}
                    onChange={(e) => setSelectedCopyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  >
                    <option value="">-- Auto-Assign Available Copy --</option>
                    {availableCopiesForSelectedBook.map(cp => (
                      <option key={cp.copyId} value={cp.copyId}>
                        {cp.barcode} ({cp.condition} condition)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
                <p><strong>Loan Policy:</strong> Standard 14-day checkout with up to 2 renewals. Late returns accrue ${fineRatePerDay.toFixed(2)}/day fine.</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm"
                >
                  Authorize Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Inspection Modal */}
      {returnModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold">Process Book Check-In</h3>
              <button
                onClick={() => setReturnModalLoan(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Title to Return</p>
                <p className="font-bold text-slate-900 text-sm">{returnModalLoan.bookTitle}</p>
                <p className="text-slate-500 font-mono text-[11px]">Barcode: {returnModalLoan.copyBarcode}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inspected Return Condition
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Mint">Mint (Pristine)</option>
                  <option value="Good">Good (Normal minor shelf wear)</option>
                  <option value="Worn">Worn (Noticeable crease / marks)</option>
                  <option value="Damaged">Damaged (Needs repair or rebinding)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Desk Notes (Optional)
                </label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Returned via drop-box, condition confirmed"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {new Date() > new Date(returnModalLoan.dueDate) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Overdue Notice
                  </p>
                  <p className="mt-0.5">
                    This book is past its due date. Checking it in will automatically compute the overdue fine at ${fineRatePerDay.toFixed(2)}/day and assign it to the patron's account.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnModalLoan(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm"
                >
                  Confirm Check-In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
