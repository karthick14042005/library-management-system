# Digital Library Management System (DLMS)

An enterprise-grade, full-stack **Digital Library Management System** designed for academic institutions, libraries, and student circulation desks. Features separate **Admin (Librarian)** and **User (Student/Faculty)** role-based portals, physical inventory tracking, automated overdue fine calculation, advance booking queues, and member help-desk query ticketing.

---

## 🏛 Project Architecture & Tech Stack

This project is engineered to provide both **Node.js/Express** and **Java Spring Boot** backend implementations alongside a modern **React + TypeScript + Tailwind CSS** frontend and **MySQL/SQLite** relational database models:

| Layer | Technologies | Key Modules |
|---|---|---|
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, Lucide Icons | Catalogue, Circulation Ledger, Fines Desk, Reservations Queue, Help Desk, Schema Inspector |
| **Full-Stack Node Server** | Node.js, Express, ESBuild, TSX | RESTful APIs on `/api/*`, Vite SSR/SPA integration, persistent JSON store |
| **Java Internship Backend** | Java 17+, Spring Boot 3.x, Spring Data JPA, Hibernate, Maven | `java-backend/` with Controllers, Services, Repositories, JPA Entities, `schema.sql` |
| **Relational Database** | MySQL 8.0+ / SQLite 3 / H2 In-Memory | 6 Normalized tables: `users`, `books`, `book_issues`, `fines`, `reservations`, `member_queries` |
| **Zero-Config Deployment** | Vercel, Netlify, Render, Cloud Run | `vercel.json` + Universal Dual-Mode Hybrid Fallback Adapter |

---

## 🚀 How to Run in VS Code (Quick Start)

### Prerequisites:
- **Node.js**: v18 or higher (`node -v`)
- **Java**: JDK 17 or higher (`java -version`) *(if running Spring Boot backend)*
- **Maven**: 3.8+ (`mvn -v`) *(optional, wrapper or standalone)*

### 1. Frontend & Full-Stack Node Environment:
```bash
# 1. Install all dependencies (includes @types/react and @types/react-dom to fix VS Code red lines)
npm install

# 2. Run the development server (bootstraps backend and frontend on port 3000)
npm run dev

# 3. Open in browser:
# http://localhost:3000
```

### 2. Java Spring Boot Backend (For Java Internship Submission):
The Java backend is located in the `java-backend/` folder:
```bash
# Navigate to java backend folder
cd java-backend

# Run Spring Boot application (uses default H2 in-memory MySQL mode with seed data)
mvn spring-boot:run

# Backend runs at:
# http://localhost:8080/api/books
# http://localhost:8080/api/stats
# H2 Database console: http://localhost:8080/h2-console
```

