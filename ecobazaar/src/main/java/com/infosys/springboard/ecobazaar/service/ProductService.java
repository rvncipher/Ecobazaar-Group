package com.infosys.springboard.ecobazaar.service;

import com.infosys.springboard.ecobazaar.entity.Product;
import com.infosys.springboard.ecobazaar.entity.User;
import com.infosys.springboard.ecobazaar.repository.ProductRepository;
import com.infosys.springboard.ecobazaar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CarbonCalculationService carbonCalculationService;

    /**
     * Create a new product
     */
    public Product createProduct(Product product, Long sellerId) {
        // Find seller
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));

        // Set seller
        product.setSeller(seller);

        // Calculate and set eco-rating based on carbon impact
        if (product.getCarbonImpact() != null) {
            String ecoRating = carbonCalculationService.calculateEcoRating(product.getCarbonImpact());
            product.setEcoRating(ecoRating);

            // Auto-set eco-certification if qualifies
            if (carbonCalculationService.qualifiesForEcoCertification(product.getCarbonImpact())) {
                product.setEcoCertified(true);
            }
        }

        // Products require admin approval by default
        product.setApproved(false);

        return productRepository.save(product);
    }

    /**
     * Get product by ID
     */
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    /**
     * Get all products (admin only)
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Get all approved products (public)
     */
    public List<Product> getApprovedProducts() {
        return productRepository.findByApprovedTrue();
    }

    /**
     * Get products by seller ID
     */
    public List<Product> getProductsBySellerId(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    /**
     * Update product
     */
    public Product updateProduct(Long id, Product updatedProduct, Long sellerId) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Verify seller owns this product
        if (!existingProduct.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to update this product");
        }

        // Update fields
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStock(updatedProduct.getStock());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());

        // Update carbon impact and recalculate eco-rating
        if (updatedProduct.getCarbonImpact() != null) {
            existingProduct.setCarbonImpact(updatedProduct.getCarbonImpact());
            String ecoRating = carbonCalculationService.calculateEcoRating(updatedProduct.getCarbonImpact());
            existingProduct.setEcoRating(ecoRating);

            // Update eco-certification status
            boolean qualifies = carbonCalculationService.qualifiesForEcoCertification(updatedProduct.getCarbonImpact());
            existingProduct.setEcoCertified(qualifies);
        }

        // Reset approval status if major changes made
        existingProduct.setApproved(false);

        return productRepository.save(existingProduct);
    }

    /**
     * Delete product
     */
    public void deleteProduct(Long id, Long sellerId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        // Verify seller owns this product
        if (!product.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("You are not authorized to delete this product");
        }

        productRepository.delete(product);
    }

    /**
     * Admin: Approve product
     */
    public Product approveProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setApproved(true);
        return productRepository.save(product);
    }

    /**
     * Admin: Reject/unapprove product
     */
    public Product unapproveProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setApproved(false);
        return productRepository.save(product);
    }

    /**
     * Admin: Set eco-certification manually
     */
    public Product setEcoCertification(Long id, boolean certified) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setEcoCertified(certified);
        return productRepository.save(product);
    }

    /**
     * Get products pending approval
     */
    public List<Product> getPendingProducts() {
        return productRepository.findByApprovedFalse();
    }

    /**
     * Search approved products by keyword
     */
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchApprovedProducts(keyword);
    }

    /**
     * Filter approved products by category
     */
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndApprovedTrue(category);
    }

    /**
     * Filter approved products by eco-rating
     */
    public List<Product> getProductsByEcoRating(String ecoRating) {
        return productRepository.findByApprovedTrueAndEcoRating(ecoRating);
    }

    /**
     * Get eco-certified products
     */
    public List<Product> getEcoCertifiedProducts() {
        return productRepository.findByApprovedTrueAndEcoCertifiedTrue();
    }

    /**
     * Get products sorted by lowest carbon impact
     */
    public List<Product> getProductsSortedByCarbonImpact() {
        return productRepository.findApprovedProductsOrderByCarbonImpact();
    }

    /**
     * Filter products by price range
     */
    public List<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        List<Product> products = productRepository.findByPriceBetween(minPrice, maxPrice);
        // Filter only approved products
        return products.stream()
                .filter(Product::getApproved)
                .toList();
    }

    /**
     * Filter products by max carbon impact
     */
    public List<Product> getProductsByMaxCarbonImpact(BigDecimal maxCarbonImpact) {
        List<Product> products = productRepository.findByCarbonImpactLessThanEqual(maxCarbonImpact);
        // Filter only approved products
        return products.stream()
                .filter(Product::getApproved)
                .toList();
    }

    /**
     * Get product count by eco-rating (for analytics)
     */
    public long getProductCountByEcoRating(String ecoRating) {
        return productRepository.findByApprovedTrueAndEcoRating(ecoRating).size();
    }
}
