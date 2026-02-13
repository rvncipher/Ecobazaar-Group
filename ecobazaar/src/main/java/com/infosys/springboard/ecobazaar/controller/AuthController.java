package com.infosys.springboard.ecobazaar.controller;

import com.infosys.springboard.ecobazaar.entity.User;
import com.infosys.springboard.ecobazaar.repository.UserRepository;
import com.infosys.springboard.ecobazaar.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // SIGNUP
    @PostMapping("/signup")
    public String signup(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "User already exists";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set default role to USER if not provided
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        }
        
        // Set default eco score
        if (user.getEcoScore() == null) {
            user.setEcoScore(0);
        }
        
        // Sellers need admin verification, users are auto-verified
        if ("SELLER".equalsIgnoreCase(user.getRole())) {
            user.setVerified(false);
        } else {
            user.setVerified(true);
        }
        
        userRepository.save(user);

        return "Signup successful";
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Check if user is banned
        if (user.getBanned() != null && user.getBanned()) {
            throw new RuntimeException("Your account has been banned. Please contact support.");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName() != null ? user.getName() : "User");
        response.put("role", user.getRole());
        response.put("ecoScore", user.getEcoScore());
        response.put("verified", user.getVerified());
        response.put("banned", user.getBanned());
        
        return response;
    }
}
