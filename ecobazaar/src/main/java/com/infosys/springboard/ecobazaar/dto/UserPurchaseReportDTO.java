package com.infosys.springboard.ecobazaar.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Report DTO for USER showing items BOUGHT
 */
public class UserPurchaseReportDTO {
    private Long userId;
    private String userName;
    private String month;
    private Integer totalItemsBought;
    private Integer totalOrders;
    private BigDecimal totalSpent;
    private BigDecimal totalCarbonEmitted;
    private List<PurchasedItemDTO> itemsBought;
    
    // New fields for enhanced reporting
    private List<CategoryStatsDTO> categoryBreakdown;
    private CarbonImpactDetailsDTO carbonImpactDetails;
    private Map<String, BigDecimal> priceByCategory;

    public UserPurchaseReportDTO() {
        this.itemsBought = new ArrayList<>();
        this.totalItemsBought = 0;
        this.totalOrders = 0;
        this.totalSpent = BigDecimal.ZERO;
        this.totalCarbonEmitted = BigDecimal.ZERO;
        this.categoryBreakdown = new ArrayList<>();
        this.carbonImpactDetails = new CarbonImpactDetailsDTO();
        this.priceByCategory = new HashMap<>();
    }

    public UserPurchaseReportDTO(Long userId, String userName, String month) {
        this();
        this.userId = userId;
        this.userName = userName;
        this.month = month;
    }

    // Nested class for purchased item details
    public static class PurchasedItemDTO {
        private String productName;
        private String category;
        private String ecoRating;
        private Integer quantityBought;
        private BigDecimal pricePerUnit;
        private BigDecimal totalCost;
        private BigDecimal carbonImpactPerUnit;
        private BigDecimal totalCarbonEmitted;
        private String orderDate;
        private String sellerName;

        public PurchasedItemDTO() {}

        public PurchasedItemDTO(String productName, String category, String ecoRating,
                               Integer quantityBought, BigDecimal pricePerUnit,
                               BigDecimal totalCost, BigDecimal carbonImpactPerUnit,
                               BigDecimal totalCarbonEmitted, String orderDate, String sellerName) {
            this.productName = productName;
            this.category = category;
            this.ecoRating = ecoRating;
            this.quantityBought = quantityBought;
            this.pricePerUnit = pricePerUnit;
            this.totalCost = totalCost;
            this.carbonImpactPerUnit = carbonImpactPerUnit;
            this.totalCarbonEmitted = totalCarbonEmitted;
            this.orderDate = orderDate;
            this.sellerName = sellerName;
        }

        // Getters and Setters
        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
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

        public Integer getQuantityBought() {
            return quantityBought;
        }

        public void setQuantityBought(Integer quantityBought) {
            this.quantityBought = quantityBought;
        }

        public BigDecimal getPricePerUnit() {
            return pricePerUnit;
        }

        public void setPricePerUnit(BigDecimal pricePerUnit) {
            this.pricePerUnit = pricePerUnit;
        }

        public BigDecimal getTotalCost() {
            return totalCost;
        }

        public void setTotalCost(BigDecimal totalCost) {
            this.totalCost = totalCost;
        }

        public BigDecimal getCarbonImpactPerUnit() {
            return carbonImpactPerUnit;
        }

        public void setCarbonImpactPerUnit(BigDecimal carbonImpactPerUnit) {
            this.carbonImpactPerUnit = carbonImpactPerUnit;
        }

        public BigDecimal getTotalCarbonEmitted() {
            return totalCarbonEmitted;
        }

        public void setTotalCarbonEmitted(BigDecimal totalCarbonEmitted) {
            this.totalCarbonEmitted = totalCarbonEmitted;
        }

        public String getOrderDate() {
            return orderDate;
        }

        public void setOrderDate(String orderDate) {
            this.orderDate = orderDate;
        }

        public String getSellerName() {
            return sellerName;
        }

        public void setSellerName(String sellerName) {
            this.sellerName = sellerName;
        }
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public Integer getTotalItemsBought() {
        return totalItemsBought;
    }

    public void setTotalItemsBought(Integer totalItemsBought) {
        this.totalItemsBought = totalItemsBought;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public BigDecimal getTotalCarbonEmitted() {
        return totalCarbonEmitted;
    }

    public void setTotalCarbonEmitted(BigDecimal totalCarbonEmitted) {
        this.totalCarbonEmitted = totalCarbonEmitted;
    }

    public List<PurchasedItemDTO> getItemsBought() {
        return itemsBought;
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

    public Map<String, BigDecimal> getPriceByCategory() {
        return priceByCategory;
    }

    public void setPriceByCategory(Map<String, BigDecimal> priceByCategory) {
        this.priceByCategory = priceByCategory;
    }

    // Nested class for category statistics
    public static class CategoryStatsDTO {
        private String category;
        private Integer itemCount;
        private BigDecimal totalSpent;
        private BigDecimal totalCarbonEmitted;
        private Integer orderCount;

        public CategoryStatsDTO() {}

        public CategoryStatsDTO(String category, Integer itemCount, BigDecimal totalSpent, 
                               BigDecimal totalCarbonEmitted, Integer orderCount) {
            this.category = category;
            this.itemCount = itemCount;
            this.totalSpent = totalSpent;
            this.totalCarbonEmitted = totalCarbonEmitted;
            this.orderCount = orderCount;
        }

        // Getters and Setters
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

        public BigDecimal getTotalSpent() {
            return totalSpent;
        }

        public void setTotalSpent(BigDecimal totalSpent) {
            this.totalSpent = totalSpent;
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
        private BigDecimal estimatedCarbonSaved;  // If user had chosen high-impact alternatives
        private BigDecimal averageCarbonPerItem;
        private Integer ecoFriendlyItemCount;
        private Integer highImpactItemCount;
        private Integer moderateImpactItemCount;

        public CarbonImpactDetailsDTO() {
            this.totalCarbonEmitted = BigDecimal.ZERO;
            this.estimatedCarbonSaved = BigDecimal.ZERO;
            this.averageCarbonPerItem = BigDecimal.ZERO;
            this.ecoFriendlyItemCount = 0;
            this.highImpactItemCount = 0;
            this.moderateImpactItemCount = 0;
        }

        // Getters and Setters
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

        public Integer getHighImpactItemCount() {
            return highImpactItemCount;
        }

        public void setHighImpactItemCount(Integer highImpactItemCount) {
            this.highImpactItemCount = highImpactItemCount;
        }

        public Integer getModerateImpactItemCount() {
            return moderateImpactItemCount;
        }

        public void setModerateImpactItemCount(Integer moderateImpactItemCount) {
            this.moderateImpactItemCount = moderateImpactItemCount;
        }
    }
    public void setItemsBought(List<PurchasedItemDTO> itemsBought) {
        this.itemsBought = itemsBought;
    }
}
