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

const STORAGE_KEY = 'dlms_database_v2';

interface LocalDatabaseState {
  users: User[];
  books: Book[];
  issues: BookIssue[];
  fines: Fine[];
  reservations: Reservation[];
  queries: MemberQuery[];
  config: {
    virtualDaysOffset: number;
    finePerDay: number;
  };
}

const INITIAL_BOOKS: Book[] = [
  {
    id: 'bk_1',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Computer Science',
    quantity: 5,
    availableQuantity: 3,
    shelfLocation: 'Rack CS-101',
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Master agile craftsmanship, refactoring, and meaningful naming.',
    publishedYear: 2008,
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3ddb5?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-15T10:00:00.000Z',
  },
  {
    id: 'bk_2',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    isbn: '978-0262033848',
    category: 'Computer Science',
    quantity: 4,
    availableQuantity: 2,
    shelfLocation: 'Rack CS-102',
    description: 'Comprehensive update of the leading algorithms textbook, covering modern algorithms, dynamic programming, graph theory, and computational complexity.',
    publishedYear: 2009,
    coverUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-16T11:00:00.000Z',
  },
  {
    id: 'bk_3',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    isbn: '978-0201633610',
    category: 'Software Engineering',
    quantity: 3,
    availableQuantity: 0, // 0 copies available to showcase advance bookings!
    shelfLocation: 'Rack SE-204',
    description: 'Capturing a wealth of experience about the design of object-oriented software, presenting 23 classic design patterns.',
    publishedYear: 1994,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-01-18T09:30:00.000Z',
  },
  {
    id: 'bk_4',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Literature',
    quantity: 6,
    availableQuantity: 5,
    shelfLocation: 'Rack LIT-301',
    description: 'A classic portrayal of the Jazz Age, wealth, disillusionment, obsession, and the elusive nature of the American Dream in the 1920s.',
    publishedYear: 1925,
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01T08:00:00.000Z',
  },
  {
    id: 'bk_5',
    title: 'Database System Concepts (Silberschatz)',
    author: 'Abraham Silberschatz, Henry F. Korth',
    isbn: '978-0078022159',
    category: 'Computer Science',
    quantity: 4,
    availableQuantity: 3,
    shelfLocation: 'Rack DB-401',
    description: 'The definitive text on database systems, covering relational databases, SQL, normalization, indexing, transaction processing, and concurrency control.',
    publishedYear: 2019,
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-02-10T13:20:00.000Z',
  },
  {
    id: 'bk_6',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    category: 'History',
    quantity: 5,
    availableQuantity: 4,
    shelfLocation: 'Rack HIST-105',
    description: 'Explores how an insignificant ape became the ruler of planet Earth, covering cognitive, agricultural, and scientific revolutions.',
    publishedYear: 2014,
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-02-15T15:00:00.000Z',
  },
  {
    id: 'bk_7',
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0441172719',
    category: 'Science Fiction',
    quantity: 4,
    availableQuantity: 4,
    shelfLocation: 'Rack SCI-202',
    description: 'Set on the desert planet Arrakis, Dune tells the story of Paul Atreides as he navigates political betrayal, ecology, and prophecy.',
    publishedYear: 1965,
    coverUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-02-20T10:40:00.000Z',
  },
  {
    id: 'bk_8',
    title: 'Linear Algebra and Its Applications',
    author: 'Gilbert Strang',
    isbn: '978-0030105678',
    category: 'Mathematics',
    quantity: 3,
    availableQuantity: 2,
    shelfLocation: 'Rack MATH-108',
    description: 'Renowned introduction to linear algebra, vector spaces, eigenvalues, singular value decomposition, and applied matrices.',
    publishedYear: 2016,
    coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-02-25T11:00:00.000Z',
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_1',
    memberId: 'LIB-ADM-001',
    name: 'Chief Librarian Sarah Jenkins',
    email: 'admin@library.gov',
    role: 'ADMIN',
    phone: '+91 98765 43210',
    status: 'ACTIVE',
    joinedAt: '2025-01-10T09:00:00.000Z',
  },
  {
    id: 'usr_user_1',
    memberId: 'LIB-MEM-101',
    name: 'Rohit Sharma',
    email: 'rohit@example.com',
    role: 'USER',
    phone: '+91 98111 22334',
    status: 'ACTIVE',
    joinedAt: '2025-03-15T14:30:00.000Z',
  },
  {
    id: 'usr_user_2',
    memberId: 'LIB-MEM-102',
    name: 'Priya Nair',
    email: 'priya@example.com',
    role: 'USER',
    phone: '+91 98222 33445',
    status: 'ACTIVE',
    joinedAt: '2025-04-02T11:15:00.000Z',
  },
  {
    id: 'usr_user_3',
    memberId: 'LIB-MEM-103',
    name: 'Arjun Verma',
    email: 'arjun@example.com',
    role: 'USER',
    phone: '+91 98333 44556',
    status: 'SUSPENDED',
    joinedAt: '2025-05-18T16:45:00.000Z',
  }
];

