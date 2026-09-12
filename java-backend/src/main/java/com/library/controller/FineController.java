package com.library.controller;

import com.library.model.Fine;
import com.library.service.FineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fines")
@CrossOrigin(origins = "*")
public class FineController {

    private final FineService fineService;

    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    @GetMapping
    public ResponseEntity<List<Fine>> getFines(@RequestParam(required = false) String userId) {
        return ResponseEntity.ok(fineService.getFines(userId));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<?> payFine(@PathVariable String id) {
        try {
            Fine paid = fineService.payFine(id);
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Fine marked as paid");
            resp.put("fine", paid);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
