package com.library.service;

import com.library.model.Book;
import com.library.model.Reservation;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.ReservationRepository;
import com.library.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              BookRepository bookRepository,
                              UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public List<Reservation> getReservations(String userId) {
        List<Reservation> list = (userId != null && !userId.isEmpty())
                ? reservationRepository.findByUserId(userId)
                : reservationRepository.findAll();

        for (Reservation r : list) {
            bookRepository.findById(r.getBookId()).ifPresent(r::setBook);
            userRepository.findById(r.getUserId()).ifPresent(r::setUser);
        }
        return list;
    }

    @Transactional
    public Reservation createReservation(String userId, String bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found: " + bookId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<Reservation> activeQueue = reservationRepository.findByBookIdAndStatusOrderByQueuePositionAsc(
                bookId, "PENDING"
        );

        Reservation res = Reservation.builder()
                .id("res_" + UUID.randomUUID().toString().substring(0, 8))
                .bookId(bookId)
                .userId(userId)
                .reservationDate(LocalDateTime.now())
                .status("PENDING")
                .queuePosition(activeQueue.size() + 1)
                .build();

        Reservation saved = reservationRepository.save(res);
        saved.setBook(book);
        saved.setUser(user);
        return saved;
    }

    @Transactional
    public void cancelReservation(String reservationId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found: " + reservationId));
        res.setStatus("CANCELLED");
        reservationRepository.save(res);
    }
}
