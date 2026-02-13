package com.infosys.springboard.ecobazaar.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Report DTO for SELLER showing items SOLD
 */
public class SellerSalesReportDTO {
    private Long sellerId;
    private String sellerName;
    private String month;
    private Integer totalItemsSold;
    private Integer totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalCarbonImpact;
    private List<SoldItemDTO> itemsSold;
    private List<CategoryStatsDTO> categoryBreakdown;
    private CarbonImpactDetailsDTO carbonImpactDetails;
    private Map<String, BigDecimal> revenueByCategory;
    private Map<String, DailySalesDTO> dailySales;

    public SellerSalesReportDTO() {
        this.itemsSold = new ArrayList<>();
        this.categoryBreakdown = new ArrayList<>();
        this.revenueByCategory = new HashMap<>();
        this.dailySales = new HashMap<>();
        this.totalItemsSold = 0;
        this.totalOrders = 0;
        this.totalRevenue = BigDecimal.ZERO;
        this.totalCarbonImpact = BigDecimal.ZERO;
    }

    public SellerSalesReportDTO(Long sellerId, String sellerName, String month) {
        this();
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.month = month;
    }

    // Nested class for sold item details
    public static class SoldItemDTO {
        private String productName;
        private Integer quantitySold;
        private BigDecimal pricePerUnit;
        private BigDecimal totalRevenue;
        private BigDecimal carbonImpactPerUnit;
        private BigDecimal totalCarbonImpact;
        private String orderDate;
        private String category;
        private String ecoRating;
        private String buyerName;

        public SoldItemDTO() {}

        public SoldItemDTO(String productName, Integer quantitySold, BigDecimal pricePerUnit,
                          BigDecimal totalRevenue, BigDecimal carbonImpactPerUnit,
                          BigDecimal totalCarbonImpact, String orderDate) {
            this.productName = productName;
            this.quantitySold = quantitySold;
            this.pricePerUnit = pricePerUnit;
            this.totalRevenue = totalRevenue;
            this.carbonImpactPerUnit = carbonImpactPerUnit;
            this.totalCarbonImpact = totalCarbonImpact;
            this.orderDate = orderDate;
        }
        
