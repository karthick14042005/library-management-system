package com.library.repository;

import com.library.model.Fine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, String> {
    List<Fine> findByUserId(String userId);
    List<Fine> findByStatus(String status);
    Optional<Fine> findByIssueId(String issueId);
}
