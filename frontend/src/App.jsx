import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import Navbar from './components/common/Navbar';
import Toast from './components/common/Toast';
import AuthModal from './components/auth/AuthModal';
import LibrarianDashboard from './components/librarian/LibrarianDashboard';
import MemberDashboard from './components/member/MemberDashboard';
import { BookOpen, Sparkles, Shield, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ADMIN_URL } from './services/api';

function AppContent() {
  const { currentUser } = useLibrary();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Global Navigation Bar */}
      <Navbar onOpenAuth={(mode) => openAuth(mode || 'login')} />

      {/* Main View Area */}
      <main className="flex-1">
        {!currentUser ? (
          /* Landing Screen when signed out */
          <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 my-auto">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Library Management System
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                Welcome to <span className="text-indigo-600">ATHENAEUM</span>
              </h1>

              <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
                An integrated digital and physical library platform with dedicated portals for patrons and library staff.
              </p>
            </div>

            {/* Portal Actions Card */}
            <div className="w-full max-w-2xl bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5 sm:space-y-6">
              <div className="text-left">
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">Choose Your Access Portal</h3>
                <p className="text-xs text-slate-500">Sign in to your library account or register as a new member</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-left">
                {/* Member Registration */}
                <button
                  onClick={() => openAuth('register')}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50 transition flex flex-col justify-between group shadow-sm text-left"
                >
                  <div className="space-y-2">
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                      <User className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">New Reader? Register Here</h4>
                    <p className="text-xs text-slate-500">
                      Create your patron account in seconds to browse books and borrow from the library.
                    </p>
                  </div>
                  <div className="pt-3 sm:pt-4 flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform gap-1">
                    <span>Register as Member</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Sign In */}
                <button
                  onClick={() => openAuth('login')}
                  className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-slate-800 bg-white hover:bg-slate-50 transition flex flex-col justify-between group shadow-sm text-left"
                >
                  <div className="space-y-2">
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">Existing Member or Staff</h4>
                    <p className="text-xs text-slate-500">
                      Sign in with your email/username and password to access your dashboard.
                    </p>
                  </div>
                  <div className="pt-3 sm:pt-4 flex items-center text-xs font-bold text-slate-900 group-hover:translate-x-1 transition-transform gap-1">
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Django Admin Portal Note for Superuser */}
              <div className="pt-4 sm:pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs bg-slate-50 -mx-5 sm:-mx-8 -mb-5 sm:-mb-8 p-4 sm:p-5 rounded-b-3xl">
                <div className="flex items-center gap-2.5 text-left">
                  <Shield className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block">Admin Portal:</span>
                    <span className="text-slate-500 text-[11px]">Admin can create & assign Librarian staff roles in the Admin portal.</span>
                  </div>
                </div>
                <a
                  href={ADMIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center justify-center gap-1.5 shrink-0 text-center"
                >
                  <span>Open Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ) : currentUser.role === 'librarian' ? (

          /* Librarian Dashboard */
          <LibrarianDashboard />
        ) : (
          /* Member / Patron Dashboard */
          <MemberDashboard />
        )}
      </main>

      {/* Global Toast Notifications */}
      <Toast />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-serif font-bold text-slate-800">ATHENAEUM</span>
            <span>— Library Management System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Vite + React</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Django REST Backend</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
}
