import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: db.getEffectiveNow().toISOString() });
  });

  // --- AUTH ROUTES ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (user.status !== 'ACTIVE' && user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Your account is currently suspended. Please contact library staff.' });
      }

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { name, email, password, phone } = req.body;
      if (!name || !email || !password || !phone) {
        return res.status(400).json({ error: 'All fields (name, email, password, phone) are required.' });
      }

      const newUser = db.createUser({
        name,
        email,
        password,
        phone,
        role: 'USER',
        status: 'ACTIVE',
      });

      const { password: _, ...safeUser } = newUser;
      res.status(201).json({ user: safeUser });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed' });
    }
  });

  // Members list (Admin)
  app.get('/api/members', (_req: Request, res: Response) => {
    try {
      const users = db.getUsers().map(({ password, ...u }) => {
        const issues = db.getIssues(u.id);
        const activeIssues = issues.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE');
        const fines = db.getFines(u.id);
        const unpaidFineSum = fines.filter(f => f.status === 'UNPAID').reduce((sum, f) => sum + f.amount, 0);

        return {
          ...u,
          activeLoansCount: activeIssues.length,
          unpaidFineAmount: unpaidFineSum,
          totalBorrowedCount: issues.length,
        };
      });
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/members/:id/status', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
        return res.status(400).json({ error: 'Status must be ACTIVE or SUSPENDED' });
      }
      const updated = db.updateUserStatus(id, status);
      const { password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- BOOKS ROUTES ---
  app.get('/api/books', (req: Request, res: Response) => {
    try {
      let books = db.getBooks();
      const { category, search, availableOnly } = req.query;

      if (category && typeof category === 'string' && category !== 'All') {
        books = books.filter(b => b.category.toLowerCase() === category.toLowerCase());
      }

      if (search && typeof search === 'string') {
        const q = search.toLowerCase().trim();
        books = books.filter(b =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q)
        );
      }

      if (availableOnly === 'true') {
        books = books.filter(b => b.availableQuantity > 0);
      }

      res.json(books);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/books/:id', (req: Request, res: Response) => {
    const book = db.getBookById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  });

  app.post('/api/books', (req: Request, res: Response) => {
    try {
      const { title, author, isbn, category, quantity, shelfLocation, description, publishedYear, coverUrl } = req.body;
      if (!title || !author || !isbn || !category || quantity === undefined) {
        return res.status(400).json({ error: 'Title, author, ISBN, category, and quantity are required.' });
      }

      const numQuantity = parseInt(quantity, 10);
      if (isNaN(numQuantity) || numQuantity < 1) {
        return res.status(400).json({ error: 'Quantity must be at least 1.' });
      }

      const book = db.addBook({
        title,
        author,
        isbn,
        category,
        quantity: numQuantity,
        availableQuantity: numQuantity,
        shelfLocation: shelfLocation || 'General Stacks',
        description: description || '',
        publishedYear: publishedYear ? parseInt(publishedYear, 10) : new Date().getFullYear(),
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      });

      res.status(201).json(book);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/books/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      if (updates.quantity !== undefined) {
        updates.quantity = parseInt(updates.quantity, 10);
      }
      if (updates.publishedYear !== undefined) {
        updates.publishedYear = parseInt(updates.publishedYear, 10);
      }
      const updated = db.updateBook(id, updates);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/books/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      db.deleteBook(id);
      res.json({ success: true, message: 'Book deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/categories', (_req: Request, res: Response) => {
    try {
      const books = db.getBooks();
      const catMap: Record<string, number> = {};
      books.forEach(b => {
        catMap[b.category] = (catMap[b.category] || 0) + 1;
      });
      const categories = Object.keys(catMap).map(name => ({
        name,
        count: catMap[name],
      }));
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- ISSUES & CIRCULATION ---
  app.get('/api/issues', (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      const issues = db.getIssues(userId as string | undefined);
      res.json(issues);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/issues', (req: Request, res: Response) => {
    try {
      const { userId, bookId, loanDays } = req.body;
      if (!userId || !bookId) {
        return res.status(400).json({ error: 'userId and bookId are required.' });
      }
      const issue = db.issueBook(userId, bookId, loanDays ? parseInt(loanDays, 10) : 14);
      res.status(201).json(issue);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/issues/:id/return', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = db.returnBook(id);
      res.json({
        message: result.fineAmount > 0
          ? `Book returned with overdue fine of ₹${result.fineAmount}`
          : 'Book returned successfully with zero fine',
        ...result,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- FINES ---
  app.get('/api/fines', (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      const fines = db.getFines(userId as string | undefined);
      res.json(fines);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/fines/:id/pay', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const paidFine = db.payFine(id);
      res.json({ message: 'Fine marked as paid successfully', fine: paidFine });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- ADVANCE RESERVATIONS ---
  app.get('/api/reservations', (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      const reservations = db.getReservations(userId as string | undefined);
      res.json(reservations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/reservations', (req: Request, res: Response) => {
    try {
      const { userId, bookId } = req.body;
      if (!userId || !bookId) {
        return res.status(400).json({ error: 'userId and bookId are required.' });
      }
      const reservation = db.createReservation(userId, bookId);
      res.status(201).json(reservation);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/reservations/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      db.cancelReservation(id, userId);
      res.json({ success: true, message: 'Reservation cancelled' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- CONTACT / QUERIES ---
  app.get('/api/queries', (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      const queries = db.getQueries(userId as string | undefined);
      res.json(queries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/queries', (req: Request, res: Response) => {
    try {
      const { userId, userName, userEmail, subject, category, message } = req.body;
      if (!userId || !userName || !userEmail || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
      const query = db.createQuery({
        userId,
        userName,
        userEmail,
        subject,
        category: category || 'General',
        message,
      });
      res.status(201).json(query);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/queries/:id/reply', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;
      if (!reply) {
        return res.status(400).json({ error: 'Reply text is required' });
      }
      const updated = db.replyQuery(id, reply);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- STATS & SCHEMA ---
  app.get('/api/stats', (_req: Request, res: Response) => {
    try {
      const stats = db.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/schema', (_req: Request, res: Response) => {
    try {
      const schemaPath = path.join(process.cwd(), 'server', 'schema.sql');
      const ddl = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf-8') : '';
      res.json({
        engine: 'MySQL 8.0 / SQLite 3 Compatible',
        ddl,
        tables: ['users', 'books', 'book_issues', 'fines', 'reservations', 'member_queries'],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- TIME SIMULATOR & DEMO RESET ---
  app.post('/api/system/time-offset', (req: Request, res: Response) => {
    try {
      const { days } = req.body;
      const parsedDays = parseInt(days, 10);
      const config = db.setTimeOffset(isNaN(parsedDays) ? 0 : parsedDays);
      res.json({ message: `System date adjusted by ${days} days`, config });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/system/reset-demo', (_req: Request, res: Response) => {
    try {
      db.resetData();
      res.json({ message: 'Demo data and system state reset successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digital Library System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
