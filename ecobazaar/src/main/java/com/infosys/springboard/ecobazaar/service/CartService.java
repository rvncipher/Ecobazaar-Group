package com.infosys.springboard.ecobazaar.service;

import com.infosys.springboard.ecobazaar.entity.Cart;
import com.infosys.springboard.ecobazaar.entity.CartItem;
import com.infosys.springboard.ecobazaar.entity.Product;
import com.infosys.springboard.ecobazaar.entity.User;
import com.infosys.springboard.ecobazaar.repository.CartRepository;
import com.infosys.springboard.ecobazaar.repository.CartItemRepository;
import com.infosys.springboard.ecobazaar.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get or create cart for user
     */
    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart(user);
                    return cartRepository.save(newCart);
                });
    }

    /**
     * Get cart by user ID
     */
    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElse(null);
    }

    /**
     * Add product to cart
     */
    @Transactional
    public Cart addToCart(User user, Long productId, Integer quantity) {
        // Get or create cart
        Cart cart = getOrCreateCart(user);

        // Find product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if product is approved and in stock
        if (!product.getApproved()) {
            throw new RuntimeException("Product is not approved for sale");
        }

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
        }

        // Check if product already exists in cart
        Optional<CartItem> existingItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId);

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;

            if (newQuantity > product.getStock()) {
                throw new RuntimeException("Total quantity exceeds available stock");
            }

            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            // Create new cart item
            CartItem newItem = new CartItem(cart, product, quantity);
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        // Recalculate totals
        cart.calculateTotals();
        return cartRepository.save(cart);
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public Cart updateCartItemQuantity(User user, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify the cart item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        // Check stock availability
        if (quantity > cartItem.getProduct().getStock()) {
            throw new RuntimeException("Insufficient stock. Available: " + 
                    cartItem.getProduct().getStock());
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return removeFromCart(user, cartItemId);
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        cart.calculateTotals();
        return cartRepository.save(cart);
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public Cart removeFromCart(User user, Long cartItemId) {
        Cart cart = getOrCreateCart(user);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        // Verify the cart item belongs to user's cart
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user");
        }

        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);

        cart.calculateTotals();
        return cartRepository.save(cart);
    }

    /**
     * Clear all items from cart
     */
    @Transactional
    public Cart clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        
        cartItemRepository.deleteByCartId(cart.getId());
        cart.clearItems();
        
        return cartRepository.save(cart);
    }

    /**
     * Get cart item count for user
     */
    public Integer getCartItemCount(User user) {
        Cart cart = cartRepository.findByUser(user).orElse(null);
        return cart != null ? cart.getTotalItems() : 0;
    }
}
