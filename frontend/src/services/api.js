const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const ADMIN_URL = (import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
  : 'http://127.0.0.1:8000') + '/admin/';

export const TOKEN_STORAGE_KEY = 'athenaeum_token';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to set token:', e);
  }
};

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      (data && (data.detail || data.error || (typeof data === 'object' && Object.values(data)[0]))) ||
      `Request failed with status ${response.status}`;
    const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  login: async (email, password) => {
    const res = await request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      setToken(res.token);
    }
    return res;
  },

  register: async (userData) => {
    const res = await request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (res.token) {
      setToken(res.token);
    }
    return res;
  },

  getCurrentUser: () => request('/auth/me/'),

  getUsers: () => request('/auth/users/'),

  updateUserStatus: (userId, status) =>
    request(`/auth/users/${userId}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  logout: () => {
    setToken(null);
  }
};

export const booksApi = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.category && params.category !== 'All') {
      searchParams.append('category', params.category);
    }
    const query = searchParams.toString();
    return request(`/catalogs/books/${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/catalogs/books/${id}/`),

  create: (bookData) =>
    request('/catalogs/books/', {
      method: 'POST',
      body: JSON.stringify(bookData)
    }),

  update: (id, updates) =>
    request(`/catalogs/books/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),

  delete: (id) =>
    request(`/catalogs/books/${id}/`, {
      method: 'DELETE'
    }),

  addCopy: (bookId, copyData) =>
    request(`/catalogs/books/${bookId}/copies/`, {
      method: 'POST',
      body: JSON.stringify(copyData)
    }),

  updateCopy: (copyId, copyData) =>
    request(`/catalogs/copies/${copyId}/`, {
      method: 'PATCH',
      body: JSON.stringify(copyData)
    }),

  deleteCopy: (copyId) =>
    request(`/catalogs/copies/${copyId}/`, {
      method: 'DELETE'
    })
};

export const loansApi = {
  getAll: (userId = null) => {
    const query = userId ? `?userId=${userId}` : '';
    return request(`/transactions/loans/${query}`);
  },

  borrow: ({ bookId, copyId, userId }) =>
    request('/transactions/borrow/', {
      method: 'POST',
      body: JSON.stringify({ bookId, copyId, userId })
    }),

  returnBook: (loanId, { returnCondition = 'Good', notes = '' } = {}) =>
    request(`/transactions/loans/${loanId}/return/`, {
      method: 'POST',
      body: JSON.stringify({ returnCondition, notes })
    }),

  renew: (loanId) =>
    request(`/transactions/loans/${loanId}/renew/`, {
      method: 'POST'
    })
};

export const finesApi = {
  getAll: () => request('/transactions/fines/'),

  pay: (fineId, paymentMethod = 'Credit Card') =>
    request(`/transactions/fines/${fineId}/pay/`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod })
    }),

  waive: (fineId, reason = 'Librarian Courtesy Discretion') =>
    request(`/transactions/fines/${fineId}/waive/`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
};

export const logsApi = {
  getAll: () => request('/transactions/logs/'),

  create: ({ type, description, user }) =>
    request('/transactions/logs/', {
      method: 'POST',
      body: JSON.stringify({ type, description, user })
    })
};
