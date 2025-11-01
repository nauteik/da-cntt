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
    
    // Find daily notes by staff ordered by check-in time
    List<DailyNote> findByStaffOrderByCheckInTimeDesc(Staff staff);
    
    // Find daily notes with incomplete check-out (checked in but not checked out)
    @Query("SELECT dn FROM DailyNote dn WHERE dn.staff = :staff AND dn.checkInTime IS NOT NULL AND dn.checkOutTime IS NULL")
    List<DailyNote> findIncompleteCheckOutByStaff(@Param("staff") Staff staff);
    
    // Find daily notes by staff and date range
    @Query("SELECT dn FROM DailyNote dn WHERE dn.staff = :staff AND dn.checkInTime BETWEEN :startDate AND :endDate ORDER BY dn.checkInTime DESC")
    List<DailyNote> findByStaffAndDateRange(@Param("staff") Staff staff, 
                                            @Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate);
    
    // Find invalid check-ins or check-outs (outside 1km radius)
    @Query("SELECT dn FROM DailyNote dn WHERE dn.checkInValid = false OR dn.checkOutValid = false ORDER BY dn.checkInTime DESC")
    List<DailyNote> findInvalidCheckInCheckOuts();
    
    // Count daily notes by staff and date
    @Query("SELECT COUNT(dn) FROM DailyNote dn WHERE dn.staff = :staff AND DATE(dn.checkInTime) = DATE(:date)")
    Long countByStaffAndDate(@Param("staff") Staff staff, @Param("date") LocalDateTime date);
}
