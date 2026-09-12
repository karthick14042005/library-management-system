import fs from 'fs';
import path from 'path';
import {
  LibraryDatabase,
  User,
  Book,
  BookIssue,
  Fine,
  Reservation,
  MemberQuery,
} from './types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'library.json');

const INITIAL_DATA: LibraryDatabase = {
  config: {
    virtualDaysOffset: 0,
    finePerDay: 5, // ₹5 per day
  },
  users: [
    {
      id: 'usr_admin_1',
      memberId: 'LIB-ADM-001',
      name: 'Chief Librarian Sarah Jenkins',
      email: 'admin@library.gov',
      password: 'admin123',
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
      password: 'user123',
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
      password: 'user123',
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
      password: 'user123',
      role: 'USER',
      phone: '+91 98333 44556',
      status: 'SUSPENDED',
      joinedAt: '2025-05-18T16:45:00.000Z',
    }
  ],
  books: [
    {
      id: 'bk_1',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Computer Science',
      quantity: 5,
      availableQuantity: 3,
      shelfLocation: 'Rack CS-101',
      description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.',
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
      description: 'Comprehensive update of the leading algorithms textbook, covering modern algorithms, data structures, dynamic programming, graph theory, and computational complexity.',
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
      availableQuantity: 0, // Out of stock to test advance booking/reservation!
      shelfLocation: 'Rack SE-204',
      description: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.',
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
      description: 'Explores how an insignificant ape became the ruler of planet Earth, covering evolutionary biology, cognitive revolutions, agriculture, and money.',
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
  ],
  issues: [
    {
      id: 'iss_1',
      bookId: 'bk_1',
      userId: 'usr_user_1',
      // Issued 20 days ago, due 6 days ago (overdue by 6 days!)
      issueDate: new Date(Date.now() - 20 * 86400000).toISOString(),
      dueDate: new Date(Date.now() - 6 * 86400000).toISOString(),
      returnDate: null,
      status: 'OVERDUE',
      calculatedFine: 30, // 6 days * ₹5
      finePaid: false,
    },
    {
      id: 'iss_2',
      bookId: 'bk_2',
      userId: 'usr_user_2',
      // Issued 4 days ago, due in 10 days
      issueDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      returnDate: null,
      status: 'ISSUED',
      calculatedFine: 0,
      finePaid: false,
    },
    {
      id: 'iss_3',
      bookId: 'bk_3',
      userId: 'usr_user_1',
      issueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      dueDate: new Date(Date.now() + 12 * 86400000).toISOString(),
      returnDate: null,
      status: 'ISSUED',
      calculatedFine: 0,
      finePaid: false,
    },
    {
      id: 'iss_4',
      bookId: 'bk_3',
      userId: 'usr_user_3',
      issueDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
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
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
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
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      paidAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    }
  ],
  reservations: [
    {
      id: 'res_1',
      bookId: 'bk_3', // Design Patterns (0 copies currently available)
      userId: 'usr_user_2',
      reservationDate: new Date(Date.now() - 1 * 86400000).toISOString(),
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
      message: 'Could the library please consider acquiring Martin Kleppmann\'s "Designing Data-Intensive Applications" (O\'Reilly)? Multiple students in CS require it.',
      status: 'PENDING',
      adminReply: null,
      repliedAt: null,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
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
      repliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    }
  ]
};

class DatabaseManager {
  private db: LibraryDatabase;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
    this.recalculateOverdueAndFines();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): LibraryDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        return {
          config: { ...INITIAL_DATA.config, ...parsed.config },
          users: parsed.users || INITIAL_DATA.users,
          books: parsed.books || INITIAL_DATA.books,
          issues: parsed.issues || INITIAL_DATA.issues,
          fines: parsed.fines || INITIAL_DATA.fines,
          reservations: parsed.reservations || INITIAL_DATA.reservations,
          queries: parsed.queries || INITIAL_DATA.queries,
        };
      }
    } catch (e) {
      console.error('Error loading database file, initializing default:', e);
    }
    this.saveToDisk(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  private saveToDisk(data?: LibraryDatabase) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to disk:', err);
    }
  }

  public getEffectiveNow(): Date {
    const base = new Date();
    const offsetMs = (this.db.config.virtualDaysOffset || 0) * 86400000;
    return new Date(base.getTime() + offsetMs);
  }

  public recalculateOverdueAndFines(persist: boolean = false) {
    const now = this.getEffectiveNow();
    const fineRate = this.db.config.finePerDay || 5;
    let changed = false;

    for (const issue of this.db.issues) {
      if (issue.status === 'RETURNED') continue;

      const dueDate = new Date(issue.dueDate);
      if (now > dueDate) {
        if (issue.status !== 'OVERDUE') {
          issue.status = 'OVERDUE';
          changed = true;
        }
        const diffMs = now.getTime() - dueDate.getTime();
        const daysOverdue = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const fineAmount = daysOverdue * fineRate;
        if (issue.calculatedFine !== fineAmount) {
          issue.calculatedFine = fineAmount;
          changed = true;
        }

        // Upsert fine in fines table
        const existingFine = this.db.fines.find((f) => f.issueId === issue.id);
        if (existingFine) {
          if (existingFine.status === 'UNPAID') {
            if (existingFine.amount !== fineAmount || existingFine.daysOverdue !== daysOverdue) {
              existingFine.amount = fineAmount;
              existingFine.daysOverdue = daysOverdue;
              changed = true;
            }
          }
        } else {
          this.db.fines.push({
            id: `fn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            issueId: issue.id,
            userId: issue.userId,
            bookId: issue.bookId,
            amount: fineAmount,
            daysOverdue,
            status: 'UNPAID',
            createdAt: now.toISOString(),
          });
          changed = true;
        }
      } else {
        if (issue.status !== 'ISSUED') {
          issue.status = 'ISSUED';
          changed = true;
        }
        if (issue.calculatedFine !== 0) {
          issue.calculatedFine = 0;
          changed = true;
        }
      }
    }
    if (persist && changed) {
      this.saveToDisk();
    }
  }

  // --- CONFIG / TIME SIMULATION ---
  public getConfig() {
    return {
      ...this.db.config,
      effectiveDate: this.getEffectiveNow().toISOString(),
    };
  }

  public setTimeOffset(days: number) {
    this.db.config.virtualDaysOffset = days;
    this.recalculateOverdueAndFines();
    this.saveToDisk();
    return this.getConfig();
  }

  public resetData() {
    this.db = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.db.config.virtualDaysOffset = 0;
    this.recalculateOverdueAndFines();
    this.saveToDisk();
    return true;
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.db.users;
  }

  public getUserById(id: string): User | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public createUser(user: Omit<User, 'id' | 'memberId' | 'joinedAt'>): User {
    const existing = this.getUserByEmail(user.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }
    const count = this.db.users.filter((u) => u.role === 'USER').length + 1;
    const memberId = `LIB-MEM-${100 + count}`;
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}`,
      memberId,
      joinedAt: this.getEffectiveNow().toISOString(),
    };
    this.db.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }

  public updateUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): User {
    const user = this.getUserById(id);
    if (!user) throw new Error('User not found');
    user.status = status;
    this.saveToDisk();
    return user;
  }

  // --- BOOKS ---
  public getBooks(): Book[] {
    return this.db.books;
  }

  public getBookById(id: string): Book | undefined {
    return this.db.books.find((b) => b.id === id);
  }

  public addBook(data: Omit<Book, 'id' | 'createdAt'>): Book {
    if (data.availableQuantity > data.quantity) {
      data.availableQuantity = data.quantity;
    }
    const newBook: Book = {
      ...data,
      id: `bk_${Date.now()}`,
      createdAt: this.getEffectiveNow().toISOString(),
    };
    this.db.books.push(newBook);
    this.saveToDisk();
    return newBook;
  }

  public updateBook(id: string, updates: Partial<Book>): Book {
    const book = this.getBookById(id);
    if (!book) throw new Error('Book not found');

    const currentlyIssued = book.quantity - book.availableQuantity;
    if (updates.quantity !== undefined && updates.quantity < currentlyIssued) {
      throw new Error(`Total copies cannot be less than currently issued count (${currentlyIssued}).`);
    }

    if (updates.quantity !== undefined && updates.availableQuantity === undefined) {
      // Adjust available quantity by change in total quantity
      const delta = updates.quantity - book.quantity;
      book.availableQuantity = Math.max(0, book.availableQuantity + delta);
      book.quantity = updates.quantity;
    }

    Object.assign(book, updates);
    this.saveToDisk();
    return book;
  }

  public deleteBook(id: string): boolean {
    const book = this.getBookById(id);
    if (!book) throw new Error('Book not found');
    const activeIssues = this.db.issues.filter(
      (i) => i.bookId === id && (i.status === 'ISSUED' || i.status === 'OVERDUE')
    );
    if (activeIssues.length > 0) {
      throw new Error(`Cannot delete book: ${activeIssues.length} copy/copies are currently issued.`);
    }
    this.db.books = this.db.books.filter((b) => b.id !== id);
    this.db.reservations = this.db.reservations.filter((r) => r.bookId !== id);
    this.saveToDisk();
    return true;
  }

  // --- ISSUES & CIRCULATION ---
  public getIssues(userId?: string): (BookIssue & { book?: Book; user?: User })[] {
    this.recalculateOverdueAndFines();
    let issues = this.db.issues;
    if (userId) {
      issues = issues.filter((i) => i.userId === userId);
    }
    return issues.map((issue) => ({
      ...issue,
      book: this.getBookById(issue.bookId),
      user: this.getUserById(issue.userId),
    }));
  }

  public issueBook(userId: string, bookId: string, loanDays: number = 14): BookIssue {
    this.recalculateOverdueAndFines();

    const user = this.getUserById(userId);
    if (!user) throw new Error('Member account not found.');
    if (user.status !== 'ACTIVE') {
      throw new Error('Your library membership is currently suspended. Please contact the administrator.');
    }

    // Check unpaid fines: if user has unpaid fines > ₹50, block further issues
    const unpaidFines = this.db.fines.filter((f) => f.userId === userId && f.status === 'UNPAID');
    const totalUnpaid = unpaidFines.reduce((acc, f) => acc + f.amount, 0);
    if (totalUnpaid > 50) {
      throw new Error(`Cannot issue book: Member has ₹${totalUnpaid} in unpaid overdue fines. Please clear fines first.`);
    }

    const book = this.getBookById(bookId);
    if (!book) throw new Error('Book not found.');
    if (book.availableQuantity <= 0) {
      throw new Error('All physical copies of this title are currently issued. You can place an Advance Reservation.');
    }

    // Check if user already has an active issue of this book
    const existingIssue = this.db.issues.find(
      (i) => i.bookId === bookId && i.userId === userId && (i.status === 'ISSUED' || i.status === 'OVERDUE')
    );
    if (existingIssue) {
      throw new Error('You already have an active loan for this book.');
    }

    const now = this.getEffectiveNow();
    const dueDate = new Date(now.getTime() + loanDays * 86400000);

    // Decrement available copies
    book.availableQuantity -= 1;

    // Fulfill reservation if this user was at the front of the queue
    const userRes = this.db.reservations.find(
      (r) => r.bookId === bookId && r.userId === userId && r.status === 'PENDING'
    );
    if (userRes) {
      userRes.status = 'FULFILLED';
      this.reorderReservationQueue(bookId);
    }

    const newIssue: BookIssue = {
      id: `iss_${Date.now()}`,
      bookId,
      userId,
      issueDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
      status: 'ISSUED',
      calculatedFine: 0,
      finePaid: false,
    };

    this.db.issues.push(newIssue);
    this.saveToDisk();
    return newIssue;
  }

  public returnBook(issueId: string): { issue: BookIssue; fineAmount: number; fineRecord?: Fine } {
    this.recalculateOverdueAndFines();

    const issue = this.db.issues.find((i) => i.id === issueId);
    if (!issue) throw new Error('Issue record not found');
    if (issue.status === 'RETURNED') throw new Error('Book is already returned');

    const now = this.getEffectiveNow();
    issue.returnDate = now.toISOString();

    const book = this.getBookById(issue.bookId);
    if (book) {
      book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
    }

    // Check overdue
    const dueDate = new Date(issue.dueDate);
    let fineAmount = 0;
    let fineRecord: Fine | undefined;

    if (now > dueDate) {
      const diffMs = now.getTime() - dueDate.getTime();
      const daysOverdue = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      fineAmount = daysOverdue * (this.db.config.finePerDay || 5);
      issue.calculatedFine = fineAmount;

      // Check existing fine or create
      let existing = this.db.fines.find((f) => f.issueId === issue.id);
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
        this.db.fines.push(existing);
      } else {
        existing.amount = fineAmount;
        existing.daysOverdue = daysOverdue;
      }
      fineRecord = existing;
    }

    issue.status = 'RETURNED';

    // If there's an advance reservation for this book, mark the first in line as READY_FOR_PICKUP
    const pendingReservations = this.db.reservations
      .filter((r) => r.bookId === issue.bookId && r.status === 'PENDING')
      .sort((a, b) => a.queuePosition - b.queuePosition);

    if (pendingReservations.length > 0) {
      pendingReservations[0].status = 'READY_FOR_PICKUP';
    }

    this.saveToDisk();
    return { issue, fineAmount, fineRecord };
  }

  // --- FINES ---
  public getFines(userId?: string): (Fine & { book?: Book; user?: User; issue?: BookIssue })[] {
    this.recalculateOverdueAndFines();
    let list = this.db.fines;
    if (userId) {
      list = list.filter((f) => f.userId === userId);
    }
    return list.map((f) => ({
      ...f,
      book: this.getBookById(f.bookId),
      user: this.getUserById(f.userId),
      issue: this.db.issues.find((i) => i.id === f.issueId),
    }));
  }

  public payFine(fineId: string): Fine {
    const fine = this.db.fines.find((f) => f.id === fineId);
    if (!fine) throw new Error('Fine record not found');
    fine.status = 'PAID';
    fine.paidAt = this.getEffectiveNow().toISOString();

    const issue = this.db.issues.find((i) => i.id === fine.issueId);
    if (issue) {
      issue.finePaid = true;
    }

    this.saveToDisk();
    return fine;
  }

  // --- ADVANCE RESERVATIONS ---
  public getReservations(userId?: string): (Reservation & { book?: Book; user?: User })[] {
    let list = this.db.reservations;
    if (userId) {
      list = list.filter((r) => r.userId === userId);
    }
    return list.map((r) => ({
      ...r,
      book: this.getBookById(r.bookId),
      user: this.getUserById(r.userId),
    }));
  }

  public createReservation(userId: string, bookId: string): Reservation {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const book = this.getBookById(bookId);
    if (!book) throw new Error('Book not found');

    // Check if user already reserved
    const existing = this.db.reservations.find(
      (r) => r.bookId === bookId && r.userId === userId && (r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP')
    );
    if (existing) {
      throw new Error('You already have an active advance reservation for this title.');
    }

    const activeReservations = this.db.reservations.filter(
      (r) => r.bookId === bookId && (r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP')
    );
    const queuePosition = activeReservations.length + 1;

    const newRes: Reservation = {
      id: `res_${Date.now()}`,
      bookId,
      userId,
      reservationDate: this.getEffectiveNow().toISOString(),
      status: 'PENDING',
      queuePosition,
    };

    this.db.reservations.push(newRes);
    this.saveToDisk();
    return newRes;
  }

  public cancelReservation(id: string, userId?: string): boolean {
    const res = this.db.reservations.find((r) => r.id === id);
    if (!res) throw new Error('Reservation not found');
    if (userId && res.userId !== userId) throw new Error('Unauthorized');

    res.status = 'CANCELLED';
    this.reorderReservationQueue(res.bookId);
    this.saveToDisk();
    return true;
  }

  private reorderReservationQueue(bookId: string) {
    const pending = this.db.reservations
      .filter((r) => r.bookId === bookId && (r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP'))
      .sort((a, b) => new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime());

    pending.forEach((res, index) => {
      res.queuePosition = index + 1;
    });
  }

  // --- QUERIES / CONTACT ---
  public getQueries(userId?: string): MemberQuery[] {
    let list = this.db.queries;
    if (userId) {
      list = list.filter((q) => q.userId === userId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createQuery(data: Omit<MemberQuery, 'id' | 'status' | 'createdAt' | 'adminReply' | 'repliedAt'>): MemberQuery {
    const query: MemberQuery = {
      ...data,
      id: `qry_${Date.now()}`,
      status: 'PENDING',
      adminReply: null,
      repliedAt: null,
      createdAt: this.getEffectiveNow().toISOString(),
    };
    this.db.queries.unshift(query);
    this.saveToDisk();
    return query;
  }

  public replyQuery(id: string, reply: string): MemberQuery {
    const query = this.db.queries.find((q) => q.id === id);
    if (!query) throw new Error('Query not found');
    query.adminReply = reply;
    query.status = 'RESOLVED';
    query.repliedAt = this.getEffectiveNow().toISOString();
    this.saveToDisk();
    return query;
  }

  // --- STATS ---
  public getStats() {
    this.recalculateOverdueAndFines();
    const totalBooks = this.db.books.reduce((acc, b) => acc + b.quantity, 0);
    const uniqueTitles = this.db.books.length;
    const availableCopies = this.db.books.reduce((acc, b) => acc + b.availableQuantity, 0);
    const issuedCopies = totalBooks - availableCopies;

    const activeIssues = this.db.issues.filter((i) => i.status === 'ISSUED' || i.status === 'OVERDUE').length;
    const overdueIssues = this.db.issues.filter((i) => i.status === 'OVERDUE').length;

    const totalFinesCollected = this.db.fines
      .filter((f) => f.status === 'PAID')
      .reduce((acc, f) => acc + f.amount, 0);
    const pendingFines = this.db.fines
      .filter((f) => f.status === 'UNPAID')
      .reduce((acc, f) => acc + f.amount, 0);

    const totalMembers = this.db.users.filter((u) => u.role === 'USER').length;
    const activeReservations = this.db.reservations.filter((r) => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP').length;
    const pendingQueries = this.db.queries.filter((q) => q.status === 'PENDING').length;

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
      finePerDay: this.db.config.finePerDay || 5,
      virtualDaysOffset: this.db.config.virtualDaysOffset || 0,
      effectiveDate: this.getEffectiveNow().toISOString(),
    };
  }
}

export const db = new DatabaseManager();
