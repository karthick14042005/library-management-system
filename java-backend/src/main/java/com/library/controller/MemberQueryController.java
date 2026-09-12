package com.library.controller;

import com.library.dto.DTOs;
import com.library.model.MemberQuery;
import com.library.repository.MemberQueryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/queries")
@CrossOrigin(origins = "*")
public class MemberQueryController {

    private final MemberQueryRepository queryRepository;

    public MemberQueryController(MemberQueryRepository queryRepository) {
        this.queryRepository = queryRepository;
    }

    @GetMapping
    public ResponseEntity<List<MemberQuery>> getQueries(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.isEmpty()) {
            return ResponseEntity.ok(queryRepository.findByUserIdOrderByCreatedAtDesc(userId));
        }
        return ResponseEntity.ok(queryRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<?> submitQuery(@RequestBody MemberQuery query) {
        try {
            query.setId("qry_" + UUID.randomUUID().toString().substring(0, 8));
            query.setStatus("PENDING");
            query.setCreatedAt(LocalDateTime.now());
            return ResponseEntity.ok(queryRepository.save(query));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<?> replyQuery(@PathVariable String id, @RequestBody DTOs.QueryReplyRequest req) {
        try {
            MemberQuery query = queryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Query not found: " + id));
            query.setAdminReply(req.getReply());
            query.setStatus("RESOLVED");
            query.setRepliedAt(LocalDateTime.now());
            return ResponseEntity.ok(queryRepository.save(query));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
