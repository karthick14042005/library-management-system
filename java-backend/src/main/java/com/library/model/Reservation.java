package com.library.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    private String id;

    @Column(name = "book_id", nullable = false)
    private String bookId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "reservation_date", nullable = false)
    private LocalDateTime reservationDate;

    @Column(nullable = false, length = 30)
    private String status; // "PENDING", "READY_FOR_PICKUP", "FULFILLED", "CANCELLED"

    @Column(name = "queue_position", nullable = false)
    private Integer queuePosition;

    @Transient
    private Book book;

    @Transient
    private User user;

    public Reservation() {
    }

    public Reservation(String id, String bookId, String userId,
                       LocalDateTime reservationDate, String status, Integer queuePosition) {
        this.id = id;
        this.bookId = bookId;
        this.userId = userId;
        this.reservationDate = reservationDate;
        this.status = status;
        this.queuePosition = queuePosition;
    }

    @PrePersist
    public void prePersist() {
        if (this.reservationDate == null) {
            this.reservationDate = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
        if (this.queuePosition == null) {
            this.queuePosition = 1;
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getReservationDate() { return reservationDate; }
    public void setReservationDate(LocalDateTime reservationDate) { this.reservationDate = reservationDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getQueuePosition() { return queuePosition; }
    public void setQueuePosition(Integer queuePosition) { this.queuePosition = queuePosition; }

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
        private String bookId;
        private String userId;
        private LocalDateTime reservationDate;
        private String status;
        private Integer queuePosition;

        public Builder id(String id) { this.id = id; return this; }
        public Builder bookId(String bookId) { this.bookId = bookId; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder reservationDate(LocalDateTime reservationDate) { this.reservationDate = reservationDate; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder queuePosition(Integer queuePosition) { this.queuePosition = queuePosition; return this; }

        public Reservation build() {
            return new Reservation(id, bookId, userId, reservationDate, status, queuePosition);
        }
    }
}
