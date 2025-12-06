package com.example.backend.repository;

import com.example.backend.model.dto.AuthorizationSearchDTO;
import com.example.backend.model.dto.AuthorizationSearchProjection;
import com.example.backend.model.entity.Authorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthorizationRepository extends JpaRepository<Authorization, UUID> {
    List<Authorization> findAllByPatientIdOrderByStartDateDesc(UUID patientId);
    Boolean existsByPatientServiceId(UUID patientServiceId);
    List<Authorization> findAllByPatientPayerIdOrderByStartDateDesc(UUID patientPayerId);
    Optional<Authorization> findByAuthorizationNo(String authorizationNo);

    @Query(
        value = """
            SELECT
                a.id as authorizationId,
                a.authorization_no as authorizationNo,
                p.client_id as clientId,
                p.first_name as clientFirstName,
                p.last_name as clientLastName,
                CONCAT(p.first_name, ' ', p.last_name) as clientName,
                payer.payer_name as payerName,
                payer.payer_identifier as payerIdentifier,
                COALESCE(CONCAT(s.first_name, ' ', s.last_name), '') as supervisorName,
                prog.program_identifier as programIdentifier,
                st.code as serviceCode,
                st.name as serviceName,
                a.start_date as startDate,
                a.end_date as endDate,
                a.max_units as maxUnits,
                a.total_used as totalUsed,
                a.total_remaining as totalRemaining,
                a.format as format,
                CASE
                    WHEN a.end_date IS NOT NULL AND a.end_date < CURRENT_DATE THEN 'EXPIRED'
                    WHEN a.start_date > CURRENT_DATE THEN 'PENDING'
                    ELSE 'ACTIVE'
                END as status
            FROM authorizations a
            INNER JOIN patient p ON a.patient_id = p.id
            INNER JOIN patient_payer pp ON a.patient_payer_id = pp.id
            INNER JOIN payer ON pp.payer_id = payer.id
            INNER JOIN patient_service ps ON a.patient_service_id = ps.id
            INNER JOIN service_type st ON ps.service_type_id = st.id
            LEFT JOIN LATERAL (
                SELECT ppg.patient_id, ppg.program_id, ppg.supervisor_id
                FROM patient_program ppg
                WHERE ppg.patient_id = p.id
                ORDER BY ppg.status_effective_date DESC
                LIMIT 1
            ) pp_latest ON TRUE
            LEFT JOIN program prog ON pp_latest.program_id = prog.id
            LEFT JOIN staff s ON pp_latest.supervisor_id = s.id
            WHERE p.deleted_at IS NULL
                AND (:startDate IS NULL OR a.start_date >= :startDate)
                AND (:endDate IS NULL OR a.end_date <= :endDate)
                AND (:payerId IS NULL OR payer.id = :payerId)
                AND (:supervisorId IS NULL OR s.id = :supervisorId)
                AND (:programId IS NULL OR prog.id = :programId)
                AND (:serviceTypeId IS NULL OR st.id = :serviceTypeId)
                AND (:authorizationNo IS NULL OR :authorizationNo = '' OR LOWER(a.authorization_no) LIKE LOWER(CONCAT('%', :authorizationNo, '%')))
                AND (:clientId IS NULL OR :clientId = '' OR LOWER(p.client_id) LIKE LOWER(CONCAT('%', :clientId, '%')))
                AND (:clientFirstName IS NULL OR :clientFirstName = '' OR LOWER(p.first_name) LIKE LOWER(CONCAT('%', :clientFirstName, '%')))
                AND (:clientLastName IS NULL OR :clientLastName = '' OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :clientLastName, '%')))
                AND (
                    :status IS NULL OR :status = '' OR
                    CASE
                        WHEN a.end_date IS NOT NULL AND a.end_date < CURRENT_DATE THEN 'EXPIRED'
                        WHEN a.start_date > CURRENT_DATE THEN 'PENDING'
                        ELSE 'ACTIVE'
                    END = :status
                )
            ORDER BY
                CASE WHEN COALESCE(:sortColumn, '') != '' AND :sortDirection = 'asc' THEN
                    CASE :sortColumn
                        WHEN 'clientName' THEN CONCAT(p.first_name, ' ', p.last_name)
                        WHEN 'authorizationNo' THEN a.authorization_no
                        WHEN 'payerName' THEN payer.payer_name
                        WHEN 'programIdentifier' THEN prog.program_identifier
                        WHEN 'serviceCode' THEN st.code
                        WHEN 'startDate' THEN a.start_date::text
                        WHEN 'endDate' THEN a.end_date::text
                        WHEN 'maxUnits' THEN a.max_units::text
                        WHEN 'totalUsed' THEN a.total_used::text
                        WHEN 'totalRemaining' THEN a.total_remaining::text
                        WHEN 'status' THEN 
                            CASE
                                WHEN a.end_date IS NOT NULL AND a.end_date < CURRENT_DATE THEN 'EXPIRED'
                                WHEN a.start_date > CURRENT_DATE THEN 'PENDING'
                                ELSE 'ACTIVE'
                            END
                    END
                END ASC NULLS LAST,
                CASE WHEN COALESCE(:sortColumn, '') != '' AND :sortDirection = 'desc' THEN
                    CASE :sortColumn
                        WHEN 'clientName' THEN CONCAT(p.first_name, ' ', p.last_name)
                        WHEN 'authorizationNo' THEN a.authorization_no
                        WHEN 'payerName' THEN payer.payer_name
                        WHEN 'programIdentifier' THEN prog.program_identifier
                        WHEN 'serviceCode' THEN st.code
                        WHEN 'startDate' THEN a.start_date::text
                        WHEN 'endDate' THEN a.end_date::text
                        WHEN 'maxUnits' THEN a.max_units::text
                        WHEN 'totalUsed' THEN a.total_used::text
                        WHEN 'totalRemaining' THEN a.total_remaining::text
                        WHEN 'status' THEN 
                            CASE
                                WHEN a.end_date IS NOT NULL AND a.end_date < CURRENT_DATE THEN 'EXPIRED'
                                WHEN a.start_date > CURRENT_DATE THEN 'PENDING'
                                ELSE 'ACTIVE'
                            END
                    END
                END DESC NULLS LAST,
                CASE WHEN :sortColumn = 'clientName' AND :sortDirection = 'asc' THEN p.last_name END ASC NULLS LAST,
                CASE WHEN :sortColumn = 'clientName' AND :sortDirection = 'desc' THEN p.last_name END DESC NULLS LAST,
                a.start_date DESC,
                a.id ASC
            LIMIT :limit OFFSET :offset
            """,
        nativeQuery = true
    )
    List<AuthorizationSearchProjection> findAuthorizationsWithFilters(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("payerId") UUID payerId,
        @Param("supervisorId") UUID supervisorId,
        @Param("programId") UUID programId,
        @Param("serviceTypeId") UUID serviceTypeId,
        @Param("authorizationNo") String authorizationNo,
        @Param("clientId") String clientId,
        @Param("clientFirstName") String clientFirstName,
        @Param("clientLastName") String clientLastName,
        @Param("status") String status,
        @Param("sortColumn") String sortColumn,
        @Param("sortDirection") String sortDirection,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(
        value = """
            SELECT COUNT(DISTINCT a.id)
            FROM authorizations a
            INNER JOIN patient p ON a.patient_id = p.id
            INNER JOIN patient_payer pp ON a.patient_payer_id = pp.id
            INNER JOIN payer ON pp.payer_id = payer.id
            INNER JOIN patient_service ps ON a.patient_service_id = ps.id
            INNER JOIN service_type st ON ps.service_type_id = st.id
            LEFT JOIN LATERAL (
                SELECT ppg.patient_id, ppg.program_id, ppg.supervisor_id
                FROM patient_program ppg
                WHERE ppg.patient_id = p.id
                ORDER BY ppg.status_effective_date DESC
                LIMIT 1
            ) pp_latest ON TRUE
            LEFT JOIN program prog ON pp_latest.program_id = prog.id
            LEFT JOIN staff s ON pp_latest.supervisor_id = s.id
            WHERE p.deleted_at IS NULL
                AND (:startDate IS NULL OR a.start_date >= :startDate)
                AND (:endDate IS NULL OR a.end_date <= :endDate)
                AND (:payerId IS NULL OR payer.id = :payerId)
                AND (:supervisorId IS NULL OR s.id = :supervisorId)
                AND (:programId IS NULL OR prog.id = :programId)
                AND (:serviceTypeId IS NULL OR st.id = :serviceTypeId)
                AND (:authorizationNo IS NULL OR :authorizationNo = '' OR LOWER(a.authorization_no) LIKE LOWER(CONCAT('%', :authorizationNo, '%')))
                AND (:clientId IS NULL OR :clientId = '' OR LOWER(p.client_id) LIKE LOWER(CONCAT('%', :clientId, '%')))
                AND (:clientFirstName IS NULL OR :clientFirstName = '' OR LOWER(p.first_name) LIKE LOWER(CONCAT('%', :clientFirstName, '%')))
                AND (:clientLastName IS NULL OR :clientLastName = '' OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :clientLastName, '%')))
                AND (
                    :status IS NULL OR :status = '' OR
                    CASE
                        WHEN a.end_date IS NOT NULL AND a.end_date < CURRENT_DATE THEN 'EXPIRED'
                        WHEN a.start_date > CURRENT_DATE THEN 'PENDING'
                        ELSE 'ACTIVE'
                    END = :status
                )
            """,
        nativeQuery = true
    )
    long countAuthorizationsWithFilters(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("payerId") UUID payerId,
        @Param("supervisorId") UUID supervisorId,
        @Param("programId") UUID programId,
        @Param("serviceTypeId") UUID serviceTypeId,
        @Param("authorizationNo") String authorizationNo,
        @Param("clientId") String clientId,
        @Param("clientFirstName") String clientFirstName,
        @Param("clientLastName") String clientLastName,
        @Param("status") String status
    );
}
