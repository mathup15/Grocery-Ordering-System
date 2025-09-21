package org.orderingsystem.grocerryorderingsystem.service;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.*;
import org.orderingsystem.grocerryorderingsystem.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Cart cart = Cart.builder().user(user).build();
                    return cartRepository.save(cart);
                });
    }

    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getIsActive()) {
            throw new RuntimeException("Product is not available");
        }

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock available");
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;

            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock for total quantity");
            }

            item.setQuantity(newQuantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();
            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    public Cart updateCartItem(Long userId, Long productId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            Product product = item.getProduct();
            if (product.getStockQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock available");
            }
            item.setQuantity(quantity);
        }

        return cartRepository.save(cart);
    }

    public Cart removeFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);

        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));

        return cartRepository.save(cart);
    }

    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public Cart applyPromoCode(Long userId, String promoCode) {
        Cart cart = getOrCreateCart(userId);

        // Simple promo code validation (you can expand this)
        BigDecimal discount = BigDecimal.ZERO;
        switch (promoCode.toUpperCase()) {
            case "SAVE10":
                discount = cart.getTotalAmount().multiply(new BigDecimal("0.10"));
                break;
            case "FIRST20":
                discount = cart.getTotalAmount().multiply(new BigDecimal("0.20"));
                break;
            case "WELCOME5":
                discount = new BigDecimal("5.00");
                break;
            default:
                throw new RuntimeException("Invalid promo code");
        }

        // Store discount information (you might want to add this to Cart model)
        return cart;
    }
}