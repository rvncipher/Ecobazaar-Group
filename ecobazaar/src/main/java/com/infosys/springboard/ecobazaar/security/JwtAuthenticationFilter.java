package com.infosys.springboard.ecobazaar.security;

import com.infosys.springboard.ecobazaar.entity.User;
import com.infosys.springboard.ecobazaar.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                String email = jwtUtil.extractEmail(token);
                
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Get user from database to get actual role
                    Optional<User> userOpt = userRepository.findByEmail(email);
                    
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        
                        // Check if user is banned
                        if (user.getBanned() != null && user.getBanned()) {
                            // User is banned, don't authenticate
                            filterChain.doFilter(request, response);
                            return;
                        }
                        
                        // Create authentication with user's actual role
                        String role = user.getRole() != null ? user.getRole() : "USER";
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(email, null, 
                                        Collections.singletonList(
                                                new SimpleGrantedAuthority("ROLE_" + role)));
                        
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                // Invalid token, continue without authentication
                System.err.println("JWT Authentication error: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
