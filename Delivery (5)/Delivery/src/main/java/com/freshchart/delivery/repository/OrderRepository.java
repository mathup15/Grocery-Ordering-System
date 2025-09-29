package com.freshchart.delivery.repository;

import com.freshchart.delivery.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(String status); // READY / ASSIGNED / DELIVERED / FAILED
}
