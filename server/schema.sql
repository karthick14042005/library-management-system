-- ==========================================================
-- DIGITAL LIBRARY MANAGEMENT SYSTEM DATABASE SCHEMA (MySQL / SQLite)
-- Relational Schema with Foreign Keys, Constraints, and Indexes
-- ==========================================================

-- 1. Users / Members Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    member_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    phone VARCHAR(20) NOT NULL,
    status ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
);

-- 2. Book Catalogue Table
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    available_quantity INT NOT NULL CHECK (available_quantity >= 0 AND available_quantity <= quantity),
    shelf_location VARCHAR(50) DEFAULT 'Main Stacks',
    description TEXT,
    published_year INT,
    cover_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_book_category (category),
    INDEX idx_book_isbn (isbn),
    INDEX idx_book_title_author (title, author)
);

-- 3. Book Issues / Circulation Table
CREATE TABLE IF NOT EXISTS book_issues (
    id VARCHAR(36) PRIMARY KEY,
    book_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP NULL,
    status ENUM('ISSUED', 'RETURNED', 'OVERDUE') NOT NULL DEFAULT 'ISSUED',
    calculated_fine DECIMAL(10, 2) DEFAULT 0.00,
    fine_paid BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_issue_status (status),
    INDEX idx_issue_user (user_id),
    INDEX idx_issue_due (due_date)
);

-- 4. Fines Table (Rate: ₹5 per overdue day)
CREATE TABLE IF NOT EXISTS fines (
    id VARCHAR(36) PRIMARY KEY,
    issue_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    book_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    days_overdue INT NOT NULL DEFAULT 0,
    status ENUM('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (issue_id) REFERENCES book_issues(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
    INDEX idx_fine_user (user_id),
    INDEX idx_fine_status (status)
);

-- 5. Advance Bookings / Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id VARCHAR(36) PRIMARY KEY,
    book_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'READY_FOR_PICKUP', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    queue_position INT NOT NULL DEFAULT 1,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_res_book (book_id),
    INDEX idx_res_user (user_id)
);

-- 6. Member Queries & Contact Messages Table
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_query_status (status)
);
