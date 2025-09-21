package org.orderingsystem.grocerryorderingsystem.service;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.*;
import org.orderingsystem.grocerryorderingsystem.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Order createOrderFromCart(Long userId, OrderRequest request) {
        Cart cart = cartService.getOrCreateCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate stock availability
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
        }

        // Calculate totals
        BigDecimal subtotal = cart.getTotalAmount();
        BigDecimal deliveryFee = calculateDeliveryFee(subtotal);
        BigDecimal tax = calculateTax(subtotal);
        BigDecimal discountAmount = calculateDiscount(request.getPromoCode(), subtotal);
        BigDecimal totalAmount = subtotal.add(deliveryFee).add(tax).subtract(discountAmount);

        // Create order
        Order order = Order.builder()
                .customer(customer)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .tax(tax)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryInstructions(request.getDeliveryInstructions())
                .preferredDeliveryTime(request.getPreferredDeliveryTime())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("PENDING")
                .promoCode(request.getPromoCode())
                .build();

        // Create order items
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .subtotal(cartItem.getSubtotal())
                    .productName(cartItem.getProduct().getName())
                    .productImage(cartItem.getProduct().getImageUrl())
                    .build();
            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);

        // Update product stock
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Clear cart
        cartService.clearCart(userId);

        return savedOrder;
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        return orderRepository.save(order);
    }

    private BigDecimal calculateDeliveryFee(BigDecimal subtotal) {
        // Free delivery for orders over $50
        if (subtotal.compareTo(new BigDecimal("50.00")) >= 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal("5.99");
    }

    private BigDecimal calculateTax(BigDecimal subtotal) {
        // 8% tax rate
        return subtotal.multiply(new BigDecimal("0.08"));
    }

    private BigDecimal calculateDiscount(String promoCode, BigDecimal subtotal) {
        if (promoCode == null || promoCode.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        switch (promoCode.toUpperCase()) {
            case "SAVE10":
                return subtotal.multiply(new BigDecimal("0.10"));
            case "FIRST20":
                return subtotal.multiply(new BigDecimal("0.20"));
            case "WELCOME5":
                return new BigDecimal("5.00");
            default:
                return BigDecimal.ZERO;
        }
    }

    // DTO class for order requests
    public static class OrderRequest {
        private String deliveryAddress;
        private String deliveryInstructions;
        private LocalDateTime preferredDeliveryTime;
        private String paymentMethod;
        private String promoCode;

        // Getters and setters
        public String getDeliveryAddress() { return deliveryAddress; }
        public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

        public String getDeliveryInstructions() { return deliveryInstructions; }
        public void setDeliveryInstructions(String deliveryInstructions) { this.deliveryInstructions = deliveryInstructions; }

        public LocalDateTime getPreferredDeliveryTime() { return preferredDeliveryTime; }
        public void setPreferredDeliveryTime(LocalDateTime preferredDeliveryTime) { this.preferredDeliveryTime = preferredDeliveryTime; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getPromoCode() { return promoCode; }
        public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
    }
}