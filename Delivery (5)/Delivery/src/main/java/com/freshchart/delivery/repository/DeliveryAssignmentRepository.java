package com.freshchart.delivery.repository;

import com.freshchart.delivery.entity.DeliveryAssignment;
import com.freshchart.delivery.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    Optional<DeliveryAssignment> findByOrder(Order order);

    boolean existsByDriverId(Long driverId);
}
