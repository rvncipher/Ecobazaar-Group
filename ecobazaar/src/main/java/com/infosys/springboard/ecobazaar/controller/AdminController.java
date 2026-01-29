package com.infosys.springboard.ecobazaar.controller;

import com.infosys.springboard.ecobazaar.entity.User;
import com.infosys.springboard.ecobazaar.repository.UserRepository;
import com.infosys.springboard.ecobazaar.security.JwtUtil;
import com.infosys.springboard.ecobazaar.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AdminController(AdminService adminService,
                          UserRepository userRepository,
                          JwtUtil jwtUtil) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Helper method to verify admin access
     */
    private User verifyAdminAccess(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            throw new RuntimeException("Admin access required");
        }

        return admin;
    }

    /**
     * Convert User to safe response (without password)
     */
    private Map<String, Object> userToResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("ecoScore", user.getEcoScore());
        response.put("verified", user.getVerified());
        response.put("banned", user.getBanned());
        response.put("createdAt", user.getCreatedAt());
        return response;
    }

    /**
     * Get all users (ADMIN only)
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminAccess(authHeader);
            List<User> users = adminService.getAllUsers();
            List<Map<String, Object>> response = users.stream()
                    .map(this::userToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    /**
     * Get users by role (ADMIN only)
     */
    @GetMapping("/users/role/{role}")
    public ResponseEntity<?> getUsersByRole(
            @PathVariable String role,
            @RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminAccess(authHeader);
            List<User> users = adminService.getUsersByRole(role);
            List<Map<String, Object>> response = users.stream()
                    .map(this::userToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    /**
     * Get all sellers (ADMIN only)
     */
    @GetMapping("/sellers")
    public ResponseEntity<?> getAllSellers(@RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminAccess(authHeader);
            List<User> sellers = adminService.getAllSellers();
            List<Map<String, Object>> response = sellers.stream()
                    .map(this::userToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    /**
     * Get all regular users (ADMIN only)
     */
    @GetMapping("/regular-users")
    public ResponseEntity<?> getRegularUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminAccess(authHeader);
            List<User> users = adminService.getAllRegularUsers();
            List<Map<String, Object>> response = users.stream()
                    .map(this::userToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    /**
     * Get banned users (ADMIN only)
     */
    @GetMapping("/users/banned")
    public ResponseEntity<?> getBannedUsers(@RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminAccess(authHeader);
            List<User> users = adminService.getBannedUsers();
            List<Map<String, Object>> response = users.stream()
                    .map(this::userToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    /**
     * Get user statistics (ADMIN only)
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getUserStatistics(@RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminAccess(authHeader);
            Map<String, Object> stats = adminService.getUserStatistics();
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    /**
     * Ban a user (ADMIN only)
     */
    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminAccess(authHeader);
            User user = adminService.banUser(userId);
            return ResponseEntity.ok(userToResponse(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Unban a user (ADMIN only)
     */
    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminAccess(authHeader);
            User user = adminService.unbanUser(userId);
            return ResponseEntity.ok(userToResponse(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Delete a user (ADMIN only)
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminAccess(authHeader);
            adminService.deleteUser(userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User deleted successfully");
            response.put("userId", userId.toString());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
