package com.example.backend.repository;

import com.example.backend.model.entity.ScheduleEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, UUID> {

    List<ScheduleEvent> findAllByPatient_IdAndEventDateBetweenOrderByEventDateAscStartAtAsc(
            UUID patientId,
            LocalDate from,
            LocalDate to
    );

    List<ScheduleEvent> findAllByPatient_IdAndStaff_IdAndEventDateBetweenOrderByEventDateAscStartAtAsc(
            UUID patientId,
            UUID staffId,
            LocalDate from,
            LocalDate to
    );

    // Pagination-enabled query methods
    Page<ScheduleEvent> findAllByPatient_IdAndEventDateBetween(
            UUID patientId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    );

    Page<ScheduleEvent> findAllByPatient_IdAndStaff_IdAndEventDateBetween(
            UUID patientId,
            UUID staffId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    );

    Page<ScheduleEvent> findAllByStaff_IdAndEventDateBetween(
            UUID staffId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    );

    Page<ScheduleEvent> findAllByStaff_IdAndPatient_IdAndEventDateBetween(
            UUID staffId,
            UUID patientId,
            LocalDate from,
            LocalDate to,
            Pageable pageable
    );

    boolean existsByPatient_IdAndEventDateAndStartAt(UUID patientId, LocalDate eventDate, OffsetDateTime startAt);

    // Get distinct staff IDs that have schedule events with a patient
    @Query("SELECT DISTINCT se.staff.id FROM ScheduleEvent se WHERE se.patient.id = :patientId AND se.staff.id IS NOT NULL")
    List<UUID> findDistinctStaffIdsByPatientId(@Param("patientId") UUID patientId);

    // Get distinct patient IDs that have schedule events with a staff
    @Query("SELECT DISTINCT se.patient.id FROM ScheduleEvent se WHERE se.staff.id = :staffId")
    List<UUID> findDistinctPatientIdsByStaffId(@Param("staffId") UUID staffId);

    // Search-enabled queries with pagination
    @Query("SELECT se FROM ScheduleEvent se " +
           "WHERE se.patient.id = :patientId " +
           "AND se.eventDate BETWEEN :from AND :to " +
           "AND (:staffId IS NULL OR se.staff.id = :staffId) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(CONCAT(COALESCE(se.patient.firstName, ''), ' ', COALESCE(se.patient.lastName, ''))) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(CONCAT(COALESCE(se.staff.firstName, ''), ' ', COALESCE(se.staff.lastName, ''))) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(COALESCE(se.eventCode, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(COALESCE(se.authorization.patientService.serviceType.code, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(COALESCE(se.authorization.patientService.serviceType.name, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ScheduleEvent> findAllByPatientIdWithSearch(
            @Param("patientId") UUID patientId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("staffId") UUID staffId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT se FROM ScheduleEvent se " +
           "WHERE se.staff.id = :staffId " +
           "AND se.eventDate BETWEEN :from AND :to " +
           "AND (:patientId IS NULL OR se.patient.id = :patientId) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(CONCAT(COALESCE(se.patient.firstName, ''), ' ', COALESCE(se.patient.lastName, ''))) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(CONCAT(COALESCE(se.staff.firstName, ''), ' ', COALESCE(se.staff.lastName, ''))) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(COALESCE(se.eventCode, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(COALESCE(se.authorization.patientService.serviceType.code, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(COALESCE(se.authorization.patientService.serviceType.name, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ScheduleEvent> findAllByStaffIdWithSearch(
            @Param("staffId") UUID staffId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("patientId") UUID patientId,
            @Param("search") String search,
            Pageable pageable
    );

    // Methods for conflict detection
    List<ScheduleEvent> findByPatient_IdAndEventDate(UUID patientId, LocalDate eventDate);
    
    List<ScheduleEvent> findByStaff_IdAndEventDate(UUID staffId, LocalDate eventDate);

    // Methods for global schedule listing with filters
    // Using @Query because status is an enum and ContainingIgnoreCase doesn't work with enums
    @Query("SELECT se FROM ScheduleEvent se WHERE " +
           "se.eventDate BETWEEN :from AND :to AND " +
           "se.patient.id = :patientId AND " +
           "se.staff.id = :staffId AND " +
           "(:status IS NULL OR :status = '' OR CAST(se.status AS string) LIKE %:status%)")
    Page<ScheduleEvent> findByDateRangeAndPatientAndStaffAndStatus(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("patientId") UUID patientId,
            @Param("staffId") UUID staffId,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT se FROM ScheduleEvent se WHERE " +
           "se.eventDate BETWEEN :from AND :to AND " +
           "se.patient.id = :patientId AND " +
           "(:status IS NULL OR :status = '' OR CAST(se.status AS string) LIKE %:status%)")
    Page<ScheduleEvent> findByDateRangeAndPatientAndStatus(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("patientId") UUID patientId,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT se FROM ScheduleEvent se WHERE " +
           "se.eventDate BETWEEN :from AND :to AND " +
           "se.staff.id = :staffId AND " +
           "(:status IS NULL OR :status = '' OR CAST(se.status AS string) LIKE %:status%)")
    Page<ScheduleEvent> findByDateRangeAndStaffAndStatus(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("staffId") UUID staffId,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT se FROM ScheduleEvent se WHERE " +
           "se.eventDate BETWEEN :from AND :to AND " +
           "(:status IS NULL OR :status = '' OR CAST(se.status AS string) LIKE %:status%)")
    Page<ScheduleEvent> findByDateRangeAndStatus(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("status") String status,
            Pageable pageable
    );
}


