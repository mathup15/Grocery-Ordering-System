package com.freshchart.delivery.repository;
import com.freshchart.delivery.entity.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {
    boolean existsByDriverId(Long driverId);
    @Query("SELECT da FROM DeliveryAssignment da WHERE da.driver.id = ?1")
    List<DeliveryAssignment> findByDriverId(Long driverId);

    DeliveryAssignment findByOrderId(Long orderId);
}
