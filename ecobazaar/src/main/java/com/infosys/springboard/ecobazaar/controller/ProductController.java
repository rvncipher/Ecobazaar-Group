package com.infosys.springboard.ecobazaar.controller;

import com.infosys.springboard.ecobazaar.entity.Product;
import com.infosys.springboard.ecobazaar.entity.User;
import com.infosys.springboard.ecobazaar.repository.UserRepository;
import com.infosys.springboard.ecobazaar.security.JwtUtil;
import com.infosys.springboard.ecobazaar.service.ProductService;
import com.infosys.springboard.ecobazaar.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private RecommendationService recommendationService;

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

    /*
    Create a new product (for SELLER only)
    */
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product, 
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            User seller = getUserFromToken(authHeader);

            // Only SELLER can create products
            if (!"SELLER".equalsIgnoreCase(seller.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only sellers can create products");
            }

            Product createdProduct = productService.createProduct(product, seller.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get all approved products (PUBLIC)
     */
    @GetMapping("/approved")
    public ResponseEntity<List<Product>> getApprovedProducts() {
        List<Product> products = productService.getApprovedProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Search products by keyword (PUBLIC)
     */
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        List<Product> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }

    /**
     * Get products by category (PUBLIC)
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    /**
     * Filter by eco-rating (PUBLIC)
     */
    @GetMapping("/filter/eco-rating")
    public ResponseEntity<List<Product>> getProductsByEcoRating(@RequestParam String rating) {
        List<Product> products = productService.getProductsByEcoRating(rating);
        return ResponseEntity.ok(products);
    }

    /**
     * Get eco-certified products (PUBLIC)
     */
    @GetMapping("/eco-certified")
    public ResponseEntity<List<Product>> getEcoCertifiedProducts() {
        List<Product> products = productService.getEcoCertifiedProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get products sorted by carbon impact (PUBLIC)
     */
    @GetMapping("/eco-sorted")
    public ResponseEntity<List<Product>> getProductsSortedByCarbonImpact() {
        List<Product> products = productService.getProductsSortedByCarbonImpact();
        return ResponseEntity.ok(products);
    }

    /**
     * Filter by price range (PUBLIC)
     */
    @GetMapping("/filter/price")
    public ResponseEntity<List<Product>> getProductsByPriceRange(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max) {
        List<Product> products = productService.getProductsByPriceRange(min, max);
        return ResponseEntity.ok(products);
    }

    /**
     * Filter by max carbon impact (PUBLIC)
     */
    @GetMapping("/filter/carbon")
    public ResponseEntity<List<Product>> getProductsByMaxCarbonImpact(
            @RequestParam BigDecimal max) {
        List<Product> products = productService.getProductsByMaxCarbonImpact(max);
        return ResponseEntity.ok(products);
    }

    /**
     * Get seller's own products (SELLER only)
     */
    @GetMapping("/my-products")
    public ResponseEntity<?> getMyProducts(@RequestHeader("Authorization") String authHeader) {
        try {
            User seller = getUserFromToken(authHeader);
            List<Product> products = productService.getProductsBySellerId(seller.getId());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Update product (SELLER only - own products)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User seller = getUserFromToken(authHeader);
            Product updatedProduct = productService.updateProduct(id, product, seller.getId());
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Delete product (SELLER only - own products)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, 
                                           @RequestHeader("Authorization") String authHeader) {
        try {
            User seller = getUserFromToken(authHeader);
            productService.deleteProduct(id, seller.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get all products including unapproved (ADMIN only)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllProducts(@RequestHeader("Authorization") String authHeader) {
        try {
            User admin = getUserFromToken(authHeader);

            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
            }

            List<Product> products = productService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get pending products (ADMIN only)
     */
    @GetMapping("/admin/pending")
    public ResponseEntity<?> getPendingProducts(@RequestHeader("Authorization") String authHeader) {
        try {
            User admin = getUserFromToken(authHeader);

            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
            }

            List<Product> products = productService.getPendingProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Approve product (ADMIN only)
     */
    @PutMapping("/admin/{id}/approve")
    public ResponseEntity<?> approveProduct(@PathVariable Long id, 
                                            @RequestHeader("Authorization") String authHeader) {
        try {
            User admin = getUserFromToken(authHeader);

            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
            }

            Product product = productService.approveProduct(id);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Unapprove product (ADMIN only)
     */
    @PutMapping("/admin/{id}/unapprove")
    public ResponseEntity<?> unapproveProduct(@PathVariable Long id, 
                                              @RequestHeader("Authorization") String authHeader) {
        try {
            User admin = getUserFromToken(authHeader);

            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
            }

            Product product = productService.unapproveProduct(id);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Set eco-certification (ADMIN only)
     */
    @PutMapping("/admin/{id}/eco-certify")
    public ResponseEntity<?> setEcoCertification(
            @PathVariable Long id,
            @RequestParam boolean certified,
            @RequestHeader("Authorization") String authHeader) {
        try {
            User admin = getUserFromToken(authHeader);

            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
            }

            Product product = productService.setEcoCertification(id, certified);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get greener alternatives for a product (PUBLIC)
     */
    @GetMapping("/{id}/alternatives")
    public ResponseEntity<List<Product>> getGreenerAlternatives(@PathVariable Long id) {
        List<Product> alternatives = recommendationService.getGreenerAlternatives(id);
        return ResponseEntity.ok(alternatives);
    }

    /**
     * Calculate carbon savings between products (PUBLIC)
     */
    @GetMapping("/carbon-savings")
    public ResponseEntity<?> calculateCarbonSavings(
            @RequestParam Long currentProductId,
            @RequestParam Long alternativeProductId,
            @RequestParam Integer quantity) {
        Map<String, Object> savings = recommendationService.calculateCarbonSavings(
                currentProductId, alternativeProductId, quantity);
        return ResponseEntity.ok(savings);
    }

    /**
     * Get eco-friendly recommendations (PUBLIC)
     */
    @GetMapping("/recommendations/eco-friendly")
    public ResponseEntity<List<Product>> getEcoFriendlyRecommendations(
            @RequestParam(defaultValue = "10") int limit) {
        List<Product> recommendations = recommendationService.getEcoFriendlyRecommendations(limit);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * Get similar products (PUBLIC)
     */
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<Product>> getSimilarProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "5") int limit) {
        List<Product> similar = recommendationService.getSimilarProducts(id, limit);
        return ResponseEntity.ok(similar);
    }

    /**
     * Get best eco-value products (PUBLIC)
     */
    @GetMapping("/recommendations/best-eco-value")
    public ResponseEntity<List<Product>> getBestEcoValueProducts(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") int limit) {
        List<Product> products = recommendationService.getBestEcoValueProducts(category, limit);
        return ResponseEntity.ok(products);
    }

    /**
     * Get product by ID (PUBLIC)
     * IMPORTANT: This must be LAST to avoid matching specific paths like /recommendations, /search, etc.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
