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
import { localDb } from './localStore';

/**
 * Robust Request wrapper with automatic offline/static deployment fallback.
 * If running on Vercel/Netlify static deployment where backend Express server
 * is absent (status 404) or network is unavailable, it smoothly executes
 * against localStore.ts so the app NEVER breaks or shows 404!
 */
async function request<T>(
  url: string,
  options?: RequestInit,
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    // If server responds with 404 (common on Vercel static deployments) and fallback provided
    if (res.status === 404 && fallbackFn) {
      return await fallbackFn();
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (fallbackFn) {
        return await fallbackFn();
      }
      throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
    }
    return data as T;
  } catch (err: any) {
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw err;
  }
}

export const api = {
  // --- Auth ---
  login: (credentials: { email: string; password: string }) =>
    request<{ user: User }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      () => ({ user: localDb.login(credentials) })
    ),

  register: (userData: { name: string; email: string; password: string; phone: string }) =>
    request<{ user: User }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      () => ({ user: localDb.register(userData) })
    ),

  getMembers: () =>
    request<User[]>('/api/members', undefined, () => localDb.getMembers()),

  updateMemberStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED') =>
    request<User>(
      `/api/members/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      },
      () => localDb.updateMemberStatus(id, status)
    ),

  // --- Books ---
  getBooks: (params?: { category?: string; search?: string; availableOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.availableOnly) query.set('availableOnly', 'true');
    return request<Book[]>(
      `/api/books?${query.toString()}`,
      undefined,
      () => localDb.getBooks(params)
    );
  },

  getBookById: (id: string) =>
    request<Book>(`/api/books/${id}`, undefined, () => {
      const b = localDb.getBookById(id);
      if (!b) throw new Error('Book not found');
      return b;
    }),

  addBook: (bookData: Partial<Book>) =>
    request<Book>(
      '/api/books',
      {
        method: 'POST',
        body: JSON.stringify(bookData),
      },
      () => localDb.addBook(bookData)
    ),

  updateBook: (id: string, bookData: Partial<Book>) =>
    request<Book>(
      `/api/books/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(bookData),
      },
      () => localDb.updateBook(id, bookData)
    ),

  deleteBook: (id: string) =>
    request<{ success: boolean; message: string }>(
      `/api/books/${id}`,
      {
        method: 'DELETE',
      },
      () => {
        localDb.deleteBook(id);
        return { success: true, message: 'Book deleted successfully' };
      }
    ),

  getCategories: () =>
    request<CategoryInfo[]>('/api/categories', undefined, () => localDb.getCategories()),

  // --- Issues & Circulation ---
  getIssues: (userId?: string) => {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<BookIssue[]>(`/api/issues${q}`, undefined, () => localDb.getIssues(userId));
  },

  issueBook: (userId: string, bookId: string, loanDays: number = 14) =>
    request<BookIssue>(
      '/api/issues',
      {
        method: 'POST',
        body: JSON.stringify({ userId, bookId, loanDays }),
      },
      () => localDb.issueBook(userId, bookId, loanDays)
    ),

  returnBook: (issueId: string) =>
    request<{ message: string; issue: BookIssue; fineAmount: number; fineRecord?: Fine }>(
      `/api/issues/${issueId}/return`,
      {
        method: 'POST',
      },
      () => {
        const res = localDb.returnBook(issueId);
        return {
          message: 'Book returned successfully',
          issue: res.issue,
          fineAmount: res.fineAmount,
          fineRecord: res.fineRecord,
        };
      }
    ),

  // --- Fines ---
  getFines: (userId?: string) => {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<Fine[]>(`/api/fines${q}`, undefined, () => localDb.getFines(userId));
  },

  payFine: (fineId: string) =>
    request<{ message: string; fine: Fine }>(
      `/api/fines/${fineId}/pay`,
      {
        method: 'PUT',
      },
      () => ({
        message: 'Fine cleared and recorded as paid',
        fine: localDb.payFine(fineId),
      })
    ),

  // --- Reservations ---
  getReservations: (userId?: string) => {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<Reservation[]>(`/api/reservations${q}`, undefined, () => localDb.getReservations(userId));
  },

  createReservation: (userId: string, bookId: string) =>
    request<Reservation>(
      '/api/reservations',
      {
        method: 'POST',
        body: JSON.stringify({ userId, bookId }),
      },
      () => localDb.createReservation(userId, bookId)
    ),

  cancelReservation: (id: string, userId?: string) =>
    request<{ success: boolean; message: string }>(
      `/api/reservations/${id}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      },
      () => {
        localDb.cancelReservation(id);
        return { success: true, message: 'Reservation cancelled' };
      }
    ),

  // --- Queries ---
  getQueries: (userId?: string) => {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<MemberQuery[]>(`/api/queries${q}`, undefined, () => localDb.getQueries(userId));
  },

  submitQuery: (queryData: {
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    category: string;
    message: string;
  }) =>
    request<MemberQuery>(
      '/api/queries',
      {
        method: 'POST',
        body: JSON.stringify(queryData),
      },
      () => localDb.submitQuery(queryData)
    ),

  replyQuery: (id: string, reply: string) =>
    request<MemberQuery>(
      `/api/queries/${id}/reply`,
      {
        method: 'PUT',
        body: JSON.stringify({ reply }),
      },
      () => localDb.replyQuery(id, reply)
    ),

  // --- Stats & Schema ---
  getStats: () =>
    request<LibraryStats>('/api/stats', undefined, () => localDb.getStats()),

  getSchema: () =>
    request<{ engine: string; ddl: string; tables: string[] }>(
      '/api/schema',
      undefined,
      () => ({
        engine: 'MySQL 8.0+ / SQLite 3',
        tables: ['users', 'books', 'book_issues', 'fines', 'reservations', 'member_queries'],
        ddl: `-- Digital Library Management System MySQL DDL Schema
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  member_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
  phone VARCHAR(20) NOT NULL,
  status ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(150) NOT NULL,
  isbn VARCHAR(20) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 0),
  available_quantity INT NOT NULL CHECK (available_quantity >= 0 AND available_quantity <= quantity),
  shelf_location VARCHAR(50) NOT NULL,
  description TEXT,
  published_year INT,
  cover_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_issues (
  id VARCHAR(36) PRIMARY KEY,
  book_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  issue_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP NOT NULL,
  return_date TIMESTAMP NULL,
  status ENUM('ISSUED', 'RETURNED', 'OVERDUE') NOT NULL DEFAULT 'ISSUED',
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS fines (
  id VARCHAR(36) PRIMARY KEY,
  issue_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  book_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  days_overdue INT NOT NULL DEFAULT 0,
  status ENUM('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (issue_id) REFERENCES book_issues(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS reservations (
  id VARCHAR(36) PRIMARY KEY,
  book_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  reservation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('PENDING', 'READY_FOR_PICKUP', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  queue_position INT NOT NULL DEFAULT 1,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS member_queries (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(120) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('PENDING', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
  admin_reply TEXT NULL,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`,
      })
    ),

  // --- Time Offset Simulation & Demo Reset ---
  setTimeOffset: (days: number) =>
    request<{ message: string; config: any }>(
      '/api/system/time-offset',
      {
        method: 'POST',
        body: JSON.stringify({ days }),
      },
      () => ({
        message: `System time offset updated to ${days} days`,
        config: { virtualDaysOffset: days },
      })
    ),

  resetDemo: () =>
    request<{ message: string }>(
      '/api/system/reset-demo',
      {
        method: 'POST',
      },
      () => {
        localDb.resetDemo();
        return { message: 'Demo data reset successfully' };
      }
    ),
};
