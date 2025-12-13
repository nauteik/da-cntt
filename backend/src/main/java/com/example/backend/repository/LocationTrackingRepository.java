package com.example.backend.repository;

import com.example.backend.model.entity.LocationTracking;
import com.example.backend.model.entity.ServiceDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LocationTrackingRepository extends JpaRepository<LocationTracking, UUID> {
    
    /**
     * Get all location points for a service delivery ordered by time
     */
    List<LocationTracking> findByServiceDeliveryOrderByRecordedAtAsc(ServiceDelivery serviceDelivery);
    
    /**
     * Get all location points for a service delivery by ID ordered by time
     */
    @Query("SELECT lt FROM LocationTracking lt WHERE lt.serviceDelivery.id = :serviceDeliveryId ORDER BY lt.recordedAt ASC")
    List<LocationTracking> findByServiceDeliveryIdOrderByRecordedAtAsc(@Param("serviceDeliveryId") UUID serviceDeliveryId);
    
    /**
     * Get location points within a time range
     */
    @Query("SELECT lt FROM LocationTracking lt WHERE lt.serviceDelivery.id = :serviceDeliveryId " +
           "AND lt.recordedAt BETWEEN :startTime AND :endTime ORDER BY lt.recordedAt ASC")
    List<LocationTracking> findByServiceDeliveryAndTimeRange(
        @Param("serviceDeliveryId") UUID serviceDeliveryId,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Count tracking points for a service delivery
     */
    long countByServiceDelivery(ServiceDelivery serviceDelivery);
    
    /**
     * Delete all tracking points for a service delivery
     */
    void deleteByServiceDelivery(ServiceDelivery serviceDelivery);
    
    /**
     * Delete old tracking data before a certain date
     */
    @Query("DELETE FROM LocationTracking lt WHERE lt.recordedAt < :cutoffDate")
    void deleteByRecordedAtBefore(@Param("cutoffDate") OffsetDateTime cutoffDate);
}
