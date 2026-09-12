package com.library.service;

import com.library.model.Book;
import com.library.repository.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks(String category, String search, Boolean availableOnly) {
        List<Book> books;
        if (search != null && !search.trim().isEmpty()) {
            books = bookRepository.searchBooks(search.trim());
        } else if (category != null && !category.equalsIgnoreCase("All")) {
            books = bookRepository.findByCategoryIgnoreCase(category);
        } else {
            books = bookRepository.findAll();
        }

        if (Boolean.TRUE.equals(availableOnly)) {
            return books.stream().filter(b -> b.getAvailableQuantity() > 0).toList();
        }
        return books;
    }

    public Book getBookById(String id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
    }

    @Transactional
    public Book addBook(Book book) {
        if (book.getId() == null || book.getId().isEmpty()) {
            book.setId("bk_" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (book.getAvailableQuantity() == null) {
            book.setAvailableQuantity(book.getQuantity());
        }
        book.setCreatedAt(LocalDateTime.now());
        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(String id, Book updates) {
        Book existing = getBookById(id);
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getAuthor() != null) existing.setAuthor(updates.getAuthor());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getIsbn() != null) existing.setIsbn(updates.getIsbn());
        if (updates.getShelfLocation() != null) existing.setShelfLocation(updates.getShelfLocation());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getPublishedYear() != null) existing.setPublishedYear(updates.getPublishedYear());
        if (updates.getCoverUrl() != null) existing.setCoverUrl(updates.getCoverUrl());

        if (updates.getQuantity() != null) {
            int delta = updates.getQuantity() - existing.getQuantity();
            existing.setAvailableQuantity(Math.max(0, existing.getAvailableQuantity() + delta));
            existing.setQuantity(updates.getQuantity());
        }

        return bookRepository.save(existing);
    }

    @Transactional
    public void deleteBook(String id) {
        Book existing = getBookById(id);
        int loanedCopies = existing.getQuantity() - existing.getAvailableQuantity();
        if (loanedCopies > 0) {
            throw new RuntimeException("Cannot delete book: " + loanedCopies + " copies currently issued.");
        }
        bookRepository.delete(existing);
    }

    public List<String> getCategories() {
        return bookRepository.findDistinctCategories();
    }
}
