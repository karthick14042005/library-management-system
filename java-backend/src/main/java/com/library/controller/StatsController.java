package com.library.controller;

import com.library.model.Book;
import com.library.model.Fine;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StatsController {

    private final BookRepository bookRepository;
    private final BookIssueRepository bookIssueRepository;
    private final FineRepository fineRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final MemberQueryRepository memberQueryRepository;

    @Value("${library.fine.rate-per-day:5.0}")
    private Double fineRatePerDay = 5.0;

    public StatsController(BookRepository bookRepository,
                           BookIssueRepository bookIssueRepository,
                           FineRepository fineRepository,
                           UserRepository userRepository,
                           ReservationRepository reservationRepository,
                           MemberQueryRepository memberQueryRepository) {
        this.bookRepository = bookRepository;
        this.bookIssueRepository = bookIssueRepository;
        this.fineRepository = fineRepository;
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
        this.memberQueryRepository = memberQueryRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Book> books = bookRepository.findAll();
        int totalBooks = books.stream().mapToInt(Book::getQuantity).sum();
        int uniqueTitles = books.size();
        int availableCopies = books.stream().mapToInt(Book::getAvailableQuantity).sum();
        int issuedCopies = totalBooks - availableCopies;

        int activeIssues = (int) bookIssueRepository.findAll().stream()
                .filter(i -> "ISSUED".equalsIgnoreCase(i.getStatus()) || "OVERDUE".equalsIgnoreCase(i.getStatus()))
                .count();

        int overdueIssues = (int) bookIssueRepository.findAll().stream()
                .filter(i -> "OVERDUE".equalsIgnoreCase(i.getStatus()))
                .count();

        List<Fine> fines = fineRepository.findAll();
        double totalFinesCollected = fines.stream()
                .filter(f -> "PAID".equalsIgnoreCase(f.getStatus()))
                .mapToDouble(Fine::getAmount)
                .sum();
        double pendingFines = fines.stream()
                .filter(f -> "UNPAID".equalsIgnoreCase(f.getStatus()))
                .mapToDouble(Fine::getAmount)
                .sum();

        int totalMembers = (int) userRepository.findByRole("USER").size();
        int activeReservations = (int) reservationRepository.findAll().stream()
                .filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()) || "READY_FOR_PICKUP".equalsIgnoreCase(r.getStatus()))
                .count();
        int pendingQueries = (int) memberQueryRepository.findByStatusOrderByCreatedAtDesc("PENDING").size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBooks", totalBooks);
        stats.put("uniqueTitles", uniqueTitles);
        stats.put("availableCopies", availableCopies);
        stats.put("issuedCopies", issuedCopies);
        stats.put("activeIssues", activeIssues);
        stats.put("overdueIssues", overdueIssues);
        stats.put("totalFinesCollected", totalFinesCollected);
        stats.put("pendingFines", pendingFines);
        stats.put("totalMembers", totalMembers);
        stats.put("activeReservations", activeReservations);
        stats.put("pendingQueries", pendingQueries);
        stats.put("finePerDay", fineRatePerDay);
        stats.put("virtualDaysOffset", 0);
        stats.put("effectiveDate", LocalDateTime.now().toString());

        return ResponseEntity.ok(stats);
    }
}
