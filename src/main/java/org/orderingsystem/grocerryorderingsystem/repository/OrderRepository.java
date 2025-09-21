package org.orderingsystem.grocerryorderingsystem.repository;

import org.orderingsystem.grocerryorderingsystem.model.Order;
import org.orderingsystem.grocerryorderingsystem.model.OrderStatus;
import org.orderingsystem.grocerryorderingsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find orders by customer, ordered by creation date (newest first)
    List<Order> findByCustomerOrderByCreatedAtDesc(User customer);

    // Find orders by customer ID, ordered by creation date (newest first)
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // Find order by order number
    Optional<Order> findByOrderNumber(String orderNumber);

    // Find orders by status
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    // Find orders by payment status
    List<Order> findByPaymentStatusOrderByCreatedAtDesc(String paymentStatus);

    // Find orders within a date range
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findOrdersBetweenDates(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate);

    // Count orders by status
    long countByStatus(OrderStatus status);

    // Check if order exists by order number
    boolean existsByOrderNumber(String orderNumber);
}