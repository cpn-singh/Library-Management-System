import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authApi,
  booksApi,
  loansApi,
  finesApi,
  logsApi,
  getToken,
  setToken
} from '../services/api';
const LibraryContext = createContext(null);

const STORAGE_KEYS = {
  CURRENT_USER: 'athenaeum_current_user_v1'
};

const FINE_RATE_PER_DAY = 0.50;
const MAX_LOAN_DAYS = 14;
const MAX_BORROW_LIMIT = 5;

const normalizeFine = (f) => {
  if (!f) return null;
  return {
    ...f,
    id: f.id,
    loanId: f.loanId ?? f.loan_id ?? f.loan,
    userId: f.userId ?? f.user_id ?? f.user,
    userName: f.userName ?? f.user_name ?? 'Patron',
    userEmail: f.userEmail ?? f.user_email ?? '',
    bookTitle: f.bookTitle ?? f.book_title ?? 'Library Item',
    amount: Number(f.amount) || 0,
    daysOverdue: Number(f.daysOverdue ?? f.days_overdue) || 0,
    ratePerDay: Number(f.ratePerDay ?? f.rate_per_day) || FINE_RATE_PER_DAY,
    status: f.status || 'pending',
    dateIssued: f.dateIssued ?? f.date_issued ?? f.created_at ?? new Date().toISOString(),
    datePaid: f.datePaid ?? f.date_paid ?? f.paid_at ?? null,
    paymentMethod: f.paymentMethod ?? f.payment_method ?? null,
    reason: f.reason || 'Overdue fine'
  };
};

const normalizeLoan = (l) => {
  if (!l) return null;
  return {
    ...l,
    id: l.id,
    userId: l.userId ?? l.user_id ?? l.user,
    userName: l.userName ?? l.user_name ?? 'Patron',
    userEmail: l.userEmail ?? l.user_email ?? '',
    bookId: l.bookId ?? l.book_id ?? l.book,
    bookTitle: l.bookTitle ?? l.book_title ?? 'Library Item',
    bookAuthor: l.bookAuthor ?? l.book_author ?? '',
    bookCover: l.bookCover ?? l.book_cover ?? '',
    copyId: l.copyId ?? l.copy_id ?? l.copy,
    copyBarcode: l.copyBarcode ?? l.copy_barcode ?? '',
    borrowDate: l.borrowDate ?? l.borrow_date ?? '',
    dueDate: l.dueDate ?? l.due_date ?? '',
    returnDate: l.returnDate ?? l.return_date ?? null,
    renewCount: Number(l.renewCount ?? l.renew_count) || 0,
    fineAmount: Number(l.fineAmount ?? l.fine_amount) || 0,
    status: l.status || 'active'
  };
};

