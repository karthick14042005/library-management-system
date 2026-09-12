package com.library.service;

import com.library.dto.DTOs;
import com.library.model.User;
import com.library.repository.BookIssueRepository;
import com.library.repository.FineRepository;
import com.library.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BookIssueRepository bookIssueRepository;
    private final FineRepository fineRepository;

    public UserService(UserRepository userRepository,
                       BookIssueRepository bookIssueRepository,
                       FineRepository fineRepository) {
        this.userRepository = userRepository;
        this.bookIssueRepository = bookIssueRepository;
        this.fineRepository = fineRepository;
    }

    public User login(DTOs.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid credentials: user not found"));

        if (!user.getPasswordHash().equals(req.getPassword())) {
            throw new RuntimeException("Invalid credentials: password incorrect");
        }

        if (!"ADMIN".equalsIgnoreCase(user.getRole()) && !"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Account is currently suspended. Contact library administration.");
        }

        return user;
    }

    @Transactional
    public User register(DTOs.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            throw new RuntimeException("An account with this email already exists");
        }

        long count = userRepository.count() + 1;
        String memberId = "LIB-MEM-" + (100 + count);

        User user = User.builder()
                .id("usr_" + UUID.randomUUID().toString().substring(0, 8))
                .memberId(memberId)
                .name(req.getName())
                .email(req.getEmail().trim().toLowerCase())
                .passwordHash(req.getPassword())
                .phone(req.getPhone())
                .role("USER")
                .status("ACTIVE")
                .joinedAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    public List<User> getAllMembers() {
        List<User> users = userRepository.findAll();
        for (User u : users) {
            int active = (int) bookIssueRepository.findByUserId(u.getId()).stream()
                    .filter(i -> "ISSUED".equalsIgnoreCase(i.getStatus()) || "OVERDUE".equalsIgnoreCase(i.getStatus()))
                    .count();
            double unpaid = fineRepository.findByUserId(u.getId()).stream()
                    .filter(f -> "UNPAID".equalsIgnoreCase(f.getStatus()))
                    .mapToDouble(f -> f.getAmount())
                    .sum();
            int total = bookIssueRepository.findByUserId(u.getId()).size();

            u.setActiveLoansCount(active);
            u.setUnpaidFineAmount(unpaid);
            u.setTotalBorrowedCount(total);
        }
        return users;
    }

    @Transactional
    public User updateMemberStatus(String userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setStatus(status.toUpperCase());
        return userRepository.save(user);
    }
}
