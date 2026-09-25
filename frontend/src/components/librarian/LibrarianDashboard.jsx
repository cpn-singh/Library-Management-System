import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  Edit,
  Trash2,
  Barcode,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Users,
  Activity,
  ChevronRight,
  Sparkles,
  MapPin,
  Calendar,
  Grid,
  List
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import AddEditBookModal from './AddEditBookModal';
import ManageCopiesModal from './ManageCopiesModal';
import LibrarianCirculationDesk from './LibrarianCirculationDesk';
import LibrarianFineManager from './LibrarianFineManager';
import LibrarianPatrons from './LibrarianPatrons';

export default function LibrarianDashboard() {
  const {
    currentUser,
    books,
    loans,
    fines,
    users,
    addBook,
    updateBook,
    deleteBook,
    activityLog
  } = useLibrary();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'circulation' | 'fines' | 'patrons' | 'audit'

  // Catalog search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [managingCopiesBook, setManagingCopiesBook] = useState(null);
  const [deleteConfirmBook, setDeleteConfirmBook] = useState(null);

  // Compute aggregated KPI numbers
  const totalTitles = (books || []).length;
  const totalPhysicalCopies = (books || []).reduce((sum, b) => sum + (b.copies?.length || 0), 0);
  const totalAvailableCopies = (books || []).reduce(
    (sum, b) => sum + (b.copies?.filter(c => c.status === 'available').length || 0),
    0
  );
  const activeLoansCount = (loans || []).filter(l => l.status === 'active').length;
  const overdueLoansCount = (loans || []).filter(l => l.status === 'overdue').length;
  const totalUnpaidFines = (fines || [])
    .filter(f => f.status === 'pending' || f.status === 'unpaid')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalPatrons = (users || []).filter(u => u.role === 'member').length;

  // Categories list
  const categories = ['All', ...new Set(books.map(b => b.category))];

  // Filtered books
  const filteredBooks = books.filter(book => {
    if (selectedCategory !== 'All' && book.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title?.toLowerCase().includes(q);
      const matchAuthor = book.author?.toLowerCase().includes(q);
      const matchIsbn = book.isbn?.toLowerCase().includes(q);
      const matchLocation = book.shelfLocation?.toLowerCase().includes(q);
      const matchCopies = (book.copies || []).some(cp => cp.barcode?.toLowerCase().includes(q));
      if (!matchTitle && !matchAuthor && !matchIsbn && !matchLocation && !matchCopies) return false;
    }
    return true;
  });

  const handleSaveBook = (bookData) => {
    if (editingBook) {
      updateBook(editingBook.id, bookData);
      setEditingBook(null);
    } else {
      addBook(bookData);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmBook) {
      deleteBook(deleteConfirmBook.id);
      setDeleteConfirmBook(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Hero Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Staff Command Center
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">| Athenaeum Main Branch</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mt-1.5">
                Librarian Administration
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Welcome, {currentUser?.name}. Manage bibliographic cataloging, physical copy inventories, circulation checkouts, and overdue fines.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setEditingBook(null);
                  setShowAddEditModal(true);
                }}
                className="w-full md:w-auto justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Catalog New Book</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-6 sm:mt-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Titles</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">{totalTitles}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Cataloged records</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Physical Copies</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">{totalPhysicalCopies}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5 truncate">{totalAvailableCopies} Available</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Loans</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">{activeLoansCount}</p>
              <p className="text-[10px] text-indigo-300 mt-0.5 truncate">In circulation</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-rose-300 font-semibold">Overdue Items</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-rose-400 mt-0.5">{overdueLoansCount}</p>
              <p className="text-[10px] text-rose-300/80 mt-0.5 truncate">Requires return</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">Unpaid Fines</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-amber-300 mt-0.5">${totalUnpaidFines.toFixed(2)}</p>
              <p className="text-[10px] text-amber-200/80 mt-0.5 truncate">Pending collection</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Patrons</p>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">{totalPatrons}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Registered readers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container & Sub-Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Catalog & Copies</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'catalog' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {books.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('circulation')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'circulation'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Circulation & Loans</span>
            {overdueLoansCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {overdueLoansCount} late
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fines')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'fines'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Fines & Revenue</span>
            {totalUnpaidFines > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                ${totalUnpaidFines.toFixed(0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('patrons')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'patrons'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Patrons</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'patrons' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalPatrons}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Stream</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="mt-6">
          {/* TAB 1: CATALOG & INVENTORY */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search catalog by title, author, ISBN, shelf location, or copy barcode..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                        viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                        viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Table View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Categories chips */}
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

              {/* GRID VIEW */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {filteredBooks.map(book => {
                    const copies = book.copies || [];
                    const availableCopies = copies.filter(c => c.status === 'available');
                    const isFullyBorrowed = availableCopies.length === 0;

                    return (
                      <div
                        key={book.id}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                      >
                        <div>
                          {/* Book Cover Container */}
                          <div className="relative h-48 bg-slate-100 overflow-hidden">
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
                                {book.category}
                              </span>
                            </div>

                            <div className="absolute top-2.5 right-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
                                isFullyBorrowed
                                  ? 'bg-rose-500/90 text-white'
                                  : 'bg-emerald-500/90 text-white'
                              }`}>
                                {availableCopies.length} of {copies.length} Available
                              </span>
                            </div>
                          </div>

                          {/* Book Details */}
                          <div className="p-4 space-y-2">
                            <h3 className="font-serif font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                              {book.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">by {book.author}</p>

                            <div className="space-y-1 pt-1 text-[11px] text-slate-500">
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

                        {/* Bottom Actions Bar */}
                        <div className="p-4 pt-0">
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                            {/* Manage Copies Button */}
                            <button
                              onClick={() => setManagingCopiesBook(book)}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1"
                              title="Manage individual barcodes and copy conditions"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              <span>{copies.length} Copies</span>
                            </button>

                            <div className="flex items-center gap-1">
                              {/* Edit Book */}
                              <button
                                onClick={() => {
                                  setEditingBook(book);
                                  setShowAddEditModal(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                                title="Edit Book Info"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Book */}
                              <button
                                onClick={() => setDeleteConfirmBook(book)}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                                title="Delete Book Title"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[620px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="px-4 sm:px-5 py-3.5">Title & Author</th>
                          <th className="px-4 sm:px-5 py-3.5">Genre & Location</th>
                          <th className="px-4 sm:px-5 py-3.5">ISBN</th>
                          <th className="px-4 sm:px-5 py-3.5">Physical Copies</th>
                          <th className="px-4 sm:px-5 py-3.5 text-right">Librarian Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBooks.map(book => {
                          const copies = book.copies || [];
                          const availableCopies = copies.filter(c => c.status === 'available');

                          return (
                            <tr key={book.id} className="hover:bg-slate-50/70 transition">
                              <td className="px-4 sm:px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    className="w-9 h-12 rounded object-cover border border-slate-200 shrink-0 bg-slate-100"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 line-clamp-1">{book.title}</p>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{book.author}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 sm:px-5 py-4">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {book.category}
                                </span>
                                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{book.shelfLocation}</span>
                                </p>
                              </td>

                              <td className="px-4 sm:px-5 py-4 font-mono text-slate-600">
                                {book.isbn}
                              </td>

                              <td className="px-4 sm:px-5 py-4">
                                <span className="font-bold text-slate-900">
                                  {availableCopies.length} / {copies.length} Available
                                </span>
                                <div className="flex gap-1 mt-1">
                                  {copies.slice(0, 3).map((cp, idx) => (
                                    <span
                                      key={idx}
                                      className={`w-2 h-2 rounded-full ${
                                        cp.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'
                                      }`}
                                      title={`${cp.barcode} (${cp.status})`}
                                    />
                                  ))}
                                  {copies.length > 3 && (
                                    <span className="text-[9px] text-slate-400">+{copies.length - 3}</span>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 sm:px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                                  <button
                                    onClick={() => setManagingCopiesBook(book)}
                                    className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition flex items-center gap-1"
                                  >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>Copies</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setEditingBook(book);
                                      setShowAddEditModal(true);
                                    }}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                                    title="Edit Book"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => setDeleteConfirmBook(book)}
                                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                                    title="Delete Book"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CIRCULATION & LOANS */}
          {activeTab === 'circulation' && <LibrarianCirculationDesk />}

          {/* TAB 3: FINE & REVENUE MANAGER */}
          {activeTab === 'fines' && <LibrarianFineManager />}

          {/* TAB 4: PATRON DIRECTORY */}
          {activeTab === 'patrons' && <LibrarianPatrons />}

          {/* TAB 5: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">System Activity & Audit Stream</h3>
                  <p className="text-xs text-slate-500">Chronological transaction record of all library circulation events</p>
                </div>
                <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Live Sync
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {activityLog.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{log.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Actor: <strong>{log.user}</strong> • Type: <span className="font-mono">{log.type}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-11 sm:pl-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {showAddEditModal && (
        <AddEditBookModal
          isOpen={showAddEditModal}
          onClose={() => {
            setShowAddEditModal(false);
            setEditingBook(null);
          }}
          onSave={handleSaveBook}
          editingBook={editingBook}
        />
      )}

      {/* Manage Physical Copies Modal */}
      {managingCopiesBook && (
        <ManageCopiesModal
          book={books.find(b => b.id === managingCopiesBook.id) || managingCopiesBook}
          isOpen={!!managingCopiesBook}
          onClose={() => setManagingCopiesBook(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 text-xs">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Remove Book Title</h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to completely purge <strong>"{deleteConfirmBook.title}"</strong> and all its{' '}
              <strong>{deleteConfirmBook.copies?.length || 0} physical copies</strong> from the catalog?
            </p>
            <p className="text-slate-400 mt-2 text-[11px]">
              Note: This action is prohibited if any copy is currently checked out to a patron.
            </p>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBook(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-sm"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
