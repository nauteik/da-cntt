package com.example.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.model.entity.MedicationOrder;

@Repository
public interface MedicationOrderRepository extends JpaRepository<MedicationOrder, UUID> {
    List<MedicationOrder> findByPatientIdAndStatus(UUID patientId, String status);
    
    @Query("SELECT m FROM MedicationOrder m WHERE m.currentStock <= m.reorderLevel AND m.status = 'active'")
    List<MedicationOrder> findLowStockMedications();

    @Query("SELECT m FROM MedicationOrder m WHERE m.endAt IS NOT NULL AND m.endAt <= :date AND m.status = 'active'")
    List<MedicationOrder> findExpiringOrders(LocalDate date);
}
