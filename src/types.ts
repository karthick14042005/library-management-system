export type UserRole = 'ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type IssueStatus = 'ISSUED' | 'RETURNED' | 'OVERDUE';
export type FineStatus = 'UNPAID' | 'PAID';
export type ReservationStatus = 'PENDING' | 'READY_FOR_PICKUP' | 'FULFILLED' | 'CANCELLED';
export type QueryStatus = 'PENDING' | 'RESOLVED';

export interface User {
  id: string;
  memberId: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  status: UserStatus;
  joinedAt: string;
  activeLoansCount?: number;
  unpaidFineAmount?: number;
  totalBorrowedCount?: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  shelfLocation: string;
  description: string;
  publishedYear: number;
  coverUrl: string;
  createdAt: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  userId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: IssueStatus;
  calculatedFine?: number;
  finePaid?: boolean;
  book?: Book;
  user?: User;
}

export interface Fine {
  id: string;
  issueId: string;
  userId: string;
  bookId: string;
  amount: number;
  daysOverdue: number;
  status: FineStatus;
  createdAt: string;
  paidAt?: string | null;
  book?: Book;
  user?: User;
  issue?: BookIssue;
}

export interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  reservationDate: string;
  status: ReservationStatus;
  queuePosition: number;
  book?: Book;
  user?: User;
}

export interface MemberQuery {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'General' | 'Book Request' | 'Account Issue' | 'Fine Dispute' | 'Other';
  message: string;
  status: QueryStatus;
  adminReply?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

export interface LibraryStats {
  totalBooks: number;
  uniqueTitles: number;
  availableCopies: number;
  issuedCopies: number;
  activeIssues: number;
  overdueIssues: number;
  totalFinesCollected: number;
  pendingFines: number;
  totalMembers: number;
  activeReservations: number;
  pendingQueries: number;
  finePerDay: number;
  virtualDaysOffset: number;
  effectiveDate: string;
}

export interface CategoryInfo {
  name: string;
  count: number;
}