To switch Spring Boot to a local **MySQL** instance, edit `java-backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/library_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

---

## 🌐 Deploying to Vercel / Netlify / Cloud Run

This project includes **Universal Dual-Mode Architecture**:
1. **Vercel / Netlify (Static Hosting)**:
   - When deployed to Vercel, the frontend automatically falls back to `localStore.ts` whenever server-side routes return 404.
   - **No 404 errors!** All catalogue browsing, user authentication, book issuing, overdue fine calculation, and advance bookings function 100% seamlessly in the browser.
2. **Cloud Run / Render / Heroku (Full-Stack Container)**:
   - Runs `node dist/server.cjs` serving both the Express REST API and static assets from a single container on port 3000.

---

## 🔑 Demonstration User Accounts

| Role | Name | Email | Password | Access Rights |
|---|---|---|---|---|
| **ADMIN** | Chief Librarian Sarah Jenkins | `admin@library.gov` | `admin123` | Add/Edit/Delete Books, Circulation Table, Member Directory, Fine Payments, Reply Queries, MySQL Schema |
| **USER** | Rohit Sharma | `rohit@example.com` | `user123` | Browse Catalogue, Search, Issue Books, Return Books, Pay Fines, Place Reservations, Submit Queries |
| **USER** | Priya Nair | `priya@example.com` | `user123` | Browse Catalogue, Claim Reserved Books, View Loan History |
| **USER (Suspended)** | Arjun Verma | `arjun@example.com` | `user123` | Account suspended due to overdue loans (demonstrates borrowing suspension rule) |

---

## 📋 Feature Checklist Implementation

### Admin Module:
- [x] **Admin Authentication**: Privileged login with master controls.
- [x] **Catalogue Management**: Add, update, and delete books (Title, Author, ISBN, Category, Quantity, Shelf Location, Cover URL, Description).
- [x] **Issue Registry**: Live monitor of all active loans, borrowers, due dates, and remaining days countdown.
- [x] **Member Account Control**: View registered users, active loan counts, unpaid dues, and toggle Active/Suspended status.
- [x] **Fine Clearance**: Official fines ledger to mark penalties as paid and issue clearance receipts.
- [x] **Help Desk Management**: View incoming inquiries and submit official replies to members.
- [x] **MySQL Schema Inspector**: Interactive entity viewer with foreign keys, column types, and raw DDL script.

### User Module:
- [x] **Registration & Login**: Automatic student/faculty member ID generation (`LIB-MEM-101`).
- [x] **Catalogue Browsing**: Filter by genre pills (Computer Science, Literature, Mathematics, History, etc.).
- [x] **Live Search**: Instant keyword search across title, author, and ISBN.
- [x] **Book Issuing**: 14-day loan duration with automatic shelf quantity decrement.
- [x] **Book Returns**: Check-in books with inventory replenishment and automated overdue assessment.
- [x] **Overdue Fine Engine**: Automatically calculates **₹5 per day past due date**. Includes an interactive simulation tool (+7d, +15d, +30d) in the header to fast-forward time and test fine calculations.
- [x] **Advance Bookings (Reservations)**: Reserve checked-out titles with queue positions (#1, #2). Automatically notifies and marks "Ready for Pickup" when copies are returned.
- [x] **Inquiry Desk**: Direct query submission form for book requests and loan assistance.

---

## 🗄 Relational Database Schema (MySQL DDL)

```sql
CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- 1. Users Table
CREATE TABLE users (
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

-- 2. Books Table
CREATE TABLE books (
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

-- 3. Book Issues (Circulation)
CREATE TABLE book_issues (
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

-- 4. Fines Ledger (₹5 / overdue day)
CREATE TABLE fines (
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

-- 5. Advance Reservations Queue
CREATE TABLE reservations (
  id VARCHAR(36) PRIMARY KEY,
  book_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  reservation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('PENDING', 'READY_FOR_PICKUP', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  queue_position INT NOT NULL DEFAULT 1,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 6. Member Queries & Help Desk
CREATE TABLE member_queries (
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
);
```

---

## 📦 Directory Layout

```
digital-library-management-system/
├── package.json              # Frontend & Node full-stack config
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite bundler & Tailwind configuration
├── vercel.json               # Vercel deployment routing rules
├── index.html                # HTML entry point with Google Fonts
├── server.ts                 # Full-stack Node.js Express server
├── server/                   # Express backend modules & schema
│   ├── db.ts                 # Relational database engine
│   ├── types.ts              # Data contracts
│   └── schema.sql            # MySQL schema
├── src/                      # React Frontend application
│   ├── App.tsx               # Master dashboard & navigation router
│   ├── components/           # UI components (Books, Fines, Issues, etc.)
│   ├── services/
│   │   ├── api.ts            # Dual-mode HTTP & fallback client
│   │   └── localStore.ts     # Client-side relational fallback store
│   └── types.ts              # Shared TypeScript definitions
└── java-backend/             # Java Spring Boot Internship Backend
    ├── pom.xml               # Maven configuration
    └── src/main/
        ├── java/com/library/
        │   ├── DigitalLibraryApplication.java
        │   ├── config/       # CORS and security
        │   ├── controller/   # REST API endpoints
        │   ├── dto/          # Request/Response payloads
        │   ├── model/        # JPA Entities (User, Book, Issue, Fine, etc.)
        │   ├── repository/   # Spring Data JPA repositories
        │   └── service/      # Business logic & circulation rules
        └── resources/
            ├── application.properties
            ├── schema.sql
            └── data.sql
```
