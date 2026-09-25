import React, { useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  Award
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function LibrarianPatrons() {
  const { users, loans, fines, updateUserStatus } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatronForHistory, setSelectedPatronForHistory] = useState(null);

  // Filter only members
  const memberList = users.filter(u => u.role === 'member');

  const filteredMembers = memberList.filter(m => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchEmail = m.email?.toLowerCase().includes(q);
      const matchId = m.membershipId?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId) return false;
    }
    return true;
  });

  // Calculate patron-specific active loans & fines
  const getPatronStats = (userId) => {
    const activeLoans = (loans || []).filter(l => l.userId === userId && l.status !== 'returned');
    const overdueLoans = (loans || []).filter(l => l.userId === userId && l.status === 'overdue');
    const pendingFines = (fines || []).filter(f => f.userId === userId && (f.status === 'pending' || f.status === 'unpaid'));
    const totalFineAmount = pendingFines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    return {
      activeLoansCount: activeLoans.length,
      overdueLoansCount: overdueLoans.length,
      unpaidFineAmount: totalFineAmount
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">Patron & Member Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered patrons, account privileges, and individual circulation histories
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member by name, ID, email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(member => {
          const stats = getPatronStats(member.id);
          const isSuspended = member.status === 'suspended';

          return (
            <div
              key={member.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 transition shadow-2xs flex flex-col justify-between ${
                isSuspended ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div>
                {/* Top patron info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{member.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-[140px]">{member.email}</span>
                      </p>
                      <p className="font-mono text-[10px] text-amber-700 font-bold mt-0.5">
                        ID: {member.membershipId}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    isSuspended ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {member.status}
                  </span>
                </div>

                {/* Tier and contact */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Membership Tier:</span>
                    <span className="font-semibold text-indigo-700 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {member.membershipTier || 'Standard Reader'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Registered:</span>
                    <span>{member.joinedDate || '2023-01-01'}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Contact:</span>
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>

                {/* Circulation badges */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Loans</span>
                    <span className="font-bold text-slate-900 text-sm">{stats.activeLoansCount}</span>
                    {stats.overdueLoansCount > 0 && (
                      <span className="block text-[10px] font-bold text-rose-600">
                        ({stats.overdueLoansCount} Overdue!)
                      </span>
                    )}
                  </div>

                  <div className={`p-2 rounded-xl border ${
                    stats.unpaidFineAmount > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Unpaid Fines</span>
                    <span className={`font-mono font-bold text-sm ${stats.unpaidFineAmount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                      ${(Number(stats.unpaidFineAmount) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatronForHistory(member)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                >
                  Loan History
                </button>

                <button
                  type="button"
                  onClick={() => updateUserStatus(member.id, isSuspended ? 'active' : 'suspended')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSuspended
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  }`}
                >
                  {isSuspended ? 'Reactivate' : 'Suspend'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patron Loan History Drawer / Modal */}
      {selectedPatronForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            <div className="bg-slate-900 px-4 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold">Circulation Record</h3>
                <p className="text-xs text-indigo-200">
                  Patron: {selectedPatronForHistory.name} ({selectedPatronForHistory.membershipId})
                </p>
              </div>
              <button
                onClick={() => setSelectedPatronForHistory(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {loans.filter(l => l.userId === selectedPatronForHistory.id).length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-slate-600">No circulation history found for this patron.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {loans
                    .filter(l => l.userId === selectedPatronForHistory.id)
                    .map(loan => (
                      <div
                        key={loan.id}
                        className="p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={loan.bookCover}
                            alt={loan.bookTitle}
                            className="w-9 h-12 rounded object-cover border border-slate-200 bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{loan.bookTitle}</p>
                            <p className="text-[11px] text-slate-500 font-mono">Barcode: {loan.copyBarcode}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Issued: {new Date(loan.borrowDate).toLocaleDateString()} • Due: {new Date(loan.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <span className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          loan.status === 'returned'
                            ? 'bg-emerald-100 text-emerald-800'
                            : loan.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {loan.status}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedPatronForHistory(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
