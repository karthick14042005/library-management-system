-- Seed Users
MERGE INTO users (id, member_id, name, email, password_hash, role, phone, status, joined_at)
KEY(id)
VALUES
('usr_admin_1', 'LIB-ADM-001', 'Chief Librarian Sarah Jenkins', 'admin@library.gov', 'admin123', 'ADMIN', '+91 98765 43210', 'ACTIVE', CURRENT_TIMESTAMP),
('usr_user_1', 'LIB-MEM-101', 'Rohit Sharma', 'rohit@example.com', 'user123', 'USER', '+91 98111 22334', 'ACTIVE', CURRENT_TIMESTAMP),
('usr_user_2', 'LIB-MEM-102', 'Priya Nair', 'priya@example.com', 'user123', 'USER', '+91 98222 33445', 'ACTIVE', CURRENT_TIMESTAMP),
('usr_user_3', 'LIB-MEM-103', 'Arjun Verma', 'arjun@example.com', 'user123', 'USER', '+91 98333 44556', 'SUSPENDED', CURRENT_TIMESTAMP);

-- Seed Books
MERGE INTO books (id, title, author, isbn, category, quantity, available_quantity, shelf_location, description, published_year, cover_url, created_at)
KEY(id)
VALUES
('bk_1', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Computer Science', 5, 3, 'Rack CS-101', 'Agile software craftsmanship and refactoring patterns.', 2008, 'https://images.unsplash.com/photo-1532012164546-f432f2e3ddb5?w=600&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP),
('bk_2', 'Introduction to Algorithms (CLRS)', 'Thomas H. Cormen, Charles E. Leiserson', '978-0262033848', 'Computer Science', 4, 2, 'Rack CS-102', 'Leading algorithms and data structures textbook.', 2009, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP),
('bk_3', 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', '978-0201633610', 'Software Engineering', 3, 0, 'Rack SE-204', 'Classic 23 GoF design patterns in OOP.', 1994, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP),
('bk_4', 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 'Literature', 6, 5, 'Rack LIT-301', 'Jazz age novel on the elusive American Dream.', 1925, 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP),
('bk_5', 'Database System Concepts (Silberschatz)', 'Abraham Silberschatz, Henry F. Korth', '978-0078022159', 'Computer Science', 4, 3, 'Rack DB-401', 'Definitive textbook on relational databases, SQL and indexing.', 2019, 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP),
('bk_6', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '978-0062316097', 'History', 5, 4, 'Rack HIST-105', 'Human history through cognitive, agricultural, and scientific eras.', 2014, 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP),
('bk_7', 'Dune', 'Frank Herbert', '978-0441172719', 'Science Fiction', 4, 4, 'Rack SCI-202', 'Epic sci-fi masterpiece on Arrakis.', 1965, 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP),
('bk_8', 'Linear Algebra and Its Applications', 'Gilbert Strang', '978-0030105678', 'Mathematics', 3, 2, 'Rack MATH-108', 'Matrix theory, eigenvalues and vector spaces.', 2016, 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80', CURRENT_TIMESTAMP);
