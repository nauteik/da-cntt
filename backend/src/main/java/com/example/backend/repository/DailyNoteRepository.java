package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.model.entity.DailyNote;
import com.example.backend.model.entity.Staff;

@Repository
public interface DailyNoteRepository extends JpaRepository<DailyNote, UUID> {
    List<DailyNote> findByPatientId(UUID patientId);
    List<DailyNote> findByStaffId(UUID staffId);
    List<DailyNote> findByServiceDeliveryId(UUID serviceDeliveryId);
    
    // Find daily notes by staff ordered by creation date
    List<DailyNote> findByStaffOrderByCreatedAtDesc(Staff staff);
    
    // Find daily notes by staff and date range (based on created_at)
    @Query("SELECT dn FROM DailyNote dn WHERE dn.staff = :staff AND dn.createdAt BETWEEN :startDate AND :endDate ORDER BY dn.createdAt DESC")
    List<DailyNote> findByStaffAndDateRange(@Param("staff") Staff staff, 
                                            @Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate);
    
    // Count daily notes by staff and date (based on created_at)
    @Query("SELECT COUNT(dn) FROM DailyNote dn WHERE dn.staff = :staff AND DATE(dn.createdAt) = DATE(:date)")
    Long countByStaffAndDate(@Param("staff") Staff staff, @Param("date") LocalDateTime date);
    
    // Find daily notes by patient ordered by creation date
    @Query("SELECT dn FROM DailyNote dn WHERE dn.patient.id = :patientId ORDER BY dn.createdAt DESC")
    List<DailyNote> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") UUID patientId);
    
    // Find first daily note by service delivery ID (to check if daily note exists for a service delivery)
    java.util.Optional<DailyNote> findFirstByServiceDelivery_IdOrderByCreatedAtDesc(UUID serviceDeliveryId);
}
