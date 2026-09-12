package com.library.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    private String id;

    @Column(name = "member_id", nullable = false, unique = true, length = 20)
    private String memberId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String role; // "ADMIN" or "USER"

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 20)
    private String status; // "ACTIVE" or "SUSPENDED"

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Transient
    private Integer activeLoansCount;

    @Transient
    private Double unpaidFineAmount;

    @Transient
    private Integer totalBorrowedCount;

    public User() {
    }

    public User(String id, String memberId, String name, String email, String passwordHash,
                String role, String phone, String status, LocalDateTime joinedAt) {
        this.id = id;
        this.memberId = memberId;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.phone = phone;
        this.status = status;
        this.joinedAt = joinedAt;
    }

    @PrePersist
    public void prePersist() {
        if (this.joinedAt == null) {
            this.joinedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        if (this.role == null) {
            this.role = "USER";
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public Integer getActiveLoansCount() { return activeLoansCount; }
    public void setActiveLoansCount(Integer activeLoansCount) { this.activeLoansCount = activeLoansCount; }

    public Double getUnpaidFineAmount() { return unpaidFineAmount; }
    public void setUnpaidFineAmount(Double unpaidFineAmount) { this.unpaidFineAmount = unpaidFineAmount; }

    public Integer getTotalBorrowedCount() { return totalBorrowedCount; }
    public void setTotalBorrowedCount(Integer totalBorrowedCount) { this.totalBorrowedCount = totalBorrowedCount; }

    // Builder pattern implementation
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String memberId;
        private String name;
        private String email;
        private String passwordHash;
        private String role;
        private String phone;
        private String status;
        private LocalDateTime joinedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder memberId(String memberId) { this.memberId = memberId; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder joinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; return this; }

        public User build() {
            return new User(id, memberId, name, email, passwordHash, role, phone, status, joinedAt);
        }
    }
}
