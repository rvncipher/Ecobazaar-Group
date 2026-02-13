package com.infosys.springboard.ecobazaar.service;

import com.infosys.springboard.ecobazaar.entity.*;
import com.infosys.springboard.ecobazaar.repository.CartRepository;
import com.infosys.springboard.ecobazaar.repository.OrderRepository;
import com.infosys.springboard.ecobazaar.repository.ProductRepository;
import com.infosys.springboard.ecobazaar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create order from cart
     */
    @Transactional
    public Order createOrderFromCart(User user) {
        // Get user's cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot create order from empty cart");
        }

        // Validate stock availability for all items
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
        }

        // Create order
        Order order = new Order(user, cart.getTotalPrice(), cart.getTotalCarbon(), cart.getTotalItems());
        order.setStatus(Order.OrderStatus.PENDING);

        // Create order items and update product stock
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem(
                    cartItem.getProduct(),
                    cartItem.getQuantity(),
                    cartItem.getPrice(),
                    cartItem.getCarbonImpact()
            );
            order.addOrderItem(orderItem);

            // Reduce product stock
            Product product = cartItem.getProduct();
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartService.clearCart(user);

        return savedOrder;
    }

    /**
     * Update user's eco score based on order
     * Scoring logic:
     * - Base points: 10 points per order
     * - Eco rating bonus: (Avg eco rating * 5) points
     * - Carbon reduction bonus: 20 points if avg carbon < 5kg
     * - Eco-certified bonus: 15 points per eco-certified product
     */
    private void updateUserEcoScore(User user, Order order) {
        // Use the same calculation method to ensure consistency
        int scoreGained = calculateEcoScoreForOrder(order);

        // Update user's eco score
        user.setEcoScore(user.getEcoScore() + scoreGained);
        userRepository.save(user);
    }

    /**
     * Convert eco rating string to numeric score
     */
    private int convertEcoRatingToScore(String ecoRating) {
        return switch (ecoRating) {
            case "ECO_FRIENDLY" -> 5;
            case "MODERATE" -> 3;
            case "HIGH_IMPACT" -> 1;
            default -> 2; // UNRATED gets neutral score
        };
    }

    /**
     * Get all orders for a user
     */
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    /**
     * Get order by ID
     */
    public Order getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify order belongs to user
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Order does not belong to user");
        }

        return order;
    }

    /**
     * Update order status
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);

        if (status == Order.OrderStatus.DELIVERED) {
            order.setDeliveredDate(LocalDateTime.now());
            // Update user's eco score when order is delivered
            updateUserEcoScore(order.getUser(), order);
        }

        return orderRepository.save(order);
    }

    /**
     * Cancel order
     */
    @Transactional
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = getOrderById(orderId, userId);

        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel delivered order");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }

        // Restore product stock
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() + orderItem.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    /**
     * Get all orders (Admin)
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    /**
     * Get orders by status
     */
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    /**
     * Calculate total carbon savings for user
     */
    public Double calculateTotalCarbonImpact(Long userId) {
        List<Order> orders = getUserOrders(userId);
        return orders.stream()
                .mapToDouble(order -> order.getTotalCarbon().doubleValue())
                .sum();
    }

    /**
     * Get orders containing seller's products
     */
    public List<Order> getSellerOrders(Long sellerId) {
        return orderRepository.findOrdersBySellerId(sellerId);
    }

    /**
     * Get seller orders by status
     */
    public List<Order> getSellerOrdersByStatus(Long sellerId, Order.OrderStatus status) {
        return orderRepository.findOrdersBySellerIdAndStatus(sellerId, status);
    }

    /**
     * Update order status by seller (for their products)
     */
    @Transactional
    public Order updateOrderStatusBySeller(Long orderId, Long sellerId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify seller owns at least one product in the order
        boolean hasSellerProduct = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getSeller().getId().equals(sellerId));

        if (!hasSellerProduct) {
            throw new RuntimeException("Order does not contain your products");
        }

        return updateOrderStatus(orderId, status);
    }

    /**
     * Request return for an order
     */
    @Transactional
    public Order requestReturn(Long orderId, Long userId, String reason) {
        Order order = getOrderById(orderId, userId);

        // Validate return eligibility
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Only delivered orders can be returned");
        }

        if (order.getReturnRequested()) {
            throw new RuntimeException("Return already requested for this order");
        }

        // Check if within 7 days of delivery
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        if (order.getDeliveredDate().isBefore(sevenDaysAgo)) {
            throw new RuntimeException("Return window has expired. Returns are only allowed within 7 days of delivery");
        }

        order.setReturnRequested(true);
        order.setReturnRequestDate(LocalDateTime.now());
        order.setReturnReason(reason);
        order.setReturnStatus(Order.ReturnStatus.PENDING);

        return orderRepository.save(order);
    }

    /**
     * Approve return request
     */
    @Transactional
    public Order approveReturn(Long orderId, Long sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify seller owns products in the order
        boolean hasSellerProduct = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getSeller().getId().equals(sellerId));

        if (!hasSellerProduct) {
            throw new RuntimeException("Order does not contain your products");
        }

        if (!order.getReturnRequested()) {
            throw new RuntimeException("No return request for this order");
        }

        if (order.getReturnStatus() != Order.ReturnStatus.PENDING) {
            throw new RuntimeException("Return request already processed");
        }

        order.setReturnStatus(Order.ReturnStatus.APPROVED);
        order.setReturnResolvedDate(LocalDateTime.now());

        // Restore product stock
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() + orderItem.getQuantity());
            productRepository.save(product);
        }

        // Deduct eco score from user ONLY if order was delivered
        // (Eco score is only awarded on DELIVERED status)
        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            User user = order.getUser();
            int scoreToDeduct = calculateEcoScoreForOrder(order);
            int currentScore = user.getEcoScore();
            int newScore = Math.max(0, currentScore - scoreToDeduct);
            
            user.setEcoScore(newScore);
            userRepository.save(user);
        }

        return orderRepository.save(order);
    }

    /**
     * Reject return request
     */
    @Transactional
    public Order rejectReturn(Long orderId, Long sellerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify seller owns products in the order
        boolean hasSellerProduct = order.getOrderItems().stream()
                .anyMatch(item -> item.getProduct().getSeller().getId().equals(sellerId));

        if (!hasSellerProduct) {
            throw new RuntimeException("Order does not contain your products");
        }

        if (!order.getReturnRequested()) {
            throw new RuntimeException("No return request for this order");
        }

        if (order.getReturnStatus() != Order.ReturnStatus.PENDING) {
            throw new RuntimeException("Return request already processed");
        }

        order.setReturnStatus(Order.ReturnStatus.REJECTED);
        order.setReturnResolvedDate(LocalDateTime.now());

        return orderRepository.save(order);
    }

    /**
     * Calculate eco score for an order
     * This method is used for both:
     * 1. Adding score when order is DELIVERED
     * 2. Deducting score when return is APPROVED
     * 
     * Scoring logic:
     * - Base points: 10 points per order
     * - Eco rating bonus: (Avg eco rating * 5) points (max 25)
     * - Carbon reduction bonus: 20 points if avg carbon < 5kg per item
     * - Eco-certified bonus: 15 points per eco-certified product
     */
    private int calculateEcoScoreForOrder(Order order) {
        int score = 10; // Base points

        double avgEcoRatingScore = 0;
        double avgCarbon = 0;
        int ecoCertifiedCount = 0;

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            avgEcoRatingScore += convertEcoRatingToScore(product.getEcoRating()) * item.getQuantity();
            avgCarbon += item.getTotalCarbon().doubleValue();

            if (product.getEcoCertified()) {
                ecoCertifiedCount += item.getQuantity();
            }
        }

        avgEcoRatingScore = avgEcoRatingScore / order.getTotalItems();
        avgCarbon = avgCarbon / order.getTotalItems();

        score += (int) (avgEcoRatingScore * 5);

        if (avgCarbon < 5.0) {
            score += 20;
        }

        score += (ecoCertifiedCount * 15);

        return score;
    }
}
