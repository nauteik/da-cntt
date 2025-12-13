package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.ScheduleEvent;
import com.example.backend.model.entity.ServiceDelivery;
import com.example.backend.model.entity.Staff;
import com.example.backend.model.enums.TaskStatus;

/**
 * Repository for ServiceDelivery entity
 */
@Repository
public interface ServiceDeliveryRepository extends JpaRepository<ServiceDelivery, UUID> {
    
    /**
     * Find service deliveries by staff ordered by start date descending
     */
    @Query("SELECT sd FROM ServiceDelivery sd WHERE sd.scheduleEvent.staff = :staff ORDER BY sd.startAt DESC")
    List<ServiceDelivery> findByStaffOrderByStartAtDesc(@Param("staff") Staff staff);
    
    /**
     * Find service deliveries by patient ordered by start date descending
     */
    @Query("SELECT sd FROM ServiceDelivery sd WHERE sd.scheduleEvent.patient = :patient ORDER BY sd.startAt DESC")
    List<ServiceDelivery> findByPatientOrderByStartAtDesc(@Param("patient") Patient patient);
    
    /**
     * Find service deliveries by office ordered by start date descending
     */
    @Query("SELECT sd FROM ServiceDelivery sd WHERE sd.scheduleEvent.office = :office ORDER BY sd.startAt DESC")
    List<ServiceDelivery> findByOfficeOrderByStartAtDesc(@Param("office") Office office);
    
    /**
     * Find service deliveries by date range
     */
    @Query("SELECT sd FROM ServiceDelivery sd WHERE sd.startAt >= :startDate AND sd.endAt <= :endDate ORDER BY sd.startAt DESC")
    List<ServiceDelivery> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find service deliveries by task status
     */
    List<ServiceDelivery> findByTaskStatusOrderByStartAtDesc(TaskStatus taskStatus);
    
    /**
     * Find service deliveries by approval status
     */
    List<ServiceDelivery> findByApprovalStatusOrderByStartAtDesc(String approvalStatus);
    
    /**
     * Find service deliveries by schedule event
     */
    @Query("SELECT sd FROM ServiceDelivery sd WHERE sd.scheduleEvent.id = :scheduleEventId")
    List<ServiceDelivery> findByScheduleEventId(@Param("scheduleEventId") UUID scheduleEventId);
    
    /**
     * Find the most recent service delivery for a schedule event
     */
    java.util.Optional<ServiceDelivery> findFirstByScheduleEvent_IdOrderByCreatedAtDesc(UUID scheduleEventId);
    
    /**
     * Check if service delivery exists for a schedule event
     */
    @Query("SELECT CASE WHEN COUNT(sd) > 0 THEN true ELSE false END FROM ServiceDelivery sd WHERE sd.scheduleEvent = :scheduleEvent")
    boolean existsByScheduleEvent(@Param("scheduleEvent") ScheduleEvent scheduleEvent);
}
