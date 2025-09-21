package org.orderingsystem.grocerryorderingsystem.controller;

import lombok.RequiredArgsConstructor;
import org.orderingsystem.grocerryorderingsystem.model.Order;
import org.orderingsystem.grocerryorderingsystem.model.OrderStatus;
import org.orderingsystem.grocerryorderingsystem.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/{userId}/create")
    public ResponseEntity<?> createOrder(@PathVariable Long userId, @RequestBody OrderService.OrderRequest request) {
        try {
            Order order = orderService.createOrderFromCart(userId, request);
            return ResponseEntity.ok(new ApiResponse("Order created successfully", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiError(e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        try {
            List<Order> orders = orderService.getUserOrders(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/order/{orderNumber}")
    public ResponseEntity<?> getOrderByNumber(@PathVariable String orderNumber) {
        try {
            Order order = orderService.getOrderByNumber(orderNumber);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiError(e.getMessage()));
        }
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody UpdateStatusRequest request) {
        try {
            Order order = orderService.updateOrderStatus(orderId, request.getStatus());
            return ResponseEntity.ok(new ApiResponse("Order status updated successfully", order));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiError(e.getMessage()));
        }
    }

    // DTOs
    static class UpdateStatusRequest {
        private OrderStatus status;

        public OrderStatus getStatus() {
            return status;
        }

        public void setStatus(OrderStatus status) {
            this.status = status;
        }
    }

    public record ApiResponse(String message, Object data) {
    }

    public record ApiError(String error) {
    }
}