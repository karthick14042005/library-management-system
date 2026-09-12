package com.library.service;

import com.library.model.Fine;
import com.library.repository.BookRepository;
import com.library.repository.FineRepository;
import com.library.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FineService {

    private final FineRepository fineRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public FineService(FineRepository fineRepository,
                       BookRepository bookRepository,
                       UserRepository userRepository) {
        this.fineRepository = fineRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public List<Fine> getFines(String userId) {
        List<Fine> fines = (userId != null && !userId.isEmpty())
                ? fineRepository.findByUserId(userId)
                : fineRepository.findAll();

        for (Fine fine : fines) {
            bookRepository.findById(fine.getBookId()).ifPresent(fine::setBook);
            userRepository.findById(fine.getUserId()).ifPresent(fine::setUser);
        }
        return fines;
    }

    @Transactional
    public Fine payFine(String fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine not found: " + fineId));

        fine.setStatus("PAID");
        fine.setPaidAt(LocalDateTime.now());
        Fine saved = fineRepository.save(fine);

        bookRepository.findById(saved.getBookId()).ifPresent(saved::setBook);
        userRepository.findById(saved.getUserId()).ifPresent(saved::setUser);
        return saved;
    }
}
