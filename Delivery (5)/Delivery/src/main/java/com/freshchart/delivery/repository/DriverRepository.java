package com.freshchart.delivery.repository;

import com.freshchart.delivery.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    List<Driver> findByAvailableTrue(); // Only free drivers
}
