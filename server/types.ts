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
  password: string;
  role: UserRole;
  phone: string;
  status: UserStatus;
  joinedAt: string;
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
}

export interface Reservation {
  id: string;
  bookId: string;
  userId: string;
  reservationDate: string;
  status: ReservationStatus;
  queuePosition: number;
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

export interface SystemConfig {
  virtualDaysOffset: number; // For demo time travel / overdue testing
  finePerDay: number; // ₹5 per day default
}

export interface LibraryDatabase {
  users: User[];
  books: Book[];
  issues: BookIssue[];
  fines: Fine[];
  reservations: Reservation[];
  queries: MemberQuery[];
  config: SystemConfig;
}
