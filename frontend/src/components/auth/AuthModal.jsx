import React, { useState } from 'react';
import {
  BookOpen,
  User,
  Mail,
  Lock,
  Phone,
  Shield,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useLibrary();

  const [isRegisterMode, setIsRegisterMode] = useState(initialMode === 'register');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [membershipTier, setMembershipTier] = useState('Standard Reader');
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    setIsRegisterMode(initialMode === 'register');
    setErrorMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!email.trim()) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      const success = await register({
        name,
        email,
        password,
        role: 'member',
        phone,
        membershipTier
      });

      if (success && onClose) {
        onClose();
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }

      const success = await login(email, password);
      if (success && onClose) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-5 right-3 sm:right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition z-10"
        >
          ✕
        </button>

        <div className="p-5 sm:p-8 overflow-y-auto flex-1">
          <div className="text-center mb-5 sm:mb-6">
            <div className="inline-flex p-2.5 sm:p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-2 sm:3 shadow-inner">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">
              {isRegisterMode ? 'Join Alexandria Library' : 'Welcome to Alexandria'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRegisterMode
                ? 'Create your member account to borrow books & track loans'
                : 'Sign in to access your library dashboard'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <>
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                  <User className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-indigo-950">Library Patron Registration</p>
                    <p className="text-indigo-700/80 text-[11px] mt-0.5">
                      Register your member library account to search and borrow books.
                      Staff & librarian accounts are configured in the <span className="font-semibold">Django Admin Portal</span>.
                    </p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRegisterMode ? "name@example.com" : "admin or name@example.com"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <>
                {/* Phone & Tier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Membership Tier
                    </label>
                    <select
                      value={membershipTier}
                      onChange={(e) => setMembershipTier(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                    >
                      <option value="Standard Reader">Standard Reader (5 books)</option>
                      <option value="Scholar Patron">Scholar Patron (10 books)</option>
                      <option value="Research Fellow">Research Fellow (Unlimited)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 mt-2"
            >
              <span>{isRegisterMode ? 'Complete Registration' : 'Authenticate & Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer toggle note */}
          <div className="mt-6 text-center text-xs text-slate-500">
            {isRegisterMode ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <div className="space-y-1">
                <p>
                  Need a library card?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Register as Member
                  </button>
                </p>
                <p className="text-[11px] text-slate-400">
                  Librarian / Staff: Sign in above or access the{' '}
                  <a
                    href="http://127.0.0.1:8000/admin/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-600 underline hover:text-indigo-600"
                  >
                    Django Admin Portal
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

