package com.library.repository;

import com.library.model.BookIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookIssueRepository extends JpaRepository<BookIssue, String> {
    List<BookIssue> findByUserId(String userId);
    List<BookIssue> findByBookId(String bookId);
    List<BookIssue> findByStatus(String status);
    Optional<BookIssue> findByBookIdAndUserIdAndStatus(String bookId, String userId, String status);
}
