package com.infosys.springboard.ecobazaar.controller;

import com.infosys.springboard.ecobazaar.entity.Order;
import com.infosys.springboard.ecobazaar.entity.User;
import com.infosys.springboard.ecobazaar.repository.UserRepository;
import com.infosys.springboard.ecobazaar.security.JwtUtil;
import com.infosys.springboard.ecobazaar.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Helper method to get user from token
     */
    private User getUserFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Create order from cart (Checkout)
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            Order order = orderService.createOrderFromCart(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get user's orders
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            List<Order> orders = orderService.getUserOrders(user.getId());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get order by ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            Order order = orderService.getOrderById(orderId, user.getId());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancel order
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            Order order = orderService.cancelOrder(orderId, user.getId());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get total carbon impact for user
     */
    @GetMapping("/my-carbon-impact")
    public ResponseEntity<?> getMyCarbonImpact(@RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            Double totalCarbon = orderService.calculateTotalCarbonImpact(user.getId());
            return ResponseEntity.ok(Map.of(
                    "totalCarbonImpact", totalCarbon,
                    "unit", "kg CO₂e"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all orders (ADMIN)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllOrders(@RequestHeader("Authorization") String authHeader) {
        try {
            User admin = getUserFromToken(authHeader);

            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update order status (ADMIN)
     */
    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User admin = getUserFromToken(authHeader);

            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Admin access required"));
            }

            String statusStr = request.get("status");
            Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr);

            Order order = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status value"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ========== SELLER ENDPOINTS ==========

    /**
     * Get seller's orders
     */
    @GetMapping("/seller/my-orders")
    public ResponseEntity<?> getSellerOrders(@RequestHeader("Authorization") String authHeader) {
        try {
            User seller = getUserFromToken(authHeader);
            
            // Robust role validation
            String userRole = seller.getRole();
            if (userRole == null || userRole.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: No role assigned to user"));
            }
            
            if (!"SELLER".equalsIgnoreCase(userRole.trim())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: Seller access required. Your role: " + userRole));
            }

            List<Order> orders = orderService.getSellerOrders(seller.getId());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update order status (SELLER)
     */
    @PutMapping("/seller/{orderId}/status")
    public ResponseEntity<?> updateOrderStatusBySeller(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User seller = getUserFromToken(authHeader);

            // Robust role validation
            String userRole = seller.getRole();
            if (userRole == null || !"SELLER".equalsIgnoreCase(userRole.trim())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: Seller access required"));
            }

            String statusStr = request.get("status");
            Order.OrderStatus status = Order.OrderStatus.valueOf(statusStr);

            Order order = orderService.updateOrderStatusBySeller(orderId, seller.getId(), status);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status value"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ========== RETURN ENDPOINTS ==========

    /**
     * Request return for an order
     */
    @PostMapping("/{orderId}/return")
    public ResponseEntity<?> requestReturn(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User user = getUserFromToken(authHeader);
            String reason = request.get("reason");

            if (reason == null || reason.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Return reason is required"));
            }

            Order order = orderService.requestReturn(orderId, user.getId(), reason);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Approve return request (SELLER)
     */
    @PutMapping("/seller/{orderId}/return/approve")
    public ResponseEntity<?> approveReturn(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User seller = getUserFromToken(authHeader);

            // Robust role validation
            String userRole = seller.getRole();
            if (userRole == null || !"SELLER".equalsIgnoreCase(userRole.trim())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: Seller access required"));
            }

            Order order = orderService.approveReturn(orderId, seller.getId());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject return request (SELLER)
     */
    @PutMapping("/seller/{orderId}/return/reject")
    public ResponseEntity<?> rejectReturn(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User seller = getUserFromToken(authHeader);

            // Robust role validation
            String userRole = seller.getRole();
            if (userRole == null || !"SELLER".equalsIgnoreCase(userRole.trim())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied: Seller access required"));
            }

            Order order = orderService.rejectReturn(orderId, seller.getId());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
