import React from 'react';
import { X, Award, ShieldCheck, Calendar, Hash, Phone, Mail, Sparkles } from 'lucide-react';

export default function DigitalCardModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 my-auto transform transition-all">
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-base sm:text-lg tracking-wide">Athenaeum Digital ID</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="relative rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white shadow-xl overflow-hidden border border-indigo-500/20">
            {/* Holographic Watermark Circle */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10 gap-2">
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-indigo-300 font-semibold">Public Library Network</p>
                <h4 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide mt-0.5 sm:mt-1">ATHENAEUM</h4>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {user.membershipTier || 'Standard Patron'}
              </span>
            </div>

            {/* User profile section */}
            <div className="flex items-center gap-3 sm:gap-4 mt-5 sm:mt-6 relative z-10">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-indigo-400/40 shadow-md bg-slate-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h5 className="text-base sm:text-lg font-bold text-white truncate">{user.name}</h5>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
                <p className="text-xs text-indigo-200 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Status: <span className="font-semibold text-emerald-400 capitalize">{user.status}</span>
                </p>
              </div>
            </div>

            {/* Card Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-5 sm:mt-6 pt-4 border-t border-white/10 text-xs relative z-10">
              <div>
                <p className="text-slate-400 uppercase tracking-wider text-[10px]">Patron Barcode / ID</p>
                <p className="font-mono text-xs sm:text-sm font-semibold text-amber-200 tracking-wider mt-0.5 truncate">{user.membershipId}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-wider text-[10px]">Member Since</p>
                <p className="font-medium text-slate-200 mt-0.5">{user.joinedDate || '2023-01-01'}</p>
              </div>
            </div>

            {/* Visual Simulated Barcode */}
            <div className="mt-5 sm:mt-6 bg-white p-2.5 sm:p-3 rounded-xl flex flex-col items-center">
              <div className="h-8 sm:h-10 w-full flex items-center justify-between gap-[2px] overflow-hidden px-1 sm:px-2">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-slate-900"
                    style={{
                      width: i % 5 === 0 ? '4px' : i % 3 === 0 ? '2px' : '1.5px',
                      opacity: (i * 7) % 2 === 0 ? 1 : 0.85
                    }}
                  />
                ))}
              </div>
              <p className="font-mono text-[10px] sm:text-[11px] text-slate-700 tracking-widest mt-1.5">
                *{user.membershipId}*
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-500">
            <span>Show this digital card at the circulation desk to checkout items.</span>
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition text-center shrink-0"
            >
              Print Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