        public SoldItemDTO(String productName, Integer quantitySold, BigDecimal pricePerUnit,
                          BigDecimal totalRevenue, BigDecimal carbonImpactPerUnit,
                          BigDecimal totalCarbonImpact, String orderDate,
                          String category, String ecoRating, String buyerName) {
            this(productName, quantitySold, pricePerUnit, totalRevenue,
                 carbonImpactPerUnit, totalCarbonImpact, orderDate);
            this.category = category;
            this.ecoRating = ecoRating;
            this.buyerName = buyerName;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public Integer getQuantitySold() {
            return quantitySold;
        }

        public void setQuantitySold(Integer quantitySold) {
            this.quantitySold = quantitySold;
        }

        public BigDecimal getPricePerUnit() {
            return pricePerUnit;
        }

        public void setPricePerUnit(BigDecimal pricePerUnit) {
            this.pricePerUnit = pricePerUnit;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }

        public BigDecimal getCarbonImpactPerUnit() {
            return carbonImpactPerUnit;
        }

        public void setCarbonImpactPerUnit(BigDecimal carbonImpactPerUnit) {
            this.carbonImpactPerUnit = carbonImpactPerUnit;
        }

        public BigDecimal getTotalCarbonImpact() {
            return totalCarbonImpact;
        }

        public void setTotalCarbonImpact(BigDecimal totalCarbonImpact) {
            this.totalCarbonImpact = totalCarbonImpact;
        }

        public String getOrderDate() {
            return orderDate;
        }

        public void setOrderDate(String orderDate) {
            this.orderDate = orderDate;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getEcoRating() {
            return ecoRating;
        }

        public void setEcoRating(String ecoRating) {
            this.ecoRating = ecoRating;
        }

        public String getBuyerName() {
            return buyerName;
        }

        public void setBuyerName(String buyerName) {
            this.buyerName = buyerName;
        }
    }
    
    // Nested class for category statistics
    public static class CategoryStatsDTO {
        private String category;
        private Integer itemCount;
        private BigDecimal totalRevenue;
        private BigDecimal totalCarbonEmitted;
        private Integer orderCount;

        public CategoryStatsDTO() {}

        public CategoryStatsDTO(String category, Integer itemCount, BigDecimal totalRevenue,
                               BigDecimal totalCarbonEmitted, Integer orderCount) {
            this.category = category;
            this.itemCount = itemCount;
            this.totalRevenue = totalRevenue;
            this.totalCarbonEmitted = totalCarbonEmitted;
            this.orderCount = orderCount;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Integer getItemCount() {
            return itemCount;
        }

        public void setItemCount(Integer itemCount) {
            this.itemCount = itemCount;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }

        public BigDecimal getTotalCarbonEmitted() {
            return totalCarbonEmitted;
        }

        public void setTotalCarbonEmitted(BigDecimal totalCarbonEmitted) {
            this.totalCarbonEmitted = totalCarbonEmitted;
        }

        public Integer getOrderCount() {
            return orderCount;
        }

        public void setOrderCount(Integer orderCount) {
            this.orderCount = orderCount;
        }
    }

    // Nested class for carbon impact details
    public static class CarbonImpactDetailsDTO {
        private BigDecimal totalCarbonEmitted;
        private BigDecimal estimatedCarbonSaved;
        private BigDecimal averageCarbonPerItem;
        private Integer ecoFriendlyItemCount;
        private Integer moderateImpactItemCount;
        private Integer highImpactItemCount;

        public CarbonImpactDetailsDTO() {}

        public CarbonImpactDetailsDTO(BigDecimal totalCarbonEmitted, BigDecimal estimatedCarbonSaved,
                                     BigDecimal averageCarbonPerItem, Integer ecoFriendlyItemCount,
                                     Integer moderateImpactItemCount, Integer highImpactItemCount) {
            this.totalCarbonEmitted = totalCarbonEmitted;
            this.estimatedCarbonSaved = estimatedCarbonSaved;
            this.averageCarbonPerItem = averageCarbonPerItem;
            this.ecoFriendlyItemCount = ecoFriendlyItemCount;
            this.moderateImpactItemCount = moderateImpactItemCount;
            this.highImpactItemCount = highImpactItemCount;
        }

        public BigDecimal getTotalCarbonEmitted() {
            return totalCarbonEmitted;
        }

        public void setTotalCarbonEmitted(BigDecimal totalCarbonEmitted) {
            this.totalCarbonEmitted = totalCarbonEmitted;
        }

        public BigDecimal getEstimatedCarbonSaved() {
            return estimatedCarbonSaved;
        }

        public void setEstimatedCarbonSaved(BigDecimal estimatedCarbonSaved) {
            this.estimatedCarbonSaved = estimatedCarbonSaved;
        }

        public BigDecimal getAverageCarbonPerItem() {
            return averageCarbonPerItem;
        }

        public void setAverageCarbonPerItem(BigDecimal averageCarbonPerItem) {
            this.averageCarbonPerItem = averageCarbonPerItem;
        }

        public Integer getEcoFriendlyItemCount() {
            return ecoFriendlyItemCount;
        }

        public void setEcoFriendlyItemCount(Integer ecoFriendlyItemCount) {
            this.ecoFriendlyItemCount = ecoFriendlyItemCount;
        }

        public Integer getModerateImpactItemCount() {
            return moderateImpactItemCount;
        }

        public void setModerateImpactItemCount(Integer moderateImpactItemCount) {
            this.moderateImpactItemCount = moderateImpactItemCount;
        }

        public Integer getHighImpactItemCount() {
            return highImpactItemCount;
        }

        public void setHighImpactItemCount(Integer highImpactItemCount) {
            this.highImpactItemCount = highImpactItemCount;
        }
    }

    // Main class getters and setters
    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Integer getTotalItemsSold() {
        return totalItemsSold;
    }

    public void setTotalItemsSold(Integer totalItemsSold) {
        this.totalItemsSold = totalItemsSold;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getTotalCarbonImpact() {
        return totalCarbonImpact;
    }

    public void setTotalCarbonImpact(BigDecimal totalCarbonImpact) {
        this.totalCarbonImpact = totalCarbonImpact;
    }

    public List<SoldItemDTO> getItemsSold() {
        return itemsSold;
    }

    public void setItemsSold(List<SoldItemDTO> itemsSold) {
        this.itemsSold = itemsSold;
    }

    public List<CategoryStatsDTO> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(List<CategoryStatsDTO> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public CarbonImpactDetailsDTO getCarbonImpactDetails() {
        return carbonImpactDetails;
    }

    public void setCarbonImpactDetails(CarbonImpactDetailsDTO carbonImpactDetails) {
        this.carbonImpactDetails = carbonImpactDetails;
    }

    public Map<String, BigDecimal> getRevenueByCategory() {
        return revenueByCategory;
    }

    public void setRevenueByCategory(Map<String, BigDecimal> revenueByCategory) {
        this.revenueByCategory = revenueByCategory;
    }

    public Map<String, DailySalesDTO> getDailySales() {
        return dailySales;
    }

    public void setDailySales(Map<String, DailySalesDTO> dailySales) {
        this.dailySales = dailySales;
    }
    
    // Nested class for daily sales data
    public static class DailySalesDTO {
        private String date;
        private Integer itemsSold;
        private BigDecimal revenue;
        private Integer orderCount;

        public DailySalesDTO() {}

        public DailySalesDTO(String date, Integer itemsSold, BigDecimal revenue, Integer orderCount) {
            this.date = date;
            this.itemsSold = itemsSold;
            this.revenue = revenue;
            this.orderCount = orderCount;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public Integer getItemsSold() {
            return itemsSold;
        }

        public void setItemsSold(Integer itemsSold) {
            this.itemsSold = itemsSold;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }

        public Integer getOrderCount() {
            return orderCount;
        }

        public void setOrderCount(Integer orderCount) {
            this.orderCount = orderCount;
        }
    }
}
