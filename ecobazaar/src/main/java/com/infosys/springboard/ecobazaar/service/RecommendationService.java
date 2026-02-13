package com.infosys.springboard.ecobazaar.service;

import com.infosys.springboard.ecobazaar.entity.Product;
import com.infosys.springboard.ecobazaar.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get greener alternatives for a product
     * Returns products in the same category with lower carbon impact
     */
    public List<Product> getGreenerAlternatives(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Find products in same category with lower carbon impact
        List<Product> alternatives = productRepository.findAll().stream()
                .filter(p -> p.getApproved() && p.getStock() > 0)
                .filter(p -> p.getCategory().equals(product.getCategory()))
                .filter(p -> !p.getId().equals(productId))
                .filter(p -> p.getCarbonImpact().compareTo(product.getCarbonImpact()) < 0)
                .sorted(Comparator.comparing(Product::getCarbonImpact))
                .limit(5)
                .collect(Collectors.toList());

        return alternatives;
    }

    /**
     * Calculate potential carbon savings
     */
    public Map<String, Object> calculateCarbonSavings(Long currentProductId, Long alternativeProductId, Integer quantity) {
        Product currentProduct = productRepository.findById(currentProductId)
                .orElseThrow(() -> new RuntimeException("Current product not found"));
        
        Product alternative = productRepository.findById(alternativeProductId)
                .orElseThrow(() -> new RuntimeException("Alternative product not found"));

        BigDecimal currentCarbon = currentProduct.getCarbonImpact().multiply(new BigDecimal(quantity));
        BigDecimal alternativeCarbon = alternative.getCarbonImpact().multiply(new BigDecimal(quantity));
        BigDecimal savings = currentCarbon.subtract(alternativeCarbon);
        
        double savingsPercentage = savings.divide(currentCarbon, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100)).doubleValue();

        Map<String, Object> result = new HashMap<>();
        result.put("currentCarbon", currentCarbon.doubleValue());
        result.put("alternativeCarbon", alternativeCarbon.doubleValue());
        result.put("carbonSavings", savings.doubleValue());
        result.put("savingsPercentage", savingsPercentage);
        result.put("quantity", quantity);

        return result;
    }

    /**
     * Get recommended eco-friendly products
     * Returns top eco-friendly products across all categories
     */
    public List<Product> getEcoFriendlyRecommendations(int limit) {
        return productRepository.findAll().stream()
                .filter(p -> p.getApproved() && p.getStock() > 0)
                .filter(p -> "ECO_FRIENDLY".equals(p.getEcoRating()))
                .sorted(Comparator.comparing(Product::getCarbonImpact))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get recommendations based on cart
     * Suggests greener alternatives for high-impact items in cart
     */
    public List<Map<String, Object>> getCartRecommendations(List<Long> cartProductIds) {
        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (Long productId : cartProductIds) {
            try {
                Product product = productRepository.findById(productId).orElse(null);
                if (product == null || "ECO_FRIENDLY".equals(product.getEcoRating())) {
                    continue; // Skip if already eco-friendly
                }

                List<Product> alternatives = getGreenerAlternatives(productId);
                if (!alternatives.isEmpty()) {
                    Map<String, Object> recommendation = new HashMap<>();
                    recommendation.put("currentProduct", product);
                    recommendation.put("alternatives", alternatives);
                    recommendation.put("potentialSavings", 
                        product.getCarbonImpact().subtract(alternatives.get(0).getCarbonImpact()).doubleValue());
                    recommendations.add(recommendation);
                }
            } catch (Exception e) {
                // Skip products that cause errors
                continue;
            }
        }

        return recommendations;
    }

    /**
     * Get similar products (same category, similar price range)
     */
    public List<Product> getSimilarProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Widened to ±40% for better matching (was ±30%)
        BigDecimal priceMin = product.getPrice().multiply(new BigDecimal("0.6"));
        BigDecimal priceMax = product.getPrice().multiply(new BigDecimal("1.4"));

        return productRepository.findAll().stream()
                .filter(p -> p.getApproved() && p.getStock() > 0)
                .filter(p -> !p.getId().equals(productId))
                .filter(p -> p.getCategory().equals(product.getCategory()))
                .filter(p -> p.getPrice().compareTo(priceMin) >= 0 && p.getPrice().compareTo(priceMax) <= 0)
                .sorted(Comparator.comparing(Product::getCarbonImpact))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get best eco-value products
     * Products with best balance of price and carbon impact
     */
    public List<Product> getBestEcoValueProducts(String category, int limit) {
        return productRepository.findAll().stream()
                .filter(p -> p.getApproved() && p.getStock() > 0)
                .filter(p -> category == null || p.getCategory().equals(category))
                .sorted((p1, p2) -> {
                    // Calculate eco-value score (lower is better)
                    // Score = (price / 1000) + carbonImpact
                    double score1 = p1.getPrice().doubleValue() / 1000.0 + p1.getCarbonImpact().doubleValue();
                    double score2 = p2.getPrice().doubleValue() / 1000.0 + p2.getCarbonImpact().doubleValue();
                    return Double.compare(score1, score2);
                })
                .limit(limit)
                .collect(Collectors.toList());
    }
}
