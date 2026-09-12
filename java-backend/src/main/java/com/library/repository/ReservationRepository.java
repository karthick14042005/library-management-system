package com.library.repository;

import com.library.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByBookId(String bookId);
    List<Reservation> findByBookIdAndStatusOrderByQueuePositionAsc(String bookId, String status);
    Optional<Reservation> findByBookIdAndUserIdAndStatus(String bookId, String userId, String status);
}
