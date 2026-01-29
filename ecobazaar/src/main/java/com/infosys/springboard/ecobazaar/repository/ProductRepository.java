package com.infosys.springboard.ecobazaar.repository;

import com.infosys.springboard.ecobazaar.entity.Product;
import com.infosys.springboard.ecobazaar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find all approved products
    List<Product> findByApprovedTrue();
    
    // Find products by seller
    List<Product> findBySeller(User seller);
    
    // Find products by seller ID
    List<Product> findBySellerId(Long sellerId);
    
    // Find eco-certified products
    List<Product> findByEcoCertifiedTrue();
    
    // Find products by eco-rating
    List<Product> findByEcoRating(String ecoRating);
    
    // Find products by category
    List<Product> findByCategory(String category);
    
    // Search products by name (case-insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);
    
    // Find products within price range
    List<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Find products with carbon impact below threshold
    List<Product> findByCarbonImpactLessThanEqual(BigDecimal maxCarbonImpact);
    
    // Complex search query: name, category, and approved status
    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND p.approved = true")
    List<Product> searchApprovedProducts(@Param("keyword") String keyword);
    
    // Find approved products by eco-rating
    List<Product> findByApprovedTrueAndEcoRating(String ecoRating);
    
    // Find approved products ordered by carbon impact (lowest first)
    @Query("SELECT p FROM Product p WHERE p.approved = true ORDER BY p.carbonImpact ASC")
    List<Product> findApprovedProductsOrderByCarbonImpact();
    
    // Find products awaiting approval
    List<Product> findByApprovedFalse();
    
    // Find products by category and approved status
    List<Product> findByCategoryAndApprovedTrue(String category);
    
    // Find approved eco-certified products
    List<Product> findByApprovedTrueAndEcoCertifiedTrue();
}
