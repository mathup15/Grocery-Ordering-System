package org.orderingsystem.grocerryorderingsystem.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.Cart;
import org.orderingsystem.grocerryorderingsystem.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable Long userId) {
        try {
            Cart cart = cartService.getOrCreateCart(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<?> addToCart(@PathVariable Long userId, @RequestBody AddToCartRequest request) {
        try {
            Cart cart = cartService.addToCart(userId, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(new ApiResponse("Item added to cart successfully", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiError(e.getMessage()));
        }
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<?> updateCartItem(@PathVariable Long userId, @RequestBody UpdateCartRequest request) {
        try {
            Cart cart = cartService.updateCartItem(userId, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(new ApiResponse("Cart updated successfully", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiError(e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long userId, @PathVariable Long productId) {
        try {
            Cart cart = cartService.removeFromCart(userId, productId);
            return ResponseEntity.ok(new ApiResponse("Item removed from cart", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiError(e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        try {
            cartService.clearCart(userId);
            return ResponseEntity.ok(new ApiResponse("Cart cleared successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiError(e.getMessage()));
        }
    }

    @PostMapping("/{userId}/apply-promo")
    public ResponseEntity<?> applyPromoCode(@PathVariable Long userId, @RequestBody PromoCodeRequest request) {
        try {
            Cart cart = cartService.applyPromoCode(userId, request.getPromoCode());
            return ResponseEntity.ok(new ApiResponse("Promo code applied successfully", cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiError(e.getMessage()));
        }
    }

    // DTOs
    @Data
    static class AddToCartRequest {
        private Long productId;
        private Integer quantity;
    }

    @Data
    static class UpdateCartRequest {
        private Long productId;
        private Integer quantity;
    }

    @Data
    static class PromoCodeRequest {
        private String promoCode;
    }

    public record ApiResponse(String message, Object data) {}
    public record ApiError(String error) {}
}