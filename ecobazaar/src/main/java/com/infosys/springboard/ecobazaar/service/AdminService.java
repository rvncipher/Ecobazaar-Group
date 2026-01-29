package com.infosys.springboard.ecobazaar.service;

import com.infosys.springboard.ecobazaar.entity.User;
import com.infosys.springboard.ecobazaar.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get users by role (USER, SELLER, ADMIN)
     */
    public List<User> getUsersByRole(String role) {
        return userRepository.findByRole(role.toUpperCase());
    }

    /**
     * Get all sellers
     */
    public List<User> getAllSellers() {
        return userRepository.findByRole("SELLER");
    }

    /**
     * Get all regular users
     */
    public List<User> getAllRegularUsers() {
        return userRepository.findByRole("USER");
    }

    /**
     * Get banned users
     */
    public List<User> getBannedUsers() {
        return userRepository.findByBanned(true);
    }

    /**
     * Get active users
     */
    public List<User> getActiveUsers() {
        return userRepository.findByBanned(false);
    }

    /**
     * Ban a user by ID
     */
    @Transactional
    public User banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Cannot ban an admin user");
        }

        user.setBanned(true);
        return userRepository.save(user);
    }

    /**
     * Unban a user by ID
     */
    @Transactional
    public User unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBanned(false);
        return userRepository.save(user);
    }

    /**
     * Delete a user by ID
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Cannot delete an admin user");
        }

        userRepository.deleteById(userId);
    }

    /**
     * Get user statistics
     */
    public java.util.Map<String, Object> getUserStatistics() {
        List<User> allUsers = userRepository.findAll();
        
        long totalUsers = allUsers.stream()
                .filter(u -> "USER".equalsIgnoreCase(u.getRole()))
                .count();
        
        long totalSellers = allUsers.stream()
                .filter(u -> "SELLER".equalsIgnoreCase(u.getRole()))
                .count();
        
        long totalAdmins = allUsers.stream()
                .filter(u -> "ADMIN".equalsIgnoreCase(u.getRole()))
                .count();
        
        long bannedCount = allUsers.stream()
                .filter(User::getBanned)
                .count();
        
        long activeCount = allUsers.size() - bannedCount;

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalSellers", totalSellers);
        stats.put("totalAdmins", totalAdmins);
        stats.put("bannedCount", bannedCount);
        stats.put("activeCount", activeCount);
        stats.put("totalCount", allUsers.size());
        
        return stats;
    }
}
