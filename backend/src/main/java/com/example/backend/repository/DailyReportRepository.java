package com.example.backend.repository;

import com.example.backend.model.dto.report.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.model.entity.Patient;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Daily Reports with native SQL queries
 */
@Repository
public interface DailyReportRepository extends JpaRepository<Patient, UUID> {
    
    /**
     * Find Active Client Contacts
     */
    @Query(value = """
        SELECT
            o.name as accountName,
            CONCAT(p.first_name, ' ', p.last_name) as clientName,
            p.medicaid_id as clientMedicaidId,
            pc.name as contactName,
            pc.relation as relationshipToClient,
            pc.email as email
        FROM patient p
        LEFT JOIN office o ON p.office_id = o.id
        INNER JOIN patient_contact pc ON p.id = pc.patient_id
        LEFT JOIN LATERAL (
            SELECT ppg.supervisor_id, ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN staff supervisor ON pp_latest.supervisor_id = supervisor.id
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        LEFT JOIN patient_payer pp ON p.id = pp.patient_id
        LEFT JOIN payer ON pp.payer_id = payer.id
        WHERE p.deleted_at IS NULL
            AND p.status = 'ACTIVE'
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:clientSearch IS NULL OR :clientSearch = '' OR 
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :clientSearch, '%')))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (:supervisorId IS NULL OR supervisor.id = CAST(:supervisorId AS uuid))
        ORDER BY p.last_name, p.first_name, pc.is_primary DESC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<ActiveClientContactProjection> findActiveClientContacts(
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("clientSearch") String clientSearch,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("supervisorId") UUID supervisorId,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(DISTINCT pc.id)
        FROM patient p
        INNER JOIN patient_contact pc ON p.id = pc.patient_id
        LEFT JOIN LATERAL (
            SELECT ppg.supervisor_id, ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN staff supervisor ON pp_latest.supervisor_id = supervisor.id
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        LEFT JOIN patient_payer pp ON p.id = pp.patient_id
        LEFT JOIN payer ON pp.payer_id = payer.id
        WHERE p.deleted_at IS NULL
            AND p.status = 'ACTIVE'
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:clientSearch IS NULL OR :clientSearch = '' OR 
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :clientSearch, '%')))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (:supervisorId IS NULL OR supervisor.id = CAST(:supervisorId AS uuid))
        """, nativeQuery = true)
    long countActiveClientContacts(
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("clientSearch") String clientSearch,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("supervisorId") UUID supervisorId
    );

    /**
     * Find Active Clients
     */
    @Query(value = """
        SELECT DISTINCT
            o.name as accountName,
            p.id::text as providerId,
            p.medicaid_id as clientMedicaidId,
            CONCAT(p.first_name, ' ', p.last_name) as clientName,
            p.last_name,
            p.first_name,
            COALESCE(pa.phone, '') as phone,
            COALESCE(a.line1, '') as address,
            COALESCE(a.city, '') as city,
            COALESCE(a.state, '') as state,
            COALESCE(a.postal_code, '') as zip,
            COALESCE(a.county, '') as county,
            a.latitude as latitude,
            a.longitude as longitude,
            p.created_at::date as activeSinceDate
        FROM patient p
        LEFT JOIN office o ON p.office_id = o.id
        LEFT JOIN LATERAL (
            SELECT pa.patient_id, pa.phone, pa.address_id, pa.is_main
            FROM patient_address pa
            WHERE pa.patient_id = p.id
            ORDER BY pa.is_main DESC, pa.created_at DESC
            LIMIT 1
        ) pa ON TRUE
        LEFT JOIN address a ON pa.address_id = a.id
        LEFT JOIN LATERAL (
            SELECT ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        LEFT JOIN patient_payer pp ON p.id = pp.patient_id
        LEFT JOIN payer ON pp.payer_id = payer.id
        LEFT JOIN patient_service ps ON p.id = ps.patient_id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        WHERE p.deleted_at IS NULL
            AND p.status = 'ACTIVE'
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:clientSearch IS NULL OR :clientSearch = '' OR 
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :clientSearch, '%')))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
        ORDER BY p.last_name, p.first_name
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<ActiveClientProjection> findActiveClients(
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("clientSearch") String clientSearch,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("serviceTypeIds") UUID[] serviceTypeIds,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(DISTINCT p.id)
        FROM patient p
        LEFT JOIN LATERAL (
            SELECT ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        LEFT JOIN patient_payer pp ON p.id = pp.patient_id
        LEFT JOIN payer ON pp.payer_id = payer.id
        LEFT JOIN patient_service ps ON p.id = ps.patient_id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        WHERE p.deleted_at IS NULL
            AND p.status = 'ACTIVE'
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:clientSearch IS NULL OR :clientSearch = '' OR 
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :clientSearch, '%')))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
        """, nativeQuery = true)
    long countActiveClients(
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("clientSearch") String clientSearch,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("serviceTypeIds") UUID[] serviceTypeIds
    );

