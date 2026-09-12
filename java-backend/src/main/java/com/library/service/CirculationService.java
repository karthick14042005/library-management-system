package com.library.service;

import com.library.model.*;
import com.library.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CirculationService {

    private final BookIssueRepository bookIssueRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final FineRepository fineRepository;
    private final ReservationRepository reservationRepository;

    @Value("${library.fine.rate-per-day:5.0}")
    private Double fineRatePerDay = 5.0;

    @Value("${library.circulation.loan-days:14}")
    private Integer standardLoanDays = 14;

    public CirculationService(BookIssueRepository bookIssueRepository,
                              BookRepository bookRepository,
                              UserRepository userRepository,
                              FineRepository fineRepository,
                              ReservationRepository reservationRepository) {
        this.bookIssueRepository = bookIssueRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.fineRepository = fineRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<BookIssue> getIssues(String userId) {
        List<BookIssue> issues = (userId != null && !userId.isEmpty())
                ? bookIssueRepository.findByUserId(userId)
                : bookIssueRepository.findAll();

        LocalDateTime now = LocalDateTime.now();
        for (BookIssue issue : issues) {
            bookRepository.findById(issue.getBookId()).ifPresent(issue::setBook);
            userRepository.findById(issue.getUserId()).ifPresent(issue::setUser);

            if (!"RETURNED".equalsIgnoreCase(issue.getStatus())) {
                if (now.isAfter(issue.getDueDate())) {
                    issue.setStatus("OVERDUE");
                    long days = Duration.between(issue.getDueDate(), now).toDays();
                    issue.setCalculatedFine(Math.max(1, days) * fineRatePerDay);
                } else {
                    issue.setStatus("ISSUED");
                    issue.setCalculatedFine(0.0);
                }
            }
        }
        return issues;
    }

    @Transactional
    public BookIssue issueBook(String userId, String bookId, Integer loanDays) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Account suspended. Clear dues or contact library staff.");
        }

        // Check if user has unpaid fines exceeding threshold
        List<Fine> unpaidFines = fineRepository.findByUserId(userId).stream()
                .filter(f -> "UNPAID".equalsIgnoreCase(f.getStatus()))
                .toList();
        double totalUnpaid = unpaidFines.stream().mapToDouble(Fine::getAmount).sum();
        if (totalUnpaid > 50.0) {
            throw new RuntimeException("Cannot issue book: Member has unpaid fines of Rs. " + totalUnpaid);
        }

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));

        if (book.getAvailableQuantity() <= 0) {
            throw new RuntimeException("All copies currently issued out. Please place an advance reservation.");
        }

        // Check active loan duplicate
        boolean alreadyIssued = bookIssueRepository.findByBookIdAndUserIdAndStatus(bookId, userId, "ISSUED").isPresent()
                || bookIssueRepository.findByBookIdAndUserIdAndStatus(bookId, userId, "OVERDUE").isPresent();
        if (alreadyIssued) {
            throw new RuntimeException("You already have an active loan for this book.");
        }

        int days = (loanDays != null && loanDays > 0) ? loanDays : standardLoanDays;
        LocalDateTime now = LocalDateTime.now();

        // Decrement available copies
        book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        bookRepository.save(book);

        // Fulfill any reservation held by this user
        reservationRepository.findByBookIdAndUserIdAndStatus(bookId, userId, "READY_FOR_PICKUP")
                .ifPresent(r -> {
                    r.setStatus("FULFILLED");
                    reservationRepository.save(r);
                });

        BookIssue issue = BookIssue.builder()
                .id("iss_" + UUID.randomUUID().toString().substring(0, 8))
                .bookId(bookId)
                .userId(userId)
                .issueDate(now)
                .dueDate(now.plusDays(days))
                .status("ISSUED")
                .build();

        BookIssue saved = bookIssueRepository.save(issue);
        saved.setBook(book);
        saved.setUser(user);
        return saved;
    }

    @Transactional
    public BookIssue returnBook(String issueId) {
        BookIssue issue = bookIssueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Circulation loan not found: " + issueId));

        if ("RETURNED".equalsIgnoreCase(issue.getStatus())) {
            throw new RuntimeException("Book has already been returned.");
        }

        LocalDateTime now = LocalDateTime.now();
        issue.setReturnDate(now);
        issue.setStatus("RETURNED");

        // Increment book available quantity
        Book book = bookRepository.findById(issue.getBookId())
                .orElseThrow(() -> new RuntimeException("Associated book record not found"));
        book.setAvailableQuantity(Math.min(book.getQuantity(), book.getAvailableQuantity() + 1));
        bookRepository.save(book);

        // Calculate fine if overdue
        if (now.isAfter(issue.getDueDate())) {
            long days = Duration.between(issue.getDueDate(), now).toDays();
            int daysOverdue = (int) Math.max(1, days);
            double fineAmount = daysOverdue * fineRatePerDay;

            Fine fine = Fine.builder()
                    .id("fn_" + UUID.randomUUID().toString().substring(0, 8))
                    .issueId(issue.getId())
                    .userId(issue.getUserId())
                    .bookId(issue.getBookId())
                    .amount(fineAmount)
                    .daysOverdue(daysOverdue)
                    .status("UNPAID")
                    .createdAt(now)
                    .build();
            fineRepository.save(fine);
            issue.setCalculatedFine(fineAmount);
        }

        // Notify next advance booking in queue
        List<Reservation> queue = reservationRepository.findByBookIdAndStatusOrderByQueuePositionAsc(
                issue.getBookId(), "PENDING"
        );
        if (!queue.isEmpty()) {
            Reservation nextInLine = queue.get(0);
            nextInLine.setStatus("READY_FOR_PICKUP");
            reservationRepository.save(nextInLine);
        }

        return bookIssueRepository.save(issue);
    }
}
