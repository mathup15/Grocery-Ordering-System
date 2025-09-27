package com.freshchart.delivery.repository;

import com.freshchart.delivery.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find all READY & unassigned orders
    @Query("SELECT o FROM Order o " +
            "WHERE o.status = 'READY' " +
            "AND o.id NOT IN (SELECT da.order.id FROM DeliveryAssignment da)")
    List<Order> findReadyUnassignedOrders();
}
