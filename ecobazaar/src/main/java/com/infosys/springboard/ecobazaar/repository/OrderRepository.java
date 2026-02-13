package com.infosys.springboard.ecobazaar.repository;

import com.infosys.springboard.ecobazaar.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    
    List<Order> findByStatus(Order.OrderStatus status);
    
    List<Order> findByUserIdAndStatus(Long userId, Order.OrderStatus status);
    
    // Analytics queries for Milestone 4
    
    /**
     * Find orders for a user within a date range
     */
    List<Order> findByUserIdAndOrderDateBetween(
        Long userId, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    /**
     * Find orders by seller within a date range
     */
    @Query("SELECT o FROM Order o JOIN o.orderItems oi " +
           "WHERE oi.product.seller.id = :sellerId " +
           "AND o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findOrdersBySellerAndDateRange(
        @Param("sellerId") Long sellerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Get total carbon emitted by user in date range
     */
    @Query("SELECT COALESCE(SUM(o.totalCarbon), 0) FROM Order o " +
           "WHERE o.user.id = :userId " +
           "AND o.orderDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCarbonByUserAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Get total revenue by seller in date range
     */
    @Query("SELECT COALESCE(SUM(oi.price * oi.quantity), 0) FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE oi.product.seller.id = :sellerId " +
           "AND o.orderDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenueBySellerAndDateRange(
        @Param("sellerId") Long sellerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Count total products sold by seller in date range
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM Order o " +
           "JOIN o.orderItems oi " +
           "WHERE oi.product.seller.id = :sellerId " +
           "AND o.orderDate BETWEEN :startDate AND :endDate")
    Integer getTotalProductsSoldBySellerAndDateRange(
        @Param("sellerId") Long sellerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Find all orders containing products from a specific seller
     */
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi " +
           "WHERE oi.product.seller.id = :sellerId " +
           "ORDER BY o.orderDate DESC")
    List<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId);
    
    /**
     * Find orders by seller and status
     */
    @Query("SELECT DISTINCT o FROM Order o JOIN o.orderItems oi " +
           "WHERE oi.product.seller.id = :sellerId " +
           "AND o.status = :status " +
           "ORDER BY o.orderDate DESC")
    List<Order> findOrdersBySellerIdAndStatus(
        @Param("sellerId") Long sellerId,
        @Param("status") Order.OrderStatus status
    );
    
    /**
     * Find orders with pending return requests
     */
    @Query("SELECT o FROM Order o " +
           "WHERE o.returnRequested = true " +
           "AND o.returnStatus = :returnStatus " +
           "ORDER BY o.returnRequestDate DESC")
    List<Order> findOrdersByReturnStatus(@Param("returnStatus") Order.ReturnStatus returnStatus);
}