export const LibraryProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  // Core Data States (loaded directly from Django backend)
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [fines, setFines] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // Current logged in user (defaults to null when signed out)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });


  // Global toast notifications
  const [toast, setToast] = useState(null);

  const notify = (type, message, title = '') => {
    setToast({
      id: Date.now(),
      type,
      message,
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice')
    });
  };

  const clearToast = () => setToast(null);

  // Sync current user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Load initial data from Django backend
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedBooks, fetchedUsers, fetchedLoans, fetchedFines, fetchedLogs] = await Promise.all([
        booksApi.getAll().catch(err => { console.warn('Books API error:', err); return null; }),
        authApi.getUsers().catch(err => { console.warn('Users API error:', err); return null; }),
        loansApi.getAll().catch(err => { console.warn('Loans API error:', err); return null; }),
        finesApi.getAll().catch(err => { console.warn('Fines API error:', err); return null; }),
        logsApi.getAll().catch(err => { console.warn('Logs API error:', err); return null; }),
      ]);

      if (fetchedBooks && fetchedUsers) {
        setBackendConnected(true);
        if (Array.isArray(fetchedBooks)) setBooks(fetchedBooks);
        if (Array.isArray(fetchedUsers)) {
          setUsers(fetchedUsers);
          // If currentUser is set, update it with live user data
          if (currentUser) {
            const liveCurrent = fetchedUsers.find(
              u => u.id === currentUser.id || u.email?.toLowerCase() === currentUser.email?.toLowerCase()
            );
            if (liveCurrent) {
              setCurrentUser(liveCurrent);
            }
          }
        }
        if (Array.isArray(fetchedLoans)) setLoans(fetchedLoans.map(normalizeLoan).filter(Boolean));
        if (Array.isArray(fetchedFines)) setFines(fetchedFines.map(normalizeFine).filter(Boolean));
        if (Array.isArray(fetchedLogs)) setActivityLog(fetchedLogs);
      } else {
        setBackendConnected(false);
      }
    } catch (e) {
      console.warn('Backend unavailable, operating in fallback demo mode:', e);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshAllData();
  }, []);

  // Add an audit log event
  const addLog = async (type, description, user = 'System') => {
    const fallbackLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      description,
      user
    };
    setActivityLog(prev => [fallbackLog, ...prev]);

    try {
      await logsApi.create({ type, description, user });
    } catch (e) {
      // Local state already updated
    }
  };

  // --- Auth Handlers ---
  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res && res.user) {
        setCurrentUser(res.user);
        notify('success', `Welcome back, ${res.user.name}!`);
        addLog('login', `${res.user.name} signed in (${res.user.role})`, res.user.name);
        refreshAllData();
        return true;
      }
      notify('error', 'Login failed. Please check your credentials.');
      return false;
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      notify('error', errorMsg);
      return false;
    }
  };

  const register = async ({ name, email, password, role, phone, membershipTier }) => {
    try {
      const res = await authApi.register({
        name,
        email,
        password,
        role,
        phone,
        membershipTier
      });
      if (res && res.user) {
        setCurrentUser(res.user);
        setUsers(prev => [...prev, res.user]);
        notify('success', `Account created successfully! Welcome, ${res.user.name}.`);
        addLog('registration', `New ${res.user.role} account created for ${res.user.name}`, res.user.name);
        refreshAllData();
        return true;
      }
    } catch (err) {
      notify('error', err.message || 'Registration failed.');
      return false;
    }
    return false;
  };

  const logout = () => {
    authApi.logout();
    if (currentUser) {
      addLog('logout', `${currentUser.name} signed out`, currentUser.name);
    }
    setCurrentUser(null);
    notify('info', 'You have been signed out.');
  };

  const updateUserStatus = async (userId, status) => {
    try {
      const updatedUser = await authApi.updateUserStatus(userId, status);
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...updatedUser } : u)));
      notify('info', `Member status updated to ${status}.`);
      addLog('member_status_change', `${updatedUser.name} status set to ${status}`, currentUser?.name || 'Librarian');
    } catch (err) {
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, status } : u)));
      notify('info', `Member status updated to ${status} (Local).`);
    }
  };

  // --- Book Management (Librarian) ---
  const addBook = async (bookData) => {
    try {
      const newBook = await booksApi.create(bookData);
      setBooks(prev => [newBook, ...prev]);
      notify('success', `Added "${newBook.title}".`);
      addLog('book_added', `New title added: "${newBook.title}"`, currentUser?.name || 'Librarian');
      refreshAllData();
      return newBook;
    } catch (err) {
      notify('error', err.message || 'Failed to add book.');
      return null;
    }
  };

  const updateBook = async (bookId, updatedFields) => {
    try {
      const updatedBook = await booksApi.update(bookId, updatedFields);
      setBooks(prev => prev.map(b => (b.id === bookId ? { ...b, ...updatedBook } : b)));
      notify('success', 'Book details updated successfully.');
      addLog('book_updated', `Catalog record updated for "${updatedBook.title}"`, currentUser?.name || 'Librarian');
      refreshAllData();
      return updatedBook;
    } catch (err) {
      notify('error', err.message || 'Failed to update book.');
      return null;
    }
  };

  const deleteBook = async (bookId) => {
    const book = books.find(b => b.id === bookId);
    try {
      await booksApi.delete(bookId);
      setBooks(prev => prev.filter(b => b.id !== bookId));
      notify('success', `Removed "${book?.title || 'Book'}" from the catalog.`);
      addLog('book_deleted', `Deleted book: "${book?.title || bookId}"`, currentUser?.name || 'Librarian');
      refreshAllData();
      return true;
    } catch (err) {
      notify('error', err.message || 'Failed to delete book.');
      return false;
    }
  };

  // --- Copy Management ---
  const addBookCopy = async (bookId, copyDetails = {}) => {
    const book = books.find(b => b.id === bookId);
    try {
      const newCopy = await booksApi.addCopy(bookId, copyDetails);
      setBooks(prev =>
        prev.map(b => (b.id === bookId ? { ...b, copies: [...(b.copies || []), newCopy] } : b))
      );
      notify('success', `New physical copy added (${newCopy.barcode}) to "${book?.title || 'book'}".`);
      addLog('copy_added', `Added copy ${newCopy.barcode} to "${book?.title || 'book'}"`, currentUser?.name || 'Librarian');
      refreshAllData();
    } catch (err) {
      notify('error', err.message || 'Failed to add copy.');
    }
  };

  const updateBookCopy = async (bookId, copyId, copyUpdates) => {
    try {
      const updatedCopy = await booksApi.updateCopy(copyId, copyUpdates);
      setBooks(prev =>
        prev.map(b =>
          b.id === bookId
            ? {
                ...b,
                copies: (b.copies || []).map(cp =>
                  cp.copyId === copyId || cp.id === copyId ? { ...cp, ...updatedCopy } : cp
                )
              }
            : b
        )
      );
      notify('success', 'Physical copy status updated.');
      refreshAllData();
    } catch (err) {
      notify('error', err.message || 'Failed to update copy.');
    }
  };

  const removeBookCopy = async (bookId, copyId) => {
    try {
      await booksApi.deleteCopy(copyId);
      setBooks(prev =>
        prev.map(b =>
          b.id === bookId
            ? {
                ...b,
                copies: (b.copies || []).filter(cp => cp.copyId !== copyId && cp.id !== copyId)
              }
            : b
        )
      );
      notify('success', `Physical copy removed from inventory.`);
      refreshAllData();
      return true;
    } catch (err) {
      notify('error', err.message || 'Failed to remove copy.');
      return false;
    }
  };

  // --- Circulation Workflows ---
  const borrowBook = async (bookId, specificCopyId = null, targetUserId = null) => {
    const activeUser = targetUserId ? users.find(u => u.id === targetUserId) : currentUser;
    if (!activeUser) {
      notify('error', 'You must be signed in to borrow books.');
      return false;
    }

    try {
      const newLoan = await loansApi.borrow({
        bookId,
        copyId: specificCopyId,
        userId: activeUser.id
      });
      const normLoan = normalizeLoan(newLoan);
      setLoans(prev => [normLoan, ...prev]);
      notify('success', `Successfully borrowed "${normLoan.bookTitle}"! Due on ${normLoan.dueDate}.`);
      addLog('checkout', `${activeUser.name} checked out "${normLoan.bookTitle}"`, currentUser?.name || activeUser.name);
      refreshAllData();
      return true;
    } catch (err) {
      notify('error', err.message || 'Failed to borrow book.');
      return false;
    }
  };

  const returnBook = async (loanId, returnCondition = 'Good', notes = '') => {
    try {
      const res = await loansApi.returnBook(loanId, { returnCondition, notes });
      if (res && res.loan) {
        const normLoan = normalizeLoan(res.loan);
        setLoans(prev => prev.map(l => (l.id === loanId ? { ...l, ...normLoan } : l)));
        if (res.fine) {
          const normFine = normalizeFine(res.fine);
          setFines(prev => [normFine, ...prev]);
          notify('warning', `Book returned. Late fee of $${Number(res.fineAmount ?? normFine.amount ?? 0).toFixed(2)} accrued.`);
        } else {
          notify('success', `"${normLoan.bookTitle}" returned successfully! Thank you.`);
        }
        refreshAllData();
        return res;
      }
    } catch (err) {
      notify('error', err.message || 'Failed to return book.');
      return null;
    }
  };

  const renewLoan = async (loanId) => {
    try {
      const renewedLoan = await loansApi.renew(loanId);
      const normLoan = normalizeLoan(renewedLoan);
      setLoans(prev => prev.map(l => (l.id === loanId ? { ...l, ...normLoan } : l)));
      notify('success', `Loan renewed! New due date is ${normLoan.dueDate}.`);
      refreshAllData();
      return true;
    } catch (err) {
      notify('error', err.message || 'Failed to renew loan.');
      return false;
    }
  };

  // --- Fine Actions ---
  const payFine = async (fineId, paymentMethod = 'Credit Card') => {
    try {
      const updatedFine = await finesApi.pay(fineId, paymentMethod);
      const normFine = normalizeFine(updatedFine);
      setFines(prev => prev.map(f => (f.id === fineId ? { ...f, ...normFine } : f)));
      notify('success', `Payment of $${Number(normFine.amount).toFixed(2)} received.`);
      refreshAllData();
    } catch (err) {
      notify('error', err.message || 'Failed to process payment.');
    }
  };

  const waiveFine = async (fineId, reason = 'Librarian Courtesy Discretion') => {
    try {
      const waivedFine = await finesApi.waive(fineId, reason);
      const normFine = normalizeFine(waivedFine);
      setFines(prev => prev.map(f => (f.id === fineId ? { ...f, ...normFine } : f)));
      notify('info', `Fine waived.`);
      refreshAllData();
    } catch (err) {
      notify('error', err.message || 'Failed to waive fine.');
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        // Status & Connectivity
        loading,
        backendConnected,
        refreshAllData,

        // Auth & User
        currentUser,
        users,
        login,
        register,
        logout,
        updateUserStatus,

        // Books & Copies
        books,
        addBook,
        updateBook,
        deleteBook,
        addBookCopy,
        updateBookCopy,
        removeBookCopy,

        // Circulation & Loans
        loans,
        borrowBook,
        returnBook,
        renewLoan,

        // Fines
        fines,
        payFine,
        waiveFine,
        fineRatePerDay: FINE_RATE_PER_DAY,

        // Analytics & Logs
        activityLog,

        // Notifications
        toast,
        notify,
        clearToast
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};


export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