function getInitialState(): LocalDatabaseState {
  const now = Date.now();
  return {
    config: {
      virtualDaysOffset: 0,
      finePerDay: 5,
    },
    users: INITIAL_USERS,
    books: INITIAL_BOOKS,
    issues: [
      {
        id: 'iss_1',
        bookId: 'bk_1',
        userId: 'usr_user_1',
        issueDate: new Date(now - 20 * 86400000).toISOString(),
        dueDate: new Date(now - 6 * 86400000).toISOString(),
        returnDate: null,
        status: 'OVERDUE',
        calculatedFine: 30,
        finePaid: false,
      },
      {
        id: 'iss_2',
        bookId: 'bk_2',
        userId: 'usr_user_2',
        issueDate: new Date(now - 4 * 86400000).toISOString(),
        dueDate: new Date(now + 10 * 86400000).toISOString(),
        returnDate: null,
        status: 'ISSUED',
        calculatedFine: 0,
        finePaid: false,
      },
      {
        id: 'iss_3',
        bookId: 'bk_3',
        userId: 'usr_user_1',
        issueDate: new Date(now - 2 * 86400000).toISOString(),
        dueDate: new Date(now + 12 * 86400000).toISOString(),
        returnDate: null,
        status: 'ISSUED',
        calculatedFine: 0,
        finePaid: false,
      },
      {
        id: 'iss_4',
        bookId: 'bk_3',
        userId: 'usr_user_3',
        issueDate: new Date(now - 15 * 86400000).toISOString(),
        dueDate: new Date(now - 1 * 86400000).toISOString(),
        returnDate: null,
        status: 'OVERDUE',
        calculatedFine: 5,
        finePaid: false,
      }
    ],
    fines: [
      {
        id: 'fn_1',
        issueId: 'iss_1',
        userId: 'usr_user_1',
        bookId: 'bk_1',
        amount: 30,
        daysOverdue: 6,
        status: 'UNPAID',
        createdAt: new Date(now - 6 * 86400000).toISOString(),
        paidAt: null,
      },
      {
        id: 'fn_2',
        issueId: 'iss_historic',
        userId: 'usr_user_2',
        bookId: 'bk_4',
        amount: 15,
        daysOverdue: 3,
        status: 'PAID',
        createdAt: new Date(now - 30 * 86400000).toISOString(),
        paidAt: new Date(now - 28 * 86400000).toISOString(),
      }
    ],
    reservations: [
      {
        id: 'res_1',
        bookId: 'bk_3',
        userId: 'usr_user_2',
        reservationDate: new Date(now - 1 * 86400000).toISOString(),
        status: 'PENDING',
        queuePosition: 1,
      }
    ],
    queries: [
      {
        id: 'qry_1',
        userId: 'usr_user_1',
        userName: 'Rohit Sharma',
        userEmail: 'rohit@example.com',
        subject: 'Request for "Designing Data-Intensive Applications"',
        category: 'Book Request',
        message: 'Could the library please consider acquiring Martin Kleppmann\'s "Designing Data-Intensive Applications"? Multiple CS students require it for distributed systems.',
        status: 'PENDING',
        adminReply: null,
        repliedAt: null,
        createdAt: new Date(now - 3 * 86400000).toISOString(),
      },
      {
        id: 'qry_2',
        userId: 'usr_user_2',
        userName: 'Priya Nair',
        userEmail: 'priya@example.com',
        subject: 'Weekend Study Room Timings',
        category: 'General',
        message: 'Are the reading rooms and Wi-Fi facilities open on Sunday evenings during semester finals?',
        status: 'RESOLVED',
        adminReply: 'Yes Priya! The digital reading room remains accessible until 9:00 PM on all weekends during final exams.',
        repliedAt: new Date(now - 1 * 86400000).toISOString(),
        createdAt: new Date(now - 5 * 86400000).toISOString(),
      }
    ]
  };
}

