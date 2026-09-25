import React, { useState } from 'react';
import {
  BookOpen,
  User,
  LogOut,
  Sparkles,
  CreditCard,
  Shield,
  ChevronDown,
  Bell,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import DigitalCardModal from './DigitalCardModal';

export default function Navbar({ onOpenAuth }) {
  const {
    currentUser,
    logout,
    loans,
    fines,
  } = useLibrary();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute active notifications
  const userOverdueLoans = currentUser
    ? loans.filter(l => l.userId === currentUser.id && l.status === 'overdue')
    : [];

  const userPendingFines = currentUser
    ? (fines || []).filter(f => f.userId === currentUser.id && (f.status === 'pending' || f.status === 'unpaid'))
    : [];

  const totalUnpaidFines = userPendingFines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  const librarianOverdues = currentUser?.role === 'librarian'
    ? loans.filter(l => l.status === 'overdue')
    : [];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Athenaeum Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-xl tracking-tight text-slate-900">
                    ATHENAEUM
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 hidden md:block">
                  Integrated Library Management System
                </p>
              </div>
            </div>


            {/* Middle Nav - Librarian Admin Portal Link */}
            {currentUser?.role === 'librarian' && (
              <div className="hidden md:flex items-center">
                <a
                  href="http://127.0.0.1:8000/admin/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Django Admin (User Management)</span>
                </a>
              </div>
            )}

            {/* Right Nav Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {!currentUser ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 font-bold text-xs transition"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Digital Card Button (For Patrons) */}
                  {currentUser.role === 'member' && (
                    <button
                      onClick={() => setShowCardModal(true)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                      title="View Digital Library Card"
                    >
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span>Library Card</span>
                    </button>
                  )}

                  {/* Notification Center */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowProfileMenu(false);
                      }}
                      className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {(userOverdueLoans.length > 0 || userPendingFines.length > 0 || (currentUser.role === 'librarian' && librarianOverdues.length > 0)) && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                      )}
                    </button>

                    {showNotifications && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowNotifications(false)}
                        />
                        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in text-xs max-h-[80vh] overflow-y-auto">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                            <h4 className="font-semibold text-slate-900 text-sm">Notifications</h4>
                            <span className="text-[10px] text-slate-600">Real-time alerts</span>
                          </div>

                          {currentUser.role === 'member' ? (
                            <div className="space-y-2.5">
                              {userOverdueLoans.length > 0 ? (
                                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                                  <p className="font-semibold flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                    <span>Overdue Book Alert!</span>
                                  </p>
                                  <p className="mt-1 text-slate-600">
                                    You have {userOverdueLoans.length} overdue book(s). Please return them to avoid daily fines.
                                  </p>
                                </div>
                              ) : null}

                              {userPendingFines.length > 0 ? (
                                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                                  <p className="font-semibold">Unpaid Fine Balance</p>
                                  <p className="mt-0.5 text-slate-600">
                                    Outstanding balance: <strong className="text-amber-700">${totalUnpaidFines.toFixed(2)}</strong>. Please pay at your convenience.
                                  </p>
                                </div>
                              ) : null}

                              {userOverdueLoans.length === 0 && userPendingFines.length === 0 && (
                                <div className="py-4 text-center text-slate-600">
                                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                                  <p className="font-medium text-slate-700">All clear!</p>
                                  <p className="text-[11px] text-slate-600">No overdue items or outstanding fines on your account.</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                                <p className="font-semibold">Librarian Operations</p>
                                <p className="mt-0.5 text-slate-600">
                                  {librarianOverdues.length} item(s) are currently marked overdue in circulation.
                                </p>
                              </div>
                              <p className="text-[11px] text-slate-600 text-center pt-1">
                                Catalog synced with inventory database.
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowProfileMenu(!showProfileMenu);
                        setShowNotifications(false);
                      }}
                      className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                    >
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-slate-300 bg-slate-200"
                      />
                      <div className="text-left hidden md:block">
                        <p className="text-xs font-semibold text-slate-900 leading-tight">
                          {currentUser.name}
                        </p>
                        <p className="text-[10px] text-slate-600 capitalize flex items-center gap-1">
                          {currentUser.role === 'librarian' ? (
                            <span className="text-indigo-600 font-bold">Staff Admin</span>
                          ) : (
                            <span className="text-emerald-600 font-bold">Patron</span>
                          )}
                        </p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                    </button>

                    {showProfileMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowProfileMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-xs bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in text-xs">
                          <div className="px-4 py-2 border-b border-slate-100">
                            <p className="font-semibold text-slate-900">{currentUser.name}</p>
                            <p className="text-slate-600 text-[11px] truncate">{currentUser.email}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {currentUser.membershipId} • {currentUser.membershipTier}
                            </span>
                          </div>

                          {currentUser.role === 'member' && (
                            <button
                              onClick={() => {
                                setShowCardModal(true);
                                setShowProfileMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                            >
                              <CreditCard className="w-4 h-4 text-indigo-600" />
                              <span>View Digital Library Card</span>
                            </button>
                          )}

                          {currentUser.role === 'librarian' && (
                            <a
                              href="http://127.0.0.1:8000/admin/"
                              target="_blank"
                              rel="noreferrer"
                              className="w-full text-left px-4 py-2 text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 font-medium text-xs border-t border-slate-100"
                            >
                              <Shield className="w-4 h-4 text-indigo-600" />
                              <span>Admin Portal</span>
                            </a>
                          )}

                          <div className="border-t border-slate-100 pt-1">
                            <button
                              onClick={() => {
                                logout();
                                setShowProfileMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition font-semibold text-xs"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Digital Library Card Modal */}
      {showCardModal && (
        <DigitalCardModal
          user={currentUser}
          onClose={() => setShowCardModal(false)}
        />
      )}
    </>
  );
}
