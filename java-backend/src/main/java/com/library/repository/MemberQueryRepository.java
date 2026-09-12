package com.library.repository;

import com.library.model.MemberQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MemberQueryRepository extends JpaRepository<MemberQuery, String> {
    List<MemberQuery> findByUserIdOrderByCreatedAtDesc(String userId);
    List<MemberQuery> findAllByOrderByCreatedAtDesc();
    List<MemberQuery> findByStatusOrderByCreatedAtDesc(String status);
}
