package com.library.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "book_issues")
public class BookIssue {

    @Id
    private String id;

    @Column(name = "book_id", nullable = false)
    private String bookId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "issue_date", nullable = false)
    private LocalDateTime issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "return_date")
    private LocalDateTime returnDate;

    @Column(nullable = false, length = 20)
    private String status; // "ISSUED", "RETURNED", "OVERDUE"

    @Transient
    private Book book;

    @Transient
    private User user;

    @Transient
    private Double calculatedFine;

    @Transient
    private Boolean finePaid;

    public BookIssue() {
    }

    public BookIssue(String id, String bookId, String userId, LocalDateTime issueDate,
                     LocalDateTime dueDate, LocalDateTime returnDate, String status) {
        this.id = id;
        this.bookId = bookId;
        this.userId = userId;
        this.issueDate = issueDate;
        this.dueDate = dueDate;
        this.returnDate = returnDate;
        this.status = status;
    }

    @PrePersist
    public void prePersist() {
        if (this.issueDate == null) {
            this.issueDate = LocalDateTime.now();
        }
        if (this.dueDate == null) {
            this.dueDate = this.issueDate.plusDays(14);
        }
        if (this.status == null) {
            this.status = "ISSUED";
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDateTime issueDate) { this.issueDate = issueDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDateTime returnDate) { this.returnDate = returnDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getCalculatedFine() { return calculatedFine; }
    public void setCalculatedFine(Double calculatedFine) { this.calculatedFine = calculatedFine; }

    public Boolean getFinePaid() { return finePaid; }
    public void setFinePaid(Boolean finePaid) { this.finePaid = finePaid; }

    // Builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String bookId;
        private String userId;
        private LocalDateTime issueDate;
        private LocalDateTime dueDate;
        private LocalDateTime returnDate;
        private String status;

        public Builder id(String id) { this.id = id; return this; }
        public Builder bookId(String bookId) { this.bookId = bookId; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder issueDate(LocalDateTime issueDate) { this.issueDate = issueDate; return this; }
        public Builder dueDate(LocalDateTime dueDate) { this.dueDate = dueDate; return this; }
        public Builder returnDate(LocalDateTime returnDate) { this.returnDate = returnDate; return this; }
        public Builder status(String status) { this.status = status; return this; }

        public BookIssue build() {
            return new BookIssue(id, bookId, userId, issueDate, dueDate, returnDate, status);
        }
    }
}
