package com.infosys.springboard.ecobazaar.service;

import com.infosys.springboard.ecobazaar.dto.SellerSalesReportDTO;
import com.infosys.springboard.ecobazaar.dto.UserPurchaseReportDTO;
import com.infosys.springboard.ecobazaar.entity.Order;
import com.infosys.springboard.ecobazaar.entity.OrderItem;
import com.infosys.springboard.ecobazaar.entity.Product;
import com.infosys.springboard.ecobazaar.entity.User;
import com.infosys.springboard.ecobazaar.repository.OrderRepository;
import com.infosys.springboard.ecobazaar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Generate USER PURCHASE REPORT - shows items BOUGHT by user
     */
    public UserPurchaseReportDTO generateUserPurchaseReport(Long userId, String month) {
        // Parse month
        YearMonth yearMonth = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Get user's orders in date range
        List<Order> orders = orderRepository.findByUserIdAndOrderDateBetween(userId, startDate, endDate);

        // Create report
        UserPurchaseReportDTO report = new UserPurchaseReportDTO(userId, user.getName(), month);

        Set<Long> uniqueOrderIds = new HashSet<>();
        int totalItems = 0;
        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal totalCarbon = BigDecimal.ZERO;

        // New: Track category statistics
        Map<String, CategoryStats> categoryStatsMap = new HashMap<>();
        
        // New: Track carbon impact by eco rating
        int ecoFriendlyCount = 0;
        int moderateCount = 0;
        int highImpactCount = 0;
        BigDecimal estimatedCarbonSaved = BigDecimal.ZERO;

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (Order order : orders) {
            uniqueOrderIds.add(order.getId());

            for (OrderItem item : order.getOrderItems()) {
                String category = item.getProduct().getCategory();
                String ecoRating = item.getProduct().getEcoRating();
                
                // Create purchased item DTO
                UserPurchaseReportDTO.PurchasedItemDTO purchasedItem =
                        new UserPurchaseReportDTO.PurchasedItemDTO(
                                item.getProduct().getName(),
                                category,
                                ecoRating,
                                item.getQuantity(),
                                item.getPrice(),
                                item.getSubtotal(),
                                item.getCarbonImpact(),
                                item.getTotalCarbon(),
                                order.getOrderDate().format(dateFormatter),
                                item.getProduct().getSeller().getName()
                        );

                report.getItemsBought().add(purchasedItem);

                // Update totals
                totalItems += item.getQuantity();
                totalSpent = totalSpent.add(item.getSubtotal());
                totalCarbon = totalCarbon.add(item.getTotalCarbon());
                
                // Update category statistics
                categoryStatsMap.putIfAbsent(category, new CategoryStats(category));
                CategoryStats stats = categoryStatsMap.get(category);
                stats.itemCount += item.getQuantity();
                stats.totalSpent = stats.totalSpent.add(item.getSubtotal());
                stats.totalCarbon = stats.totalCarbon.add(item.getTotalCarbon());
                stats.orderIds.add(order.getId());
                
                // Track eco rating counts and estimate carbon savings
                switch (ecoRating) {
                    case "ECO_FRIENDLY":
                        ecoFriendlyCount += item.getQuantity();
                        // Estimate: If user chose high-impact instead (assume 10x carbon)
                        estimatedCarbonSaved = estimatedCarbonSaved.add(
                            item.getTotalCarbon().multiply(new BigDecimal("9"))
                        );
                        break;
                    case "MODERATE":
                        moderateCount += item.getQuantity();
                        break;
                    case "HIGH_IMPACT":
                        highImpactCount += item.getQuantity();
                        break;
                    default:
                        break;
                }
            }
        }

        report.setTotalOrders(uniqueOrderIds.size());
        report.setTotalItemsBought(totalItems);
        report.setTotalSpent(totalSpent);
        report.setTotalCarbonEmitted(totalCarbon);
        
        // Build category breakdown
        List<UserPurchaseReportDTO.CategoryStatsDTO> categoryBreakdown = categoryStatsMap.entrySet().stream()
            .map(entry -> new UserPurchaseReportDTO.CategoryStatsDTO(
                entry.getKey(),
                entry.getValue().itemCount,
                entry.getValue().totalSpent,
                entry.getValue().totalCarbon,
                entry.getValue().orderIds.size()
            ))
            .sorted((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent())) // Sort by spending
            .collect(Collectors.toList());
        report.setCategoryBreakdown(categoryBreakdown);
        
        // Build price by category map
        Map<String, BigDecimal> priceByCategory = categoryStatsMap.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> entry.getValue().totalSpent
            ));
        report.setPriceByCategory(priceByCategory);
        
        // Build carbon impact details
        UserPurchaseReportDTO.CarbonImpactDetailsDTO carbonDetails = 
            new UserPurchaseReportDTO.CarbonImpactDetailsDTO();
        carbonDetails.setTotalCarbonEmitted(totalCarbon);
        carbonDetails.setEstimatedCarbonSaved(estimatedCarbonSaved);
        carbonDetails.setEcoFriendlyItemCount(ecoFriendlyCount);
        carbonDetails.setModerateImpactItemCount(moderateCount);
        carbonDetails.setHighImpactItemCount(highImpactCount);
        
        if (totalItems > 0) {
            carbonDetails.setAverageCarbonPerItem(
                totalCarbon.divide(new BigDecimal(totalItems), 2, RoundingMode.HALF_UP)
            );
        }
        report.setCarbonImpactDetails(carbonDetails);

        System.out.println("✅ USER PURCHASE REPORT GENERATED");
        System.out.println("   User: " + user.getName());
        System.out.println("   Month: " + month);
        System.out.println("   Total Orders: " + report.getTotalOrders());
        System.out.println("   Total Items Bought: " + report.getTotalItemsBought());
        System.out.println("   Total Spent: ₹" + report.getTotalSpent());
        System.out.println("   Categories: " + categoryBreakdown.size());

        return report;
    }
    
    // Helper class to track category statistics
    private static class CategoryStats {
        String category;
        int itemCount = 0;
        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCarbon = BigDecimal.ZERO;
        Set<Long> orderIds = new HashSet<>();
        
        CategoryStats(String category) {
            this.category = category;
        }
    }
    
    // Helper class to track daily sales statistics
    private static class DailySalesStats {
        String date;
        int itemsSold = 0;
        BigDecimal revenue = BigDecimal.ZERO;
        Set<Long> orderIds = new HashSet<>();
        
        DailySalesStats(String date) {
            this.date = date;
        }
    }

    /**
     * Generate SELLER SALES REPORT - shows items SOLD by seller
     */
    /**
     * Generate SELLER SALES REPORT - shows items SOLD by seller
     */
    public SellerSalesReportDTO generateSellerSalesReport(Long sellerId, String month) {
        // Parse month
        YearMonth yearMonth = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        // Get seller
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found with ID: " + sellerId));

        // Get orders containing seller's products
        List<Order> orders = orderRepository.findOrdersBySellerAndDateRange(sellerId, startDate, endDate);

        // Create report
        SellerSalesReportDTO report = new SellerSalesReportDTO(sellerId, seller.getName(), month);

        Set<Long> uniqueOrderIds = new HashSet<>();
        int totalItems = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCarbon = BigDecimal.ZERO;

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Category tracking
        Map<String, CategoryStats> categoryStatsMap = new HashMap<>();
        
        // Daily sales tracking
        Map<String, DailySalesStats> dailySalesMap = new HashMap<>();
        
        // Carbon impact tracking
        int ecoFriendlyCount = 0;
        int moderateCount = 0;
        int highImpactCount = 0;

        System.out.println("\n=== SELLER SALES REPORT GENERATION ===");
        System.out.println("Seller: " + seller.getName() + " (ID: " + sellerId + ")");
        System.out.println("Month: " + month);
        System.out.println("Orders found: " + orders.size());

        for (Order order : orders) {
            System.out.println("\n  Processing Order #" + order.getId());
            System.out.println("  Order Date: " + order.getOrderDate());
            System.out.println("  Order Items: " + order.getOrderItems().size());

            for (OrderItem item : order.getOrderItems()) {
                // Only include items that belong to THIS seller
                if (item.getProduct().getSeller().getId().equals(sellerId)) {
                    Product product = item.getProduct();
                    String category = product.getCategory().toString();
                    String ecoRating = product.getEcoRating().toString();
                    
                    System.out.println("    ✓ Item belongs to seller: " + product.getName() + 
                                     " (Qty: " + item.getQuantity() + ")");

                    // Create sold item DTO with enhanced fields
                    SellerSalesReportDTO.SoldItemDTO soldItem =
                            new SellerSalesReportDTO.SoldItemDTO(
                                    product.getName(),
                                    item.getQuantity(),
                                    item.getPrice(),
                                    item.getSubtotal(),
                                    item.getCarbonImpact(),
                                    item.getTotalCarbon(),
                                    order.getOrderDate().format(dateFormatter),
                                    category,
                                    ecoRating,
                                    order.getUser().getName()
                            );

                    report.getItemsSold().add(soldItem);

                    // Update totals
                    totalItems += item.getQuantity();
                    totalRevenue = totalRevenue.add(item.getSubtotal());
                    totalCarbon = totalCarbon.add(item.getTotalCarbon());
                    uniqueOrderIds.add(order.getId());
                    
                    // Update category stats
                    categoryStatsMap.putIfAbsent(category, new CategoryStats(category));
                    CategoryStats stats = categoryStatsMap.get(category);
                    stats.itemCount += item.getQuantity();
                    stats.totalRevenue = stats.totalRevenue.add(item.getSubtotal());
                    stats.totalCarbon = stats.totalCarbon.add(item.getTotalCarbon());
                    stats.orderIds.add(order.getId());
                    
                    // Update daily sales stats
                    String dayKey = order.getOrderDate().format(dayFormatter);
                    dailySalesMap.putIfAbsent(dayKey, new DailySalesStats(dayKey));
                    DailySalesStats dailyStats = dailySalesMap.get(dayKey);
                    dailyStats.itemsSold += item.getQuantity();
                    dailyStats.revenue = dailyStats.revenue.add(item.getSubtotal());
                    dailyStats.orderIds.add(order.getId());
                    
                    // Track eco ratings
                    switch (ecoRating) {
                        case "ECO_FRIENDLY":
                            ecoFriendlyCount += item.getQuantity();
                            break;
                        case "MODERATE":
                            moderateCount += item.getQuantity();
                            break;
                        case "HIGH_IMPACT":
                            highImpactCount += item.getQuantity();
                            break;
                    }
                } else {
                    System.out.println("    ✗ Item belongs to different seller: " + 
                                     item.getProduct().getName() + " (Seller ID: " + 
                                     item.getProduct().getSeller().getId() + ")");
                }
            }
        }

        report.setTotalOrders(uniqueOrderIds.size());
        report.setTotalItemsSold(totalItems);
        report.setTotalRevenue(totalRevenue);
        report.setTotalCarbonImpact(totalCarbon);
        
        // Build category breakdown
        List<SellerSalesReportDTO.CategoryStatsDTO> categoryBreakdown = new ArrayList<>();
        Map<String, BigDecimal> revenueByCategory = new HashMap<>();
        
        for (CategoryStats stats : categoryStatsMap.values()) {
            categoryBreakdown.add(new SellerSalesReportDTO.CategoryStatsDTO(
                stats.category,
                stats.itemCount,
                stats.totalRevenue,
                stats.totalCarbon,
                stats.orderIds.size()
            ));
            revenueByCategory.put(stats.category, stats.totalRevenue);
        }
        
        report.setCategoryBreakdown(categoryBreakdown);
        report.setRevenueByCategory(revenueByCategory);
        
        // Build carbon impact details
        BigDecimal averageCarbon = totalItems > 0 
            ? totalCarbon.divide(BigDecimal.valueOf(totalItems), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        
        // Estimate carbon saved (eco-friendly items typically save ~60% carbon vs high impact)
        BigDecimal estimatedSaved = BigDecimal.valueOf(ecoFriendlyCount)
            .multiply(averageCarbon)
            .multiply(BigDecimal.valueOf(0.6));
        
        SellerSalesReportDTO.CarbonImpactDetailsDTO carbonDetails = 
            new SellerSalesReportDTO.CarbonImpactDetailsDTO(
                totalCarbon,
                estimatedSaved,
                averageCarbon,
                ecoFriendlyCount,
                moderateCount,
                highImpactCount
            );
        
        report.setCarbonImpactDetails(carbonDetails);
        
        // Build daily sales data
        Map<String, SellerSalesReportDTO.DailySalesDTO> dailySalesData = new HashMap<>();
        System.out.println("\n📊 Building Daily Sales Data:");
        System.out.println("   Daily sales map size: " + dailySalesMap.size());
        for (DailySalesStats dailyStats : dailySalesMap.values()) {
            System.out.println("   Date: " + dailyStats.date + 
                             " | Items: " + dailyStats.itemsSold + 
                             " | Revenue: ₹" + dailyStats.revenue + 
                             " | Orders: " + dailyStats.orderIds.size());
            dailySalesData.put(dailyStats.date, new SellerSalesReportDTO.DailySalesDTO(
                dailyStats.date,
                dailyStats.itemsSold,
                dailyStats.revenue,
                dailyStats.orderIds.size()
            ));
        }
        report.setDailySales(dailySalesData);
        System.out.println("   Total daily sales records: " + dailySalesData.size());

        System.out.println("\n✅ SELLER SALES REPORT COMPLETED");
        System.out.println("   Total Orders: " + report.getTotalOrders());
        System.out.println("   Total Items Sold: " + report.getTotalItemsSold());
        System.out.println("   Total Revenue: ₹" + report.getTotalRevenue());
        System.out.println("   Categories: " + categoryBreakdown.size());
        System.out.println("   Items in Report: " + report.getItemsSold().size());
        System.out.println("=====================================\n");

        return report;
    }
}
