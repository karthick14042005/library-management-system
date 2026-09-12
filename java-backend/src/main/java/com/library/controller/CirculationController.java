package com.library.controller;

import com.library.dto.DTOs;
import com.library.model.BookIssue;
import com.library.service.CirculationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CirculationController {

    private final CirculationService circulationService;

    public CirculationController(CirculationService circulationService) {
        this.circulationService = circulationService;
    }

    @GetMapping("/issues")
    public ResponseEntity<List<BookIssue>> getIssues(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(circulationService.getIssues(userId));
    }

    @PostMapping("/issues")
    public ResponseEntity<?> issueBook(@RequestBody DTOs.IssueRequest req) {
        try {
            BookIssue issue = circulationService.issueBook(req.getUserId(), req.getBookId(), req.getLoanDays());
            return ResponseEntity.ok(issue);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/issues/{id}/return")
    public ResponseEntity<?> returnBook(@PathVariable String id) {
        try {
            BookIssue returned = circulationService.returnBook(id);
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Book returned successfully");
            resp.put("issue", returned);
            resp.put("fineAmount", returned.getCalculatedFine() != null ? returned.getCalculatedFine() : 0.0);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
