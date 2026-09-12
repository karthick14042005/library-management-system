package com.library.controller;

import com.library.dto.DTOs;
import com.library.model.User;
import com.library.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody DTOs.LoginRequest req) {
        try {
            User user = userService.login(req);
            Map<String, Object> resp = new HashMap<>();
            resp.put("user", user);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody DTOs.RegisterRequest req) {
        try {
            User user = userService.register(req);
            Map<String, Object> resp = new HashMap<>();
            resp.put("user", user);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/members")
    public ResponseEntity<List<User>> getMembers() {
        return ResponseEntity.ok(userService.getAllMembers());
    }

    @PutMapping("/members/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody DTOs.StatusUpdateRequest req) {
        try {
            User updated = userService.updateMemberStatus(id, req.getStatus());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
