import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Barcode,
  MapPin,
  Calendar,
  CreditCard,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award,
  DollarSign,
  Receipt,
  Heart,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLibrary } from '../../context/LibraryContext';
import DigitalCardModal from '../common/DigitalCardModal';

export default function MemberDashboard() {
  const {
    currentUser,
    books,
    loans,
    fines,
    borrowBook,
    returnBook,
    renewLoan,
    payFine,
    fineRatePerDay
  } = useLibrary();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'loans' | 'history' | 'fines'

  // Catalog search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Book Detail Modal
  const [selectedBookForDetails, setSelectedBookForDetails] = useState(null);

  // Return Book Confirmation Modal
  const [returningLoan, setReturningLoan] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Good');
  const [returnNotes, setReturnNotes] = useState('');

  // Pay Fine Online Modal
  const [payingFineModal, setPayingFineModal] = useState(null);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Digital card modal
  const [showCardModal, setShowCardModal] = useState(false);

  // Patron-specific loans and fines
  const myActiveLoans = (loans || []).filter(
    l => l.userId === currentUser?.id && l.status !== 'returned'
  );
  const myOverdueLoans = myActiveLoans.filter(l => {
    return l.status === 'overdue' || (l.dueDate && new Date() > new Date(l.dueDate));
  });
  const myPastReturnedLoans = (loans || []).filter(
    l => l.userId === currentUser?.id && l.status === 'returned'
  );
  const myFines = (fines || []).filter(f => f.userId === currentUser?.id);
  const myPendingFines = myFines.filter(f => f.status === 'pending' || f.status === 'unpaid');
  const totalMyPendingFines = myPendingFines.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  // Categories list
  const categories = ['All', ...new Set(books.map(b => b.category))];

  // Filtered books
  const filteredBooks = books.filter(book => {
    if (selectedCategory !== 'All' && book.category !== selectedCategory) return false;

    const availableCount = (book.copies || []).filter(c => c.status === 'available').length;
    if (onlyAvailable && availableCount === 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title?.toLowerCase().includes(q);
      const matchAuthor = book.author?.toLowerCase().includes(q);
      const matchCategory = book.category?.toLowerCase().includes(q);
      const matchIsbn = book.isbn?.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchCategory && !matchIsbn) return false;
    }
    return true;
  });

  // Check if a book is already borrowed by current user
  const isBookAlreadyBorrowedByMe = (bookId) => {
    return myActiveLoans.some(l => l.bookId === bookId);
  };

  // Borrow handler
  const handleBorrow = (bookId) => {
    const success = borrowBook(bookId);
    if (success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      setSelectedBookForDetails(null);
    }
  };

  // Return handler
  const handleConfirmReturn = () => {
    if (!returningLoan) return;

    const result = returnBook(returningLoan.id, returnCondition, returnNotes);
    setReturningLoan(null);
    setReturnCondition('Good');
    setReturnNotes('');

    // Launch confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Pay Fine Online Handler
  const handleConfirmPayFine = (e) => {
    e.preventDefault();
    if (!payingFineModal) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      payFine(payingFineModal.id, 'Online Visa •••• 4242');
      setIsProcessingPayment(false);
      setPayingFineModal(null);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    }, 700);
  };

  // Days left calculation
  const getDaysLeft = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Patron Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-indigo-400/40 shadow-lg bg-slate-800 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 shrink-0">
                    <Award className="w-3 h-3" />
                    {currentUser?.membershipTier || 'Standard Patron'}
                  </span>
                  <span className="text-xs text-indigo-200">
                    Card #{currentUser?.membershipId}
                  </span>
                </div>
                <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                  Welcome back, {currentUser?.name}
                </h1>
                <p className="text-xs sm:text-sm text-indigo-200/80 mt-0.5">
                  Explore thousands of books, borrow available copies, manage active loans, and track return due dates.
                </p>
              </div>
            </div>

            {/* Quick Digital Card Access */}
            <div className="flex items-center gap-2.5 self-stretch sm:self-start md:self-auto">
              <button
                onClick={() => setShowCardModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>My Digital Library Card</span>
              </button>
            </div>
          </div>

          {/* Patron KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-6 sm:mt-7">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">Current Loans</span>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">
                {myActiveLoans.length} <span className="text-xs font-sans text-slate-400 font-normal">/ 5 allowed</span>
              </p>
              <p className="text-[10px] text-emerald-400 mt-0.5 truncate">
                {5 - myActiveLoans.length} slot(s) available
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300">Overdue Status</span>
              <p className={`font-serif text-xl sm:text-2xl font-bold mt-0.5 ${myOverdueLoans.length > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {myOverdueLoans.length === 0 ? '0 Overdue' : `${myOverdueLoans.length} Overdue!`}
              </p>
              <p className="text-[10px] text-slate-300 mt-0.5 truncate">
                {myOverdueLoans.length === 0 ? 'All loans on schedule' : 'Action required'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">Fine Balance</span>
              <p className={`font-serif text-xl sm:text-2xl font-bold mt-0.5 ${totalMyPendingFines > 0 ? 'text-amber-300' : 'text-white'}`}>
                ${(Number(totalMyPendingFines) || 0).toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-300 mt-0.5 truncate">
                {totalMyPendingFines > 0 ? 'Click Fines tab to pay' : 'Account in good standing'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300">Reading Record</span>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">{myPastReturnedLoans.length}</p>
              <p className="text-[10px] text-indigo-300 mt-0.5 truncate">Books returned</p>
            </div>
          </div>

          {/* Overdue Warning Alert Banner if overdue loans exist */}
          {myOverdueLoans.length > 0 && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  <strong>Overdue Alert:</strong> You have {myOverdueLoans.length} book(s) past the due date. Please return them to prevent additional ${(Number(fineRatePerDay) || 0.50).toFixed(2)}/day fees.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('loans')}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition text-center"
              >
                View & Return
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container & Sub-Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'browse'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Catalog</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'browse' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {books.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('loans')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'loans'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Borrowed Books</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              myOverdueLoans.length > 0
                ? 'bg-rose-500 text-white animate-pulse'
                : activeTab === 'loans'
                ? 'bg-white/20 text-white'
                : 'bg-indigo-100 text-indigo-700'
            }`}>
              {myActiveLoans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reading History</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {myPastReturnedLoans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fines')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'fines'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Fines & Fees</span>
            {totalMyPendingFines > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                ${(Number(totalMyPendingFines) || 0).toFixed(2)}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="mt-6">
          {/* TAB 1: BROWSE CATALOG */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Search & Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, author, genre, or keyword..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>

                  {/* Available only checkbox */}
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Available Copies Only</span>
                  </label>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1 pr-1">
                    <Filter className="w-3.5 h-3.5" />
                    Category:
                  </span>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full transition shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Book Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map(book => {
                  const copies = book.copies || [];
                  const availableCopies = copies.filter(c => c.status === 'available');
                  const hasAvailable = availableCopies.length > 0;
                  const alreadyBorrowed = isBookAlreadyBorrowedByMe(book.id);

                  return (
                    <div
                      key={book.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition duration-200 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Cover Image Container */}
                        <div
                          onClick={() => setSelectedBookForDetails(book)}
                          className="relative h-56 bg-slate-100 overflow-hidden cursor-pointer"
                        >
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                            <span className="text-white text-xs font-semibold flex items-center gap-1">
                              <span>Read Synopsis</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                              {book.category}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-xs ${
                              hasAvailable
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 text-white'
                            }`}>
                              {hasAvailable ? `${availableCopies.length} in stock` : 'Checked Out'}
                            </span>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="p-4 space-y-2">
                          <h3
                            onClick={() => setSelectedBookForDetails(book)}
                            className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-2 cursor-pointer hover:text-indigo-600 transition"
                          >
                            {book.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">by {book.author}</p>

                          <p className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed">
                            {book.description}
                          </p>

                          <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                            <div className="flex items-center gap-1.5 font-mono">
                              <Barcode className="w-3.5 h-3.5 text-slate-400" />
                              <span>ISBN: {book.isbn}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{book.shelfLocation}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 pt-0">
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBookForDetails(book)}
                            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
                          >
                            Details
                          </button>

                          {alreadyBorrowed ? (
                            <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              In Your Loans
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBorrow(book.id)}
                              disabled={!hasAvailable}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                                hasAvailable
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{hasAvailable ? 'Borrow Book' : 'Waitlist Only'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MY BORROWED BOOKS (ACTIVE LOANS) */}
          {activeTab === 'loans' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Active Borrowed Books</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your current loans, check remaining days, request renewals, or return books
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {myActiveLoans.length} of 5 Active Loans
                </span>
              </div>

              {myActiveLoans.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-800">You currently have no borrowed books</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Browse our expansive catalog to find interesting books in computer science, science fiction, philosophy, and history!
                  </p>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
                  >
                    <span>Browse Library Catalog</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  {myActiveLoans.map(loan => {
                    const daysLeft = getDaysLeft(loan.dueDate);
                    const isOverdue = daysLeft < 0;
                    const isDueSoon = daysLeft >= 0 && daysLeft <= 2;

                    return (
                      <div
                        key={loan.id}
                        className={`bg-white rounded-3xl border overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between ${
                          isOverdue
                            ? 'border-rose-300 ring-2 ring-rose-400/20'
                            : isDueSoon
                            ? 'border-amber-300 ring-2 ring-amber-400/20'
                            : 'border-slate-200'
                        }`}
                      >
                        <div>
                          {/* Countdown Banner */}
                          <div className={`px-4 sm:px-5 py-2.5 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-800 border-b border-rose-200'
                              : isDueSoon
                              ? 'bg-amber-50 text-amber-900 border-b border-amber-200'
                              : 'bg-indigo-50 text-indigo-900 border-b border-indigo-100'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {isOverdue ? (
                                <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce shrink-0" />
                              ) : (
                                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                              )}
                              <span>
                                {isOverdue
                                  ? `OVERDUE BY ${Math.abs(daysLeft)} DAY(S)!`
                                  : isDueSoon
                                  ? `Due in ${daysLeft === 0 ? 'today!' : `${daysLeft} day(s)`}`
                                  : `Due in ${daysLeft} days`}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] text-slate-500">
                              Due: {new Date(loan.dueDate).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Loan Content */}
                          <div className="p-4 sm:p-5 flex gap-3.5 sm:gap-4">
                            <img
                              src={loan.bookCover}
                              alt={loan.bookTitle}
                              className="w-16 sm:w-20 h-24 sm:h-28 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0 bg-slate-100"
                            />
                            <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
                              <h3 className="font-serif font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                                {loan.bookTitle}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium truncate">by {loan.bookAuthor}</p>

                              <div className="pt-1.5 sm:pt-2 text-[11px] text-slate-500 space-y-1">
                                <p className="font-mono flex items-center gap-1">
                                  <Barcode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">Barcode: <strong>{loan.copyBarcode}</strong></span>
                                </p>
                                <p className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">Borrowed: {new Date(loan.borrowDate).toLocaleDateString()}</span>
                                </p>
                                {loan.renewalsLeft !== undefined && (
                                  <p className="text-[10px] text-slate-400">
                                    Renewals available: <strong>{loan.renewalsLeft}</strong>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Loan Action Buttons */}
                        <div className="p-4 sm:p-5 pt-0">
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            {/* Renew Button */}
                            <button
                              type="button"
                              onClick={() => renewLoan(loan.id)}
                              disabled={isOverdue || (loan.renewalsLeft !== undefined && loan.renewalsLeft <= 0)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                                isOverdue || loan.renewalsLeft <= 0
                                  ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                              title={isOverdue ? 'Cannot renew overdue book' : 'Extend due date by 7 days'}
                            >
                              Renew (+7d)
                            </button>

                            {/* Return Book Button */}
                            <button
                              type="button"
                              onClick={() => setReturningLoan(loan)}
                              className="px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Return Book</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: READING HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">Your Reading History</h3>
                <p className="text-xs text-slate-500">A permanent log of all books you've checked out and returned</p>
              </div>

              {myPastReturnedLoans.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-slate-600">No past returned books yet</p>
                  <p className="text-[11px] mt-0.5">When you borrow and return books, they will be archived here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPastReturnedLoans.map(loan => (
                    <div
                      key={loan.id}
                      className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        <img
                          src={loan.bookCover}
                          alt={loan.bookTitle}
                          className="w-10 h-14 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm line-clamp-1">{loan.bookTitle}</p>
                          <p className="text-[11px] text-slate-500 truncate">{loan.bookAuthor}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span className="font-mono">Barcode: {loan.copyBarcode}</span>
                            <span>•</span>
                            <span>Returned: {new Date(loan.returnDate || new Date()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Returned
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY FINES & FEES */}
          {activeTab === 'fines' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900">Fine & Fee Account Balance</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review and settle any late return charges or library service fees
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
                  <span className="font-serif text-2xl font-bold text-amber-700 font-mono">
                    ${(Number(totalMyPendingFines) || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {myFines.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 shadow-2xs space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-800">No Fines or Fees on Record</h3>
                  <p className="text-xs text-slate-500">
                    Your library account is in pristine standing! Thank you for returning books on time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myFines.map(fine => {
                    const isPending = fine.status === 'pending' || fine.status === 'unpaid';
                    const isPaid = fine.status === 'paid';
                    const isWaived = fine.status === 'waived';

                    return (
                      <div
                        key={fine.id}
                        className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          isPending
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{fine.bookTitle}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : isWaived
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-amber-200 text-amber-900 font-extrabold animate-pulse'
                            }`}>
                              {fine.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">{fine.reason}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Issued: {new Date(fine.dateIssued).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <span className="font-mono text-base font-bold text-slate-900">
                            ${(Number(fine.amount) || 0).toFixed(2)}
                          </span>

                          {isPending && (
                            <button
                              onClick={() => setPayingFineModal(fine)}
                              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Online Now</span>
                            </button>
                          )}

                          {isPaid && (
                            <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Paid Online
                            </span>
                          )}

                          {isWaived && (
                            <span className="text-slate-400 text-xs italic">
                              Waived by Librarian
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Book Detail & Borrow Modal */}
      {selectedBookForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 my-auto sm:my-8">
            <div className="relative h-48 sm:h-60 bg-slate-900 shrink-0">
              <img
                src={selectedBookForDetails.coverImage}
                alt={selectedBookForDetails.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent p-4 sm:p-6 flex flex-col justify-end text-white">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md self-start border border-white/20 mb-2">
                  {selectedBookForDetails.category}
                </span>
                <h3 className="font-serif text-lg sm:text-2xl font-bold leading-tight line-clamp-2">
                  {selectedBookForDetails.title}
                </h3>
                <p className="text-xs text-indigo-200 mt-1">by {selectedBookForDetails.author}</p>
              </div>
              <button
                onClick={() => setSelectedBookForDetails(null)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white/80 hover:text-white p-2 rounded-xl bg-black/40 backdrop-blur-md transition"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                  Synopsis & Overview
                </h4>
                <p className="text-slate-700 leading-relaxed mt-1 text-xs sm:text-sm">
                  {selectedBookForDetails.description}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">ISBN-13</span>
                  <p className="font-mono text-slate-800 mt-0.5 truncate">{selectedBookForDetails.isbn}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Published</span>
                  <p className="text-slate-800 mt-0.5">{selectedBookForDetails.publishedYear}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Publisher</span>
                  <p className="text-slate-800 mt-0.5 truncate">{selectedBookForDetails.publisher}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Shelf Callout</span>
                  <p className="text-slate-800 mt-0.5 truncate">{selectedBookForDetails.shelfLocation}</p>
                </div>
              </div>

              {/* Physical Copies Availability */}
              <div>
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-400 mb-2">
                  Physical Copies Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedBookForDetails.copies || []).map(cp => (
                    <div
                      key={cp.copyId}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-[11px]"
                    >
                      <div className="font-mono">
                        <span className="text-slate-900 font-semibold">{cp.barcode}</span>
                        <span className="text-slate-400 block text-[10px] font-sans">
                          Condition: {cp.condition}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        cp.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Borrow CTA */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-slate-500 text-[11px]">
                  Loan duration: 14 days • Free renewals available
                </span>

                {isBookAlreadyBorrowedByMe(selectedBookForDetails.id) ? (
                  <span className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Currently in your borrowed list
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBorrow(selectedBookForDetails.id)}
                    disabled={(selectedBookForDetails.copies || []).filter(c => c.status === 'available').length === 0}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold text-xs transition shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Confirm Borrow (14 Days)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Book Confirmation Modal */}
      {returningLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 my-auto">
            <div className="bg-slate-900 px-4 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="font-serif text-base sm:text-lg font-bold">Return Book</h3>
              <button
                onClick={() => setReturningLoan(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="flex gap-3">
                <img
                  src={returningLoan.bookCover}
                  alt={returningLoan.bookTitle}
                  className="w-14 h-20 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                />
                <div>
                  <p className="font-bold text-slate-900 text-sm leading-snug">{returningLoan.bookTitle}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{returningLoan.bookAuthor}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-1">Barcode: {returningLoan.copyBarcode}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Book Condition Upon Return
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Mint">Mint (Like New)</option>
                  <option value="Good">Good (Satisfactory condition)</option>
                  <option value="Worn">Worn (Light wear)</option>
                  <option value="Damaged">Damaged (Needs repair)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Feedback / Return Note
                </label>
                <input
                  type="text"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Thoroughly enjoyed this book!"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {new Date() > new Date(returningLoan.dueDate) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <p className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    Late Return Notice
                  </p>
                  <p className="mt-0.5">
                    This book is overdue. An overdue fine of ${fineRatePerDay.toFixed(2)}/day will be automatically added to your fines balance upon return.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturningLoan(null)}
                  className="px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  className="px-5 py-2.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm text-center"
                >
                  Confirm & Check-In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Fine Online Simulator Modal */}
      {payingFineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100 my-auto text-xs">
            <div className="bg-slate-900 px-4 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="font-serif text-base sm:text-lg font-bold">Online Fee Settlement</h3>
              <button
                onClick={() => setPayingFineModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPayFine} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-indigo-700 font-semibold">Outstanding Fine</span>
                  <p className="font-bold text-slate-900 text-sm line-clamp-1">{payingFineModal.bookTitle}</p>
                </div>
                <span className="font-serif text-xl sm:text-2xl font-bold text-indigo-700 font-mono shrink-0">
                  ${(Number(payingFineModal.amount) || 0).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Number (Simulated)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiration</label>
                  <input
                    type="text"
                    defaultValue="12 / 28"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                  <input
                    type="text"
                    defaultValue="882"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingFineModal(null)}
                  className="px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-5 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm text-center"
                >
                  {isProcessingPayment ? 'Processing...' : `Pay $${(Number(payingFineModal.amount) || 0).toFixed(2)} Now`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Library Card Modal */}
      {showCardModal && (
        <DigitalCardModal
          user={currentUser}
          onClose={() => setShowCardModal(false)}
        />
      )}
    </div>
  );
}
