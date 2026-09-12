import {
  User,
  Book,
  BookIssue,
  Fine,
  Reservation,
  MemberQuery,
  LibraryStats,
  CategoryInfo,
} from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: { name: string; email: string; password: string; phone: string }) =>
    request<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMembers: () => request<User[]>('/api/members'),

  updateMemberStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED') =>
    request<User>(`/api/members/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Books
  getBooks: (params?: { category?: string; search?: string; availableOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.availableOnly) query.set('availableOnly', 'true');
    return request<Book[]>(`/api/books?${query.toString()}`);
  },

  getBookById: (id: string) => request<Book>(`/api/books/${id}`),

  addBook: (bookData: Partial<Book>) =>
    request<Book>('/api/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

  updateBook: (id: string, bookData: Partial<Book>) =>
    request<Book>(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    }),

  deleteBook: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/books/${id}`, {
      method: 'DELETE',
    }),

  getCategories: () => request<CategoryInfo[]>('/api/categories'),

  // Issues & Circulation
  getIssues: (userId?: string) => {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<BookIssue[]>(`/api/issues${q}`);
  },

  issueBook: (userId: string, bookId: string, loanDays: number = 14) =>
    request<BookIssue>('/api/issues', {
      method: 'POST',
      body: JSON.stringify({ userId, bookId, loanDays }),
    }),

  returnBook: (issueId: string) =>
    request<{ message: string; issue: BookIssue; fineAmount: number; fineRecord?: Fine }>(
      `/api/issues/${issueId}/return`,
      {
        method: 'POST',
      }
    ),

  // Fines
  getFines: (userId?: string) => {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<Fine[]>(`/api/fines${q}`);
  },

  payFine: (fineId: string) =>
    request<{ message: string; fine: Fine }>(`/api/fines/${fineId}/pay`, {
      method: 'PUT',
    }),

  // Reservations
  getReservations: (userId?: string) => {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<Reservation[]>(`/api/reservations${q}`);
  },

  createReservation: (userId: string, bookId: string) =>
    request<Reservation>('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ userId, bookId }),
    }),

  cancelReservation: (id: string, userId?: string) =>
    request<{ success: boolean; message: string }>(`/api/reservations/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    }),

  // Queries
  getQueries: (userId?: string) => {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<MemberQuery[]>(`/api/queries${q}`);
  },

  submitQuery: (queryData: {
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    category: string;
    message: string;
  }) =>
    request<MemberQuery>('/api/queries', {
      method: 'POST',
      body: JSON.stringify(queryData),
    }),

  replyQuery: (id: string, reply: string) =>
    request<MemberQuery>(`/api/queries/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify({ reply }),
    }),

  // Stats & Schema
  getStats: () => request<LibraryStats>('/api/stats'),

  getSchema: () =>
    request<{ engine: string; ddl: string; tables: string[] }>('/api/schema'),

  // Time Offset Simulation & Demo Reset
  setTimeOffset: (days: number) =>
    request<{ message: string; config: any }>('/api/system/time-offset', {
      method: 'POST',
      body: JSON.stringify({ days }),
    }),

  resetDemo: () =>
    request<{ message: string }>('/api/system/reset-demo', {
      method: 'POST',
    }),
};