class LocalDatabase {
  private state: LocalDatabaseState;

  constructor() {
    this.state = this.loadState();
    this.recalculateOverdue();
  }

  private loadState(): LocalDatabaseState {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsed = JSON.parse(item);
        if (parsed.books && parsed.users) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using in-memory defaults:', e);
    }
    const initial = getInitialState();
    this.saveState(initial);
    return initial;
  }

  private saveState(state?: LocalDatabaseState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state || this.state));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  public getEffectiveNow(): Date {
    const base = new Date();
    const offsetMs = (this.state.config.virtualDaysOffset || 0) * 86400000;
    return new Date(base.getTime() + offsetMs);
  }

  private recalculateOverdue() {
    const now = this.getEffectiveNow();
    const rate = this.state.config.finePerDay || 5;

    for (const issue of this.state.issues) {
      if (issue.status === 'RETURNED') continue;
      const due = new Date(issue.dueDate);
      if (now > due) {
        issue.status = 'OVERDUE';
        const diffMs = now.getTime() - due.getTime();
        const daysOverdue = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const fineAmount = daysOverdue * rate;
        issue.calculatedFine = fineAmount;

        const existingFine = this.state.fines.find((f) => f.issueId === issue.id);
        if (existingFine) {
          if (existingFine.status === 'UNPAID') {
            existingFine.amount = fineAmount;
            existingFine.daysOverdue = daysOverdue;
          }
        } else {
          this.state.fines.push({
            id: `fn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            issueId: issue.id,
            userId: issue.userId,
            bookId: issue.bookId,
            amount: fineAmount,
            daysOverdue,
            status: 'UNPAID',
            createdAt: now.toISOString(),
          });
        }
      } else {
        issue.status = 'ISSUED';
        issue.calculatedFine = 0;
      }
    }
    this.saveState();
  }

  // --- AUTH ---
  public login(credentials: { email: string; password: string }): User {
    const email = credentials.email.toLowerCase().trim();
    const user = this.state.users.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      // If demo accounts, create dynamically if needed
      if (email === 'admin@library.gov') {
        return INITIAL_USERS[0];
      }
      if (email === 'rohit@example.com') {
        return INITIAL_USERS[1];
      }
      if (email === 'priya@example.com') {
        return INITIAL_USERS[2];
      }
      throw new Error('Invalid email or password.');
    }

    if (user.status !== 'ACTIVE' && user.role !== 'ADMIN') {
      throw new Error('Your library membership is currently suspended. Please contact staff.');
    }

    return user;
  }

  public register(userData: { name: string; email: string; password: string; phone: string }): User {
    const existing = this.state.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase().trim());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }
    const count = this.state.users.filter((u) => u.role === 'USER').length + 1;
    const memberId = `LIB-MEM-${100 + count}`;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      memberId,
      name: userData.name,
      email: userData.email,
      role: 'USER',
      phone: userData.phone,
      status: 'ACTIVE',
      joinedAt: this.getEffectiveNow().toISOString(),
    };

    this.state.users.push(newUser);
    this.saveState();
    return newUser;
  }

  public getMembers(): User[] {
    return this.state.users.map((u) => {
      const userIssues = this.state.issues.filter((i) => i.userId === u.id);
      const active = userIssues.filter((i) => i.status === 'ISSUED' || i.status === 'OVERDUE').length;
      const unpaid = this.state.fines
        .filter((f) => f.userId === u.id && f.status === 'UNPAID')
        .reduce((sum, f) => sum + f.amount, 0);

      return {
        ...u,
        activeLoansCount: active,
        unpaidFineAmount: unpaid,
        totalBorrowedCount: userIssues.length,
      };
    });
  }

  public updateMemberStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): User {
    const user = this.state.users.find((u) => u.id === id);
    if (!user) throw new Error('Member not found');
    user.status = status;
    this.saveState();
    return user;
  }

  // --- BOOKS ---
  public getBooks(params?: { category?: string; search?: string; availableOnly?: boolean }): Book[] {
    let list = [...this.state.books];
    if (params?.category && params.category !== 'All') {
      list = list.filter((b) => b.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q)
      );
    }
    if (params?.availableOnly) {
      list = list.filter((b) => b.availableQuantity > 0);
    }
    return list;
  }

  public getBookById(id: string): Book | undefined {
    return this.state.books.find((b) => b.id === id);
  }

  public addBook(bookData: Partial<Book>): Book {
    const qty = Number(bookData.quantity) || 1;
    const newBook: Book = {
      id: `bk_${Date.now()}`,
      title: bookData.title || 'Untitled',
      author: bookData.author || 'Unknown',
      isbn: bookData.isbn || `978-0${Math.floor(100000000 + Math.random() * 900000000)}`,
      category: bookData.category || 'General',
      quantity: qty,
      availableQuantity: qty,
      shelfLocation: bookData.shelfLocation || 'Rack CS-101',
      description: bookData.description || '',
      publishedYear: Number(bookData.publishedYear) || new Date().getFullYear(),
      coverUrl: bookData.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      createdAt: this.getEffectiveNow().toISOString(),
    };
    this.state.books.unshift(newBook);
    this.saveState();
    return newBook;
  }

  public updateBook(id: string, updates: Partial<Book>): Book {
    const book = this.getBookById(id);
    if (!book) throw new Error('Book not found');
    const currentlyIssued = book.quantity - book.availableQuantity;
    if (updates.quantity !== undefined && updates.quantity < currentlyIssued) {
      throw new Error(`Total copies cannot be less than currently issued (${currentlyIssued}).`);
    }
    if (updates.quantity !== undefined && updates.availableQuantity === undefined) {
      const delta = updates.quantity - book.quantity;
      book.availableQuantity = Math.max(0, book.availableQuantity + delta);
      book.quantity = updates.quantity;
    }
    Object.assign(book, updates);
    this.saveState();
    return book;
  }

  public deleteBook(id: string): boolean {
    const book = this.getBookById(id);
    if (!book) throw new Error('Book not found');
    const active = this.state.issues.filter(
      (i) => i.bookId === id && (i.status === 'ISSUED' || i.status === 'OVERDUE')
    );
    if (active.length > 0) {
      throw new Error(`Cannot delete: ${active.length} copy/copies currently on loan.`);
    }
    this.state.books = this.state.books.filter((b) => b.id !== id);
    this.state.reservations = this.state.reservations.filter((r) => r.bookId !== id);
    this.saveState();
    return true;
  }

  public getCategories(): CategoryInfo[] {
    const catMap: Record<string, number> = {};
    this.state.books.forEach((b) => {
      catMap[b.category] = (catMap[b.category] || 0) + 1;
    });
    return Object.keys(catMap).map((name) => ({
      name,
      count: catMap[name],
    }));
  }

  // --- ISSUES & CIRCULATION ---
  public getIssues(userId?: string): BookIssue[] {
    this.recalculateOverdue();
    let list = this.state.issues;
    if (userId) {
      list = list.filter((i) => i.userId === userId);
    }
    return list.map((i) => ({
      ...i,
      book: this.getBookById(i.bookId),
      user: this.state.users.find((u) => u.id === i.userId),
    }));
  }

  public issueBook(userId: string, bookId: string, loanDays: number = 14): BookIssue {
    this.recalculateOverdue();
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) throw new Error('Member account not found');
    if (user.status !== 'ACTIVE') {
      throw new Error('Your account is suspended. Please see the library administrator.');
    }

    const unpaidFines = this.state.fines.filter((f) => f.userId === userId && f.status === 'UNPAID');
    const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
    if (totalUnpaid > 50) {
      throw new Error(`Cannot issue book: Member has ₹${totalUnpaid} in unpaid fines. Clear dues to borrow.`);
    }

    const book = this.getBookById(bookId);
    if (!book) throw new Error('Book not found');
    if (book.availableQuantity <= 0) {
      throw new Error('All copies currently issued out. Please place an advance reservation.');
    }

    const existingIssue = this.state.issues.find(
      (i) => i.bookId === bookId && i.userId === userId && (i.status === 'ISSUED' || i.status === 'OVERDUE')
    );
    if (existingIssue) {
      throw new Error('You already have an active loan for this book.');
    }

    const now = this.getEffectiveNow();
    const due = new Date(now.getTime() + loanDays * 86400000);
    book.availableQuantity -= 1;

    // Fulfill reservation if user was queued
    const res = this.state.reservations.find(
      (r) => r.bookId === bookId && r.userId === userId && (r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP')
    );
    if (res) {
      res.status = 'FULFILLED';
    }

    const newIssue: BookIssue = {
      id: `iss_${Date.now()}`,
      bookId,
      userId,
      issueDate: now.toISOString(),
      dueDate: due.toISOString(),
      returnDate: null,
      status: 'ISSUED',
      calculatedFine: 0,
      finePaid: false,
      book,
      user,
    };

    this.state.issues.unshift(newIssue);
    this.saveState();
    return newIssue;
  }

  public returnBook(issueId: string): { issue: BookIssue; fineAmount: number; fineRecord?: Fine } {
    this.recalculateOverdue();
    const issue = this.state.issues.find((i) => i.id === issueId);
    if (!issue) throw new Error('Issue record not found');
    if (issue.status === 'RETURNED') throw new Error('Book is already marked returned');

    const now = this.getEffectiveNow();
    issue.returnDate = now.toISOString();

    const book = this.getBookById(issue.bookId);
    if (book) {
      book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
    }

    const dueDate = new Date(issue.dueDate);
    let fineAmount = 0;
    let fineRecord: Fine | undefined;

    if (now > dueDate) {
      const diffMs = now.getTime() - dueDate.getTime();
      const daysOverdue = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      fineAmount = daysOverdue * (this.state.config.finePerDay || 5);
      issue.calculatedFine = fineAmount;

      let existing = this.state.fines.find((f) => f.issueId === issue.id);
      if (!existing) {
        existing = {
          id: `fn_${Date.now()}`,
          issueId: issue.id,
          userId: issue.userId,
          bookId: issue.bookId,
          amount: fineAmount,
          daysOverdue,
          status: 'UNPAID',
          createdAt: now.toISOString(),
        };
        this.state.fines.push(existing);
      } else {
        existing.amount = fineAmount;
        existing.daysOverdue = daysOverdue;
      }
      fineRecord = existing;
    }

    issue.status = 'RETURNED';

    // Mark next in queue ready for pickup
    const pendingRes = this.state.reservations
      .filter((r) => r.bookId === issue.bookId && r.status === 'PENDING')
      .sort((a, b) => a.queuePosition - b.queuePosition);

    if (pendingRes.length > 0) {
      pendingRes[0].status = 'READY_FOR_PICKUP';
    }

    this.saveState();
    return { issue, fineAmount, fineRecord };
  }

  // --- FINES ---
  public getFines(userId?: string): Fine[] {
    this.recalculateOverdue();
    let list = this.state.fines;
    if (userId) {
      list = list.filter((f) => f.userId === userId);
    }
    return list.map((f) => ({
      ...f,
      book: this.getBookById(f.bookId),
      user: this.state.users.find((u) => u.id === f.userId),
    }));
  }

  public payFine(fineId: string): Fine {
    const fine = this.state.fines.find((f) => f.id === fineId);
    if (!fine) throw new Error('Fine not found');
    fine.status = 'PAID';
    fine.paidAt = this.getEffectiveNow().toISOString();

    const issue = this.state.issues.find((i) => i.id === fine.issueId);
    if (issue) {
      issue.finePaid = true;
    }
    this.saveState();
    return fine;
  }

  // --- RESERVATIONS ---
  public getReservations(userId?: string): Reservation[] {
    let list = this.state.reservations;
    if (userId) {
      list = list.filter((r) => r.userId === userId);
    }
    return list.map((r) => ({
      ...r,
      book: this.getBookById(r.bookId),
      user: this.state.users.find((u) => u.id === r.userId),
    }));
  }

  public createReservation(userId: string, bookId: string): Reservation {
    const book = this.getBookById(bookId);
    if (!book) throw new Error('Book not found');

    const existing = this.state.reservations.find(
      (r) => r.bookId === bookId && r.userId === userId && (r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP')
    );
    if (existing) {
      throw new Error('You already have an active advance reservation for this title.');
    }

    const activeRes = this.state.reservations.filter(
      (r) => r.bookId === bookId && (r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP')
    );

    const newRes: Reservation = {
      id: `res_${Date.now()}`,
      bookId,
      userId,
      reservationDate: this.getEffectiveNow().toISOString(),
      status: 'PENDING',
      queuePosition: activeRes.length + 1,
      book,
      user: this.state.users.find((u) => u.id === userId),
    };

    this.state.reservations.push(newRes);
    this.saveState();
    return newRes;
  }

  public cancelReservation(id: string): boolean {
    const res = this.state.reservations.find((r) => r.id === id);
    if (!res) throw new Error('Reservation not found');
    res.status = 'CANCELLED';
    this.saveState();
    return true;
  }

  // --- QUERIES ---
  public getQueries(userId?: string): MemberQuery[] {
    let list = this.state.queries;
    if (userId) {
      list = list.filter((q) => q.userId === userId);
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public submitQuery(data: { userId: string; userName: string; userEmail: string; subject: string; category: string; message: string }): MemberQuery {
    const newQuery: MemberQuery = {
      id: `qry_${Date.now()}`,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      subject: data.subject,
      category: data.category as any,
      message: data.message,
      status: 'PENDING',
      adminReply: null,
      repliedAt: null,
      createdAt: this.getEffectiveNow().toISOString(),
    };
    this.state.queries.unshift(newQuery);
    this.saveState();
    return newQuery;
  }

  public replyQuery(id: string, reply: string): MemberQuery {
    const q = this.state.queries.find((item) => item.id === id);
    if (!q) throw new Error('Query ticket not found');
    q.adminReply = reply;
    q.status = 'RESOLVED';
    q.repliedAt = this.getEffectiveNow().toISOString();
    this.saveState();
    return q;
  }

  // --- STATS ---
  public getStats(): LibraryStats {
    this.recalculateOverdue();
    const totalBooks = this.state.books.reduce((acc, b) => acc + b.quantity, 0);
    const uniqueTitles = this.state.books.length;
    const availableCopies = this.state.books.reduce((acc, b) => acc + b.availableQuantity, 0);
    const issuedCopies = totalBooks - availableCopies;

    const activeIssues = this.state.issues.filter((i) => i.status === 'ISSUED' || i.status === 'OVERDUE').length;
    const overdueIssues = this.state.issues.filter((i) => i.status === 'OVERDUE').length;

    const totalFinesCollected = this.state.fines
      .filter((f) => f.status === 'PAID')
      .reduce((sum, f) => sum + f.amount, 0);
    const pendingFines = this.state.fines
      .filter((f) => f.status === 'UNPAID')
      .reduce((sum, f) => sum + f.amount, 0);

    const totalMembers = this.state.users.filter((u) => u.role === 'USER').length;
    const activeReservations = this.state.reservations.filter((r) => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP').length;
    const pendingQueries = this.state.queries.filter((q) => q.status === 'PENDING').length;

    return {
      totalBooks,
      uniqueTitles,
      availableCopies,
      issuedCopies,
      activeIssues,
      overdueIssues,
      totalFinesCollected,
      pendingFines,
      totalMembers,
      activeReservations,
      pendingQueries,
      finePerDay: this.state.config.finePerDay || 5,
      virtualDaysOffset: this.state.config.virtualDaysOffset || 0,
      effectiveDate: this.getEffectiveNow().toISOString(),
    };
  }

  public setTimeOffset(days: number): LibraryStats {
    this.state.config.virtualDaysOffset = days;
    this.recalculateOverdue();
    this.saveState();
    return this.getStats();
  }

  public resetDemo(): boolean {
    this.state = getInitialState();
    this.saveState();
    return true;
  }
}

export const localDb = new LocalDatabase();
