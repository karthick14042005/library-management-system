package com.library.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fines")
public class Fine {

    @Id
    private String id;

    @Column(name = "issue_id", nullable = false)
    private String issueId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "book_id", nullable = false)
    private String bookId;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "days_overdue", nullable = false)
    private Integer daysOverdue;

    @Column(nullable = false, length = 20)
    private String status; // "UNPAID", "PAID"

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Transient
    private Book book;

    @Transient
    private User user;

    public Fine() {
    }

    public Fine(String id, String issueId, String userId, String bookId,
                Double amount, Integer daysOverdue, String status,
                LocalDateTime createdAt, LocalDateTime paidAt) {
        this.id = id;
        this.issueId = issueId;
        this.userId = userId;
        this.bookId = bookId;
        this.amount = amount;
        this.daysOverdue = daysOverdue;
        this.status = status;
        this.createdAt = createdAt;
        this.paidAt = paidAt;
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "UNPAID";
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getIssueId() { return issueId; }
    public void setIssueId(String issueId) { this.issueId = issueId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Integer getDaysOverdue() { return daysOverdue; }
    public void setDaysOverdue(Integer daysOverdue) { this.daysOverdue = daysOverdue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // Builder
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String issueId;
        private String userId;
        private String bookId;
        private Double amount;
        private Integer daysOverdue;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime paidAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder issueId(String issueId) { this.issueId = issueId; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder bookId(String bookId) { this.bookId = bookId; return this; }
        public Builder amount(Double amount) { this.amount = amount; return this; }
        public Builder daysOverdue(Integer daysOverdue) { this.daysOverdue = daysOverdue; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder paidAt(LocalDateTime paidAt) { this.paidAt = paidAt; return this; }

        public Fine build() {
            return new Fine(id, issueId, userId, bookId, amount, daysOverdue, status, createdAt, paidAt);
        }
    }
}
