import React, { useState } from 'react';
import {
  DollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  Receipt,
  RotateCcw,
  Sparkles,
  Calendar,
  User,
  BookOpen,
  Filter,
  Printer
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function LibrarianFineManager() {
  const { fines, payFine, waiveFine } = useLibrary();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'paid' | 'waived'
  const [searchQuery, setSearchQuery] = useState('');

  // Collect Modal
  const [payingFine, setPayingFine] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  // Waive Modal
  const [waivingFine, setWaivingFine] = useState(null);
  const [waiveReason, setWaiveReason] = useState('First-time patron courtesy waiver');

  // Receipt Modal
  const [receiptFine, setReceiptFine] = useState(null);

  // Financial aggregates
  const totalPending = (fines || [])
    .filter(f => f.status === 'pending' || f.status === 'unpaid')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  const totalCollected = (fines || [])
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  const totalWaived = (fines || [])
    .filter(f => f.status === 'waived')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  // Filtered fines
  const filteredFines = fines.filter(f => {
    if (activeFilter === 'pending' && f.status !== 'pending') return false;
    if (activeFilter === 'paid' && f.status !== 'paid') return false;
    if (activeFilter === 'waived' && f.status !== 'waived') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPatron = f.userName?.toLowerCase().includes(q) || f.userEmail?.toLowerCase().includes(q);
      const matchBook = f.bookTitle?.toLowerCase().includes(q);
      const matchReason = f.reason?.toLowerCase().includes(q);
      if (!matchPatron && !matchBook && !matchReason) return false;
    }
    return true;
  });

  const handleConfirmPayment = () => {
    if (!payingFine) return;
    payFine(payingFine.id, paymentMethod);
    setReceiptFine({ ...payingFine, status: 'paid', paymentMethod, datePaid: new Date().toISOString() });
    setPayingFine(null);
  };

  const handleConfirmWaive = () => {
    if (!waivingFine) return;
    waiveFine(waivingFine.id, waiveReason);
    setWaivingFine(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-slate-900">Fine & Fee Management</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Collect late return fees, assess damage charges, and process courtesy waivers
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Outstanding Unpaid</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="font-serif text-3xl font-bold text-amber-900 mt-2">${totalPending.toFixed(2)}</p>
          <p className="text-[11px] text-amber-700/80 mt-1">
            {fines.filter(f => f.status === 'pending').length} pending transaction(s)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Revenue Collected</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <p className="font-serif text-3xl font-bold text-emerald-900 mt-2">${totalCollected.toFixed(2)}</p>
          <p className="text-[11px] text-emerald-700/80 mt-1">
            Deposited into library operating fund
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Waived Discretion</span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <RotateCcw className="w-5 h-5" />
            </span>
          </div>
          <p className="font-serif text-3xl font-bold text-slate-800 mt-2">${totalWaived.toFixed(2)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Authorized by library administration
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Records ({fines.length})
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Pending ({fines.filter(f => f.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveFilter('paid')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Collected ({fines.filter(f => f.status === 'paid').length})
            </button>
            <button
              onClick={() => setActiveFilter('waived')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 shrink-0 ${
                activeFilter === 'waived'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Waived ({fines.filter(f => f.status === 'waived').length})
            </button>
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patron, title, reason..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Fines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Patron / Member</th>
                <th className="px-5 py-3.5">Book Title & Reason</th>
                <th className="px-5 py-3.5">Fine Amount</th>
                <th className="px-5 py-3.5">Status & Dates</th>
                <th className="px-5 py-3.5 text-right">Librarian Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">No fines found matching your criteria</p>
                    <p className="text-[11px] mt-0.5">Everything is in good financial standing</p>
                  </td>
                </tr>
              ) : (
                filteredFines.map(fine => {
                  const isPending = fine.status === 'pending';
                  const isPaid = fine.status === 'paid';
                  const isWaived = fine.status === 'waived';

                  return (
                    <tr key={fine.id} className="hover:bg-slate-50/70 transition">
                      {/* Patron */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">{fine.userName}</p>
                            <p className="text-[11px] text-slate-500">{fine.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Book & Reason */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 line-clamp-1">{fine.bookTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{fine.reason}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="font-mono text-sm font-bold text-slate-900">
                          ${(Number(fine.amount) || 0).toFixed(2)}
                        </p>
                        {fine.daysOverdue && (
                          <span className="text-[10px] text-slate-400">
                            ({fine.daysOverdue} days @ ${(Number(fine.ratePerDay) || 0.50).toFixed(2)}/day)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : isWaived
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {fine.status}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Issued: {new Date(fine.dateIssued).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <>
                              <button
                                onClick={() => setPayingFine(fine)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                              >
                                Collect Fine
                              </button>
                              <button
                                onClick={() => setWaivingFine(fine)}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
                              >
                                Waive
                              </button>
                            </>
                          )}

                          {isPaid && (
                            <button
                              onClick={() => setReceiptFine(fine)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"
                            >
                              <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Receipt</span>
                            </button>
                          )}

                          {isWaived && (
                            <span className="text-slate-400 italic text-[11px]">
                              Waived: {fine.waivedReason || 'Courtesy'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Fine Modal */}
      {payingFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold">Collect Fine Payment</h3>
              <button
                onClick={() => setPayingFine(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-800 font-semibold">Total Fee Due:</span>
                  <span className="font-serif text-2xl font-bold text-amber-900 font-mono">
                    ${(Number(payingFine.amount) || 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] mt-2 text-amber-800">
                  Patron: <strong>{payingFine.userName}</strong> ({payingFine.userEmail})
                </p>
                <p className="text-[11px] text-amber-700">Book: {payingFine.bookTitle}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Cash">Cash at Circulation Desk</option>
                  <option value="Student / Faculty Card">Student / Faculty Account</option>
                  <option value="Online Portal">Online Portal</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingFine(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  Record Payment Received
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waive Fine Modal */}
      {waivingFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold">Waive Outstanding Fine</h3>
              <button
                onClick={() => setWaivingFine(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                You are about to waive the <strong>${(Number(waivingFine.amount) || 0).toFixed(2)}</strong> fee for{' '}
                <strong>{waivingFine.userName}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Waiver Justification *
                </label>
                <select
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="First-time patron courtesy waiver">First-time patron courtesy waiver</option>
                  <option value="Medical / Emergency circumstance">Medical / Emergency circumstance</option>
                  <option value="Cataloging or system discrepancy">Cataloging or system discrepancy</option>
                  <option value="Special academic research allowance">Special academic research allowance</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWaivingFine(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWaive}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm"
                >
                  Confirm Fee Waiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {receiptFine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 text-xs">
            <div className="p-6 space-y-4">
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-200 pb-4">
                <p className="font-serif text-lg font-bold text-slate-900">ATHENAEUM LIBRARY</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Circulation Fee Receipt</p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">TXN: #REC-{String(receiptFine.id).slice(-6).toUpperCase()}</p>
              </div>

              {/* Receipt Details */}
              <div className="space-y-2 py-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Paid:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(receiptFine.datePaid || new Date()).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patron Name:</span>
                  <span className="font-semibold text-slate-800">{receiptFine.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Item Title:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                    {receiptFine.bookTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold text-slate-800">{receiptFine.paymentMethod || 'Credit Card'}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-sm">
                  <span className="font-bold text-slate-900">Total Paid:</span>
                  <span className="font-bold text-emerald-600 font-mono">${(Number(receiptFine.amount) || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Barcode */}
              <div className="text-center pt-2 border-t border-dashed border-slate-200">
                <div className="h-8 flex items-center justify-center gap-1 mx-auto max-w-[180px]">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full bg-slate-900"
                      style={{ width: i % 3 === 0 ? '3px' : '1.5px' }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Thank you for supporting your library!</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
                <button
                  onClick={() => setReceiptFine(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