    /**
     * Find Active Employees
     */
    @Query(value = """
        SELECT
            o.name as accountName,
            s.employee_id as employeeId,
            CONCAT(s.first_name, ' ', s.last_name) as employeeName,
            COALESCE(u.email, '') as employeeEmail,
            COALESCE(sa.phone, '') as phone,
            COALESCE((s.custom_fields->>'department'), '') as department
        FROM staff s
        LEFT JOIN office o ON s.office_id = o.id
        LEFT JOIN app_user u ON s.user_id = u.id
        LEFT JOIN LATERAL (
            SELECT sa.staff_id, sa.phone
            FROM staff_address sa
            WHERE sa.staff_id = s.id
            ORDER BY sa.is_main DESC
            LIMIT 1
        ) sa ON TRUE
        WHERE s.deleted_at IS NULL
            AND s.is_active = true
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
            AND (:officeId IS NULL OR o.id = CAST(:officeId AS uuid))
        ORDER BY s.last_name, s.first_name
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<ActiveEmployeeProjection> findActiveEmployees(
        @Param("employeeName") String employeeName,
        @Param("officeId") UUID officeId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(*)
        FROM staff s
        LEFT JOIN office o ON s.office_id = o.id
        WHERE s.deleted_at IS NULL
            AND s.is_active = true
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
            AND (:officeId IS NULL OR o.id = CAST(:officeId AS uuid))
        """, nativeQuery = true)
    long countActiveEmployees(
        @Param("employeeName") String employeeName,
        @Param("officeId") UUID officeId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    /**
     * Find Call Listing - ServiceDelivery with check-in/check-out times
     */
    @Query(value = """
        SELECT
            sd.id::text as serviceId,
            o.name as accountName,
            o.id::text as accountId,
            p.id::text as clientId,
            p.medicaid_id as clientMedicaidId,
            CONCAT(p.first_name, ' ', p.last_name) as clientName,
            COALESCE(pa.phone, '') as phone,
            CONCAT(s.first_name, ' ', s.last_name) as employeeName,
            s.employee_id as employeeId,
            sd.start_at::date as visitDate,
            sd.start_at::time as startTime,
            sd.end_at::time as endTime,
            check_in.occurred_at::time as callInTime,
            check_out.occurred_at::time as callOutTime,
            sd.id::text as visitKey,
            COALESCE(st.code, '') as groupCode,
            sd.status as status,
            CASE 
                WHEN sd.cancelled THEN 'C'
                WHEN check_out.id IS NULL THEN 'I'
                ELSE ''
            END as indicators
        FROM service_delivery sd
        INNER JOIN schedule_event se ON sd.schedule_event_id = se.id
        INNER JOIN patient p ON se.patient_id = p.id
        INNER JOIN office o ON se.office_id = o.id
        INNER JOIN staff s ON COALESCE(sd.actual_staff_id, se.staff_id) = s.id
        LEFT JOIN authorizations auth ON sd.authorization_id = auth.id
        LEFT JOIN patient_service ps ON auth.patient_service_id = ps.id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        LEFT JOIN LATERAL (
            SELECT pa.patient_id, pa.phone
            FROM patient_address pa
            WHERE pa.patient_id = p.id
            ORDER BY pa.is_main DESC
            LIMIT 1
        ) pa ON TRUE
        LEFT JOIN LATERAL (
            SELECT ce.id, ce.occurred_at
            FROM check_event ce
            WHERE ce.service_delivery_id = sd.id AND ce.event_type = 'CHECK_IN'
            LIMIT 1
        ) check_in ON TRUE
        LEFT JOIN LATERAL (
            SELECT ce.id, ce.occurred_at
            FROM check_event ce
            WHERE ce.service_delivery_id = sd.id AND ce.event_type = 'CHECK_OUT'
            LIMIT 1
        ) check_out ON TRUE
        LEFT JOIN patient_payer pp ON auth.patient_payer_id = pp.id
        LEFT JOIN payer ON pp.payer_id = payer.id
        LEFT JOIN LATERAL (
            SELECT ppg.supervisor_id, ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN staff supervisor ON pp_latest.supervisor_id = supervisor.id
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        WHERE p.deleted_at IS NULL
            AND (CAST(:fromDate AS DATE) IS NULL OR sd.start_at::date >= CAST(:fromDate AS DATE))
            AND (CAST(:toDate AS DATE) IS NULL OR sd.start_at::date <= CAST(:toDate AS DATE))
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:clientSearch IS NULL OR :clientSearch = '' OR 
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :clientSearch, '%')))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
            AND (:supervisorId IS NULL OR supervisor.id = CAST(:supervisorId AS uuid))
            AND (:officeId IS NULL OR o.id = CAST(:officeId AS uuid))
        ORDER BY sd.start_at DESC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<CallListingProjection> findCallListing(
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("employeeName") String employeeName,
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("clientSearch") String clientSearch,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("serviceTypeIds") UUID[] serviceTypeIds,
        @Param("supervisorId") UUID supervisorId,
        @Param("officeId") UUID officeId,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(*)
        FROM service_delivery sd
        INNER JOIN schedule_event se ON sd.schedule_event_id = se.id
        INNER JOIN patient p ON se.patient_id = p.id
        INNER JOIN office o ON se.office_id = o.id
        INNER JOIN staff s ON COALESCE(sd.actual_staff_id, se.staff_id) = s.id
        LEFT JOIN authorizations auth ON sd.authorization_id = auth.id
        LEFT JOIN patient_service ps ON auth.patient_service_id = ps.id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        LEFT JOIN patient_payer pp ON auth.patient_payer_id = pp.id
        LEFT JOIN payer ON pp.payer_id = payer.id
        LEFT JOIN LATERAL (
            SELECT ppg.supervisor_id, ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN staff supervisor ON pp_latest.supervisor_id = supervisor.id
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        WHERE p.deleted_at IS NULL
            AND (CAST(:fromDate AS DATE) IS NULL OR sd.start_at::date >= CAST(:fromDate AS DATE))
            AND (CAST(:toDate AS DATE) IS NULL OR sd.start_at::date <= CAST(:toDate AS DATE))
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:clientSearch IS NULL OR :clientSearch = '' OR 
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :clientSearch, '%')))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
            AND (:supervisorId IS NULL OR supervisor.id = CAST(:supervisorId AS uuid))
            AND (:officeId IS NULL OR o.id = CAST(:officeId AS uuid))
        """, nativeQuery = true)
    long countCallListing(
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("employeeName") String employeeName,
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("clientSearch") String clientSearch,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("serviceTypeIds") UUID[] serviceTypeIds,
        @Param("supervisorId") UUID supervisorId,
        @Param("officeId") UUID officeId
    );

    /**
     * Find Call Summary - Aggregated by client and employee
     */
    @Query(value = """
        SELECT
            o.id::text as officeId,
            p.id::text as clientId,
            p.medicaid_id as clientMedicaidId,
            CONCAT(p.first_name, ' ', p.last_name) as clientName,
            CONCAT(s.first_name, ' ', s.last_name) as employeeName,
            s.employee_id as employeeId,
            COUNT(sd.id)::text as visitKey,
            MIN(sd.start_at)::time as startTime,
            MAX(sd.end_at)::time as endTime,
            COUNT(check_in.id) as callsStart,
            COUNT(check_out.id) as callsEnd,
            COALESCE(SUM(sd.total_hours), 0) as hoursTotal,
            COALESCE(SUM(sd.units), 0) as units
        FROM service_delivery sd
        INNER JOIN schedule_event se ON sd.schedule_event_id = se.id
        INNER JOIN patient p ON se.patient_id = p.id
        INNER JOIN office o ON se.office_id = o.id
        INNER JOIN staff s ON COALESCE(sd.actual_staff_id, se.staff_id) = s.id
        LEFT JOIN check_event check_in ON sd.id = check_in.service_delivery_id AND check_in.event_type = 'CHECK_IN'
        LEFT JOIN check_event check_out ON sd.id = check_out.service_delivery_id AND check_out.event_type = 'CHECK_OUT'
        LEFT JOIN authorizations auth ON sd.authorization_id = auth.id
        LEFT JOIN patient_service ps ON auth.patient_service_id = ps.id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        LEFT JOIN patient_payer pp ON auth.patient_payer_id = pp.id
        LEFT JOIN payer ON pp.payer_id = payer.id
        LEFT JOIN LATERAL (
            SELECT ppg.supervisor_id, ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN staff supervisor ON pp_latest.supervisor_id = supervisor.id
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        WHERE p.deleted_at IS NULL
            AND (CAST(:fromDate AS DATE) IS NULL OR sd.start_at::date >= CAST(:fromDate AS DATE))
            AND (CAST(:toDate AS DATE) IS NULL OR sd.start_at::date <= CAST(:toDate AS DATE))
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:clientSearch IS NULL OR :clientSearch = '' OR 
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :clientSearch, '%')))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
            AND (:supervisorId IS NULL OR supervisor.id = CAST(:supervisorId AS uuid))
            AND (:officeId IS NULL OR o.id = CAST(:officeId AS uuid))
        GROUP BY o.id, p.id, p.medicaid_id, p.first_name, p.last_name, s.first_name, s.last_name, s.employee_id
        ORDER BY p.last_name, p.first_name, s.last_name, s.first_name
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<CallSummaryProjection> findCallSummary(
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("clientSearch") String clientSearch,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("serviceTypeIds") UUID[] serviceTypeIds,
        @Param("employeeName") String employeeName,
        @Param("supervisorId") UUID supervisorId,
        @Param("officeId") UUID officeId,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(DISTINCT CONCAT(p.id::text, '-', s.id::text))
        FROM service_delivery sd
        INNER JOIN schedule_event se ON sd.schedule_event_id = se.id
        INNER JOIN patient p ON se.patient_id = p.id
        INNER JOIN office o ON se.office_id = o.id
        INNER JOIN staff s ON COALESCE(sd.actual_staff_id, se.staff_id) = s.id
        LEFT JOIN authorizations auth ON sd.authorization_id = auth.id
        LEFT JOIN patient_service ps ON auth.patient_service_id = ps.id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        LEFT JOIN patient_payer pp ON auth.patient_payer_id = pp.id
        LEFT JOIN payer ON pp.payer_id = payer.id
        LEFT JOIN LATERAL (
            SELECT ppg.supervisor_id, ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN staff supervisor ON pp_latest.supervisor_id = supervisor.id
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        WHERE p.deleted_at IS NULL
            AND (CAST(:fromDate AS DATE) IS NULL OR sd.start_at::date >= CAST(:fromDate AS DATE))
            AND (CAST(:toDate AS DATE) IS NULL OR sd.start_at::date <= CAST(:toDate AS DATE))
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:clientSearch IS NULL OR :clientSearch = '' OR 
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :clientSearch, '%')))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
            AND (:supervisorId IS NULL OR supervisor.id = CAST(:supervisorId AS uuid))
            AND (:officeId IS NULL OR o.id = CAST(:officeId AS uuid))
        """, nativeQuery = true)
    long countCallSummary(
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("clientSearch") String clientSearch,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("serviceTypeIds") UUID[] serviceTypeIds,
        @Param("employeeName") String employeeName,
        @Param("supervisorId") UUID supervisorId,
        @Param("officeId") UUID officeId
    );

    /**
     * Find Client Address Listing
     */
    @Query(value = """
        SELECT
            o.id::text as accountId,
            o.name as accountName,
            p.medicaid_id as clientMedicaidId,
            CONCAT(p.first_name, ' ', p.last_name) as clientName,
            COALESCE(pa.tag, '') as tag,
            CASE 
                WHEN pa.is_primary THEN 'Primary'
                ELSE 'Secondary'
            END as addressType,
            COALESCE(pa.phone, '') as phone,
            COALESCE(a.line1, '') as address,
            COALESCE(a.city, '') as city,
            COALESCE(a.state, '') as state,
            COALESCE(a.postal_code, '') as zip,
            COALESCE(a.county, '') as county
        FROM patient p
        LEFT JOIN office o ON p.office_id = o.id
        INNER JOIN patient_address pa ON p.id = pa.patient_id
        LEFT JOIN address a ON pa.address_id = a.id
        WHERE p.deleted_at IS NULL
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
        ORDER BY p.last_name, p.first_name, pa.is_main DESC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<ClientAddressListingProjection> findClientAddressListing(
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(*)
        FROM patient p
        INNER JOIN patient_address pa ON p.id = pa.patient_id
        WHERE p.deleted_at IS NULL
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
        """, nativeQuery = true)
    long countClientAddressListing(@Param("clientMedicaidId") String clientMedicaidId);

    /**
     * Find Employee Attributes
     */
    @Query(value = """
        SELECT
            CONCAT(s.first_name, ' ', s.last_name) as employeeName,
            jsonb_object_keys(s.custom_fields) as attributeName,
            s.custom_fields->>jsonb_object_keys(s.custom_fields) as attributeValue
        FROM staff s
        WHERE s.deleted_at IS NULL
            AND s.is_active = true
            AND s.custom_fields IS NOT NULL
            AND jsonb_typeof(s.custom_fields) = 'object'
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
        ORDER BY s.last_name, s.first_name
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<EmployeeAttributesProjection> findEmployeeAttributes(
        @Param("employeeName") String employeeName,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(*)
        FROM staff s, jsonb_object_keys(s.custom_fields) as keys
        WHERE s.deleted_at IS NULL
            AND s.is_active = true
            AND s.custom_fields IS NOT NULL
            AND jsonb_typeof(s.custom_fields) = 'object'
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
        """, nativeQuery = true)
    long countEmployeeAttributes(@Param("employeeName") String employeeName);

    /**
     * Find GPS Distance Exception
     */
    @Query(value = """
        SELECT
            sd.id::text as serviceId,
            o.name as accountName,
            CONCAT(p.first_name, ' ', p.last_name) as clientName,
            p.medicaid_id as clientMedicaidId,
            CONCAT(s.first_name, ' ', s.last_name) as employeeName,
            sd.start_at::date as visitDate,
            sd.start_at::time as startTime,
            sd.end_at::time as endTime,
            0.0 as expectedDistance,
            COALESCE(sd.total_distance_meters / 1000.0, 0.0) as actualDistance,
            COALESCE(sd.total_distance_meters / 1000.0, 0.0) as variance,
            COALESCE(cex.reason, 'Distance variance detected') as exceptionReason
        FROM service_delivery sd
        INNER JOIN schedule_event se ON sd.schedule_event_id = se.id
        INNER JOIN patient p ON se.patient_id = p.id
        INNER JOIN office o ON se.office_id = o.id
        INNER JOIN staff s ON COALESCE(sd.actual_staff_id, se.staff_id) = s.id
        LEFT JOIN authorizations auth ON sd.authorization_id = auth.id
        LEFT JOIN patient_service ps ON auth.patient_service_id = ps.id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        LEFT JOIN check_event ce ON sd.id = ce.service_delivery_id
        LEFT JOIN check_exception cex ON ce.id = cex.check_event_id AND cex.exception_type = 'GPS_MISMATCH'
        WHERE p.deleted_at IS NULL
            AND (CAST(:fromDate AS DATE) IS NULL OR sd.start_at::date >= CAST(:fromDate AS DATE))
            AND (CAST(:toDate AS DATE) IS NULL OR sd.start_at::date <= CAST(:toDate AS DATE))
            AND (cex.id IS NOT NULL OR sd.total_distance_meters > 50000)
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
        ORDER BY sd.start_at DESC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<GpsDistanceExceptionProjection> findGpsDistanceException(
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("serviceTypeIds") UUID[] serviceTypeIds,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(DISTINCT sd.id)
        FROM service_delivery sd
        INNER JOIN schedule_event se ON sd.schedule_event_id = se.id
        INNER JOIN patient p ON se.patient_id = p.id
        LEFT JOIN authorizations auth ON sd.authorization_id = auth.id
        LEFT JOIN patient_service ps ON auth.patient_service_id = ps.id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        LEFT JOIN check_event ce ON sd.id = ce.service_delivery_id
        LEFT JOIN check_exception cex ON ce.id = cex.check_event_id AND cex.exception_type = 'GPS_MISMATCH'
        WHERE p.deleted_at IS NULL
            AND (CAST(:fromDate AS DATE) IS NULL OR sd.start_at::date >= CAST(:fromDate AS DATE))
            AND (CAST(:toDate AS DATE) IS NULL OR sd.start_at::date <= CAST(:toDate AS DATE))
            AND (cex.id IS NOT NULL OR sd.total_distance_meters > 50000)
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
        """, nativeQuery = true)
    long countGpsDistanceException(
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("serviceTypeIds") UUID[] serviceTypeIds
    );

    /**
     * Find Payer-Program-Service Listing
     */
    @Query(value = """
        SELECT DISTINCT
            payer.payer_name as payerName,
            prog.program_name as programName,
            st.code as serviceCode,
            st.name as serviceName
        FROM payer
        CROSS JOIN program prog
        CROSS JOIN service_type st
        WHERE payer.deleted_at IS NULL
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
        ORDER BY payer.payer_name, prog.program_name, st.code
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<PayerProgramServiceListingProjection> findPayerProgramServiceListing(
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(*)
        FROM (
            SELECT DISTINCT payer.id, prog.id, st.id
            FROM payer
            CROSS JOIN program prog
            CROSS JOIN service_type st
            WHERE payer.deleted_at IS NULL
                AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
                AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
        ) counts
        """, nativeQuery = true)
    long countPayerProgramServiceListing(
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds
    );

    /**
     * Find Visit Listing
     */
    @Query(value = """
        SELECT
            COALESCE(payer.id::text, '') as payerId,
            o.name as accountName,
            o.id::text as accountId,
            o.id::text as providerId,
            p.medicaid_id as clientMedicaidId,
            CONCAT(p.first_name, ' ', p.last_name) as clientName,
            CONCAT(s.first_name, ' ', s.last_name) as employeeName,
            s.employee_id as employeeId,
            sd.start_at::date as visitDate,
            sd.start_at::time as startTime,
            sd.end_at::time as endTime,
            sd.id::text as visitKey,
            sd.task_status as status
        FROM service_delivery sd
        INNER JOIN schedule_event se ON sd.schedule_event_id = se.id
        INNER JOIN patient p ON se.patient_id = p.id
        INNER JOIN office o ON se.office_id = o.id
        INNER JOIN staff s ON COALESCE(sd.actual_staff_id, se.staff_id) = s.id
        LEFT JOIN authorizations auth ON sd.authorization_id = auth.id
        LEFT JOIN patient_service ps ON auth.patient_service_id = ps.id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        LEFT JOIN patient_payer pp ON auth.patient_payer_id = pp.id
        LEFT JOIN payer ON pp.payer_id = payer.id
        LEFT JOIN LATERAL (
            SELECT ppg.supervisor_id, ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN staff supervisor ON pp_latest.supervisor_id = supervisor.id
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        WHERE p.deleted_at IS NULL
            AND (CAST(:fromDate AS DATE) IS NULL OR sd.start_at::date >= CAST(:fromDate AS DATE))
            AND (CAST(:toDate AS DATE) IS NULL OR sd.start_at::date <= CAST(:toDate AS DATE))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
            AND (:supervisorId IS NULL OR supervisor.id = CAST(:supervisorId AS uuid))
            AND (:department IS NULL OR :department = '' OR 
                LOWER(s.custom_fields->>'department') LIKE LOWER(CONCAT('%', :department, '%')))
        ORDER BY sd.start_at DESC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)
    List<VisitListingProjection> findVisitListing(
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("serviceTypeIds") UUID[] serviceTypeIds,
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("employeeName") String employeeName,
        @Param("supervisorId") UUID supervisorId,
        @Param("department") String department,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(value = """
        SELECT COUNT(*)
        FROM service_delivery sd
        INNER JOIN schedule_event se ON sd.schedule_event_id = se.id
        INNER JOIN patient p ON se.patient_id = p.id
        INNER JOIN staff s ON COALESCE(sd.actual_staff_id, se.staff_id) = s.id
        LEFT JOIN authorizations auth ON sd.authorization_id = auth.id
        LEFT JOIN patient_service ps ON auth.patient_service_id = ps.id
        LEFT JOIN service_type st ON ps.service_type_id = st.id
        LEFT JOIN patient_payer pp ON auth.patient_payer_id = pp.id
        LEFT JOIN payer ON pp.payer_id = payer.id
        LEFT JOIN LATERAL (
            SELECT ppg.supervisor_id, ppg.program_id
            FROM patient_program ppg
            WHERE ppg.patient_id = p.id
            ORDER BY ppg.status_effective_date DESC
            LIMIT 1
        ) pp_latest ON TRUE
        LEFT JOIN staff supervisor ON pp_latest.supervisor_id = supervisor.id
        LEFT JOIN program prog ON pp_latest.program_id = prog.id
        WHERE p.deleted_at IS NULL
            AND (CAST(:fromDate AS DATE) IS NULL OR sd.start_at::date >= CAST(:fromDate AS DATE))
            AND (CAST(:toDate AS DATE) IS NULL OR sd.start_at::date <= CAST(:toDate AS DATE))
            AND (CAST(:payerIds AS uuid[]) IS NULL OR payer.id IS NULL OR payer.id = ANY(CAST(:payerIds AS uuid[])))
            AND (CAST(:programIds AS uuid[]) IS NULL OR prog.id IS NULL OR prog.id = ANY(CAST(:programIds AS uuid[])))
            AND (CAST(:serviceTypeIds AS uuid[]) IS NULL OR st.id IS NULL OR st.id = ANY(CAST(:serviceTypeIds AS uuid[])))
            AND (:clientMedicaidId IS NULL OR :clientMedicaidId = '' OR p.medicaid_id LIKE CONCAT('%', :clientMedicaidId, '%'))
            AND (:employeeName IS NULL OR :employeeName = '' OR 
                LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :employeeName, '%')))
            AND (:supervisorId IS NULL OR supervisor.id = CAST(:supervisorId AS uuid))
            AND (:department IS NULL OR :department = '' OR 
                LOWER(s.custom_fields->>'department') LIKE LOWER(CONCAT('%', :department, '%')))
        """, nativeQuery = true)
    long countVisitListing(
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate,
        @Param("payerIds") UUID[] payerIds,
        @Param("programIds") UUID[] programIds,
        @Param("serviceTypeIds") UUID[] serviceTypeIds,
        @Param("clientMedicaidId") String clientMedicaidId,
        @Param("employeeName") String employeeName,
        @Param("supervisorId") UUID supervisorId,
        @Param("department") String department
    );
}
