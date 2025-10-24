package com.example.backend.repository;

import com.example.backend.model.dto.PatientHeaderDTO;
import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.model.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    @Query(
        value = """
            SELECT
                p.id,
                p.first_name,
                p.last_name,
                p.status::text,
                prog.program_identifier,
                s.first_name as supervisor_first_name,
                s.last_name as supervisor_last_name,
                p.medicaid_id,
                pp.client_payer_id,
                pp_latest.status_effective_date::date as as_of,
                pp_latest.soc_date::date,
                pp_latest.eoc_date::date,
                COALESCE(
                    array_agg(DISTINCT st.code ORDER BY st.code) FILTER (WHERE st.code IS NOT NULL),
                    ARRAY[]::text[]
                ) as services
            FROM patient p
            LEFT JOIN staff s ON p.supervisor_id = s.id
            LEFT JOIN LATERAL (
                SELECT pp1.patient_id, pp1.program_id, pp1.status_effective_date, pp1.soc_date, pp1.eoc_date
                FROM patient_program pp1
                WHERE pp1.patient_id = p.id
                ORDER BY pp1.status_effective_date DESC
                LIMIT 1
            ) pp_latest ON TRUE
            LEFT JOIN program prog ON pp_latest.program_id = prog.id
            LEFT JOIN LATERAL (
                SELECT pp2.patient_id, pp2.client_payer_id
                FROM patient_payer pp2
                WHERE pp2.patient_id = p.id
                ORDER BY pp2.rank ASC NULLS LAST
                LIMIT 1
            ) pp ON TRUE
            LEFT JOIN patient_service ps ON p.id = ps.patient_id
            LEFT JOIN service_type st ON ps.service_type_id = st.id
            WHERE p.deleted_at IS NULL
                AND (
                    :search IS NULL OR :search = '' OR
                     LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(p.medicaid_id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(pp.client_payer_id) LIKE LOWER(CONCAT('%', :search, '%'))
                )
                AND (COALESCE(:statusFilter, '') = '' OR p.status::text = ANY(string_to_array(:statusFilter, ',')))
                AND (COALESCE(:programFilter, '') = '' OR prog.program_identifier = ANY(string_to_array(:programFilter, ',')))
                AND (COALESCE(:servicesFilter, '') = '' OR st.code = ANY(string_to_array(:servicesFilter, ',')))
            GROUP BY
                p.id,
                p.first_name,
                p.last_name,
                p.status,
                p.medicaid_id,
                prog.program_identifier,
                s.first_name, s.last_name,
                pp.client_payer_id,
                pp_latest.status_effective_date, pp_latest.soc_date, pp_latest.eoc_date
            ORDER BY
                CASE WHEN COALESCE(:sortColumn, '') != '' AND :sortDirection = 'asc' THEN
                    CASE :sortColumn
                        WHEN 'first_name' THEN p.first_name
                        WHEN 'last_name' THEN p.last_name
                        WHEN 'status' THEN p.status::text
                        WHEN 'medicaid_id' THEN p.medicaid_id
                        WHEN 'as_of' THEN pp_latest.status_effective_date::text
                        WHEN 'asOf' THEN pp_latest.status_effective_date::text
                        WHEN 'soc_date' THEN pp_latest.soc_date::text
                        WHEN 'soc' THEN pp_latest.soc_date::text
                        WHEN 'eoc_date' THEN pp_latest.eoc_date::text
                        WHEN 'eoc' THEN pp_latest.eoc_date::text
                        WHEN 'clientName' THEN p.first_name
                        WHEN 'created_at' THEN p.created_at::text
                        WHEN 'createdAt' THEN p.created_at::text
                    END
                END ASC NULLS LAST,
                CASE WHEN COALESCE(:sortColumn, '') != '' AND :sortDirection = 'desc' THEN
                    CASE :sortColumn
                        WHEN 'first_name' THEN p.first_name
                        WHEN 'last_name' THEN p.last_name
                        WHEN 'status' THEN p.status::text
                        WHEN 'medicaid_id' THEN p.medicaid_id
                        WHEN 'as_of' THEN pp_latest.status_effective_date::text
                        WHEN 'asOf' THEN pp_latest.status_effective_date::text
                        WHEN 'soc_date' THEN pp_latest.soc_date::text
                        WHEN 'soc' THEN pp_latest.soc_date::text
                        WHEN 'eoc_date' THEN pp_latest.eoc_date::text
                        WHEN 'eoc' THEN pp_latest.eoc_date::text
                        WHEN 'clientName' THEN p.first_name
                        WHEN 'created_at' THEN p.created_at::text
                        WHEN 'createdAt' THEN p.created_at::text
                    END
                END DESC NULLS LAST,
                CASE WHEN :sortColumn = 'clientName' AND :sortDirection = 'asc' THEN p.last_name END ASC NULLS LAST,
                CASE WHEN :sortColumn = 'clientName' AND :sortDirection = 'desc' THEN p.last_name END DESC NULLS LAST,
                p.created_at DESC,
                p.id ASC
            LIMIT :limit OFFSET :offset
            """,
        nativeQuery = true
    )
    List<PatientSummaryDTO> findPatientSummariesList(
        @Param("search") String search,
        @Param("statusFilter") String statusFilter,
        @Param("programFilter") String programFilter,
        @Param("servicesFilter") String servicesFilter,
        @Param("sortColumn") String sortColumn,
        @Param("sortDirection") String sortDirection,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(
        value = """
            SELECT COUNT(DISTINCT p.id)
            FROM patient p
            LEFT JOIN LATERAL (
                SELECT pp2.patient_id, pp2.client_payer_id
                FROM patient_payer pp2
                WHERE pp2.patient_id = p.id
                ORDER BY pp2.rank ASC NULLS LAST
                LIMIT 1
            ) pp ON TRUE
            LEFT JOIN LATERAL (
                SELECT pp1.patient_id, pp1.program_id
                FROM patient_program pp1
                WHERE pp1.patient_id = p.id
                ORDER BY pp1.status_effective_date DESC
                LIMIT 1
            ) pp_latest ON TRUE
            LEFT JOIN program prog ON pp_latest.program_id = prog.id
            LEFT JOIN patient_service ps ON p.id = ps.patient_id
            LEFT JOIN service_type st ON ps.service_type_id = st.id
            WHERE p.deleted_at IS NULL
                AND (
                    :search IS NULL OR :search = '' OR
                     LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(p.medicaid_id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(pp.client_payer_id) LIKE LOWER(CONCAT('%', :search, '%'))
                )
                AND (COALESCE(:statusFilter, '') = '' OR p.status::text = ANY(string_to_array(:statusFilter, ',')))
                AND (COALESCE(:programFilter, '') = '' OR prog.program_identifier = ANY(string_to_array(:programFilter, ',')))
                AND (COALESCE(:servicesFilter, '') = '' OR st.code = ANY(string_to_array(:servicesFilter, ',')))
            """,
        nativeQuery = true
    )
    long countPatientSummaries(
        @Param("search") String search,
        @Param("statusFilter") String statusFilter,
        @Param("programFilter") String programFilter,
        @Param("servicesFilter") String servicesFilter
    );

    /**
     * Get distinct program identifiers from patient_program table
     * Used for dynamic filter options
     */
    @Query("""
        SELECT DISTINCT p.programIdentifier 
        FROM Program p 
        JOIN PatientProgram pp ON p.id = pp.program.id 
        WHERE p.isActive = true 
        ORDER BY p.programIdentifier
        """)
    List<String> findDistinctProgramIdentifiers();

    /**
     * Get distinct service codes from patient_service table
     * Used for dynamic filter options
     */
    @Query("""
        SELECT DISTINCT st.code 
        FROM ServiceType st 
        JOIN PatientService ps ON st.id = ps.serviceType.id 
        ORDER BY st.code
        """)
    List<String> findDistinctServiceCodes();

    /**
     * Get patient header information by patient ID
     * Optimized: Reduced subqueries from 4 to 1 by using LEFT JOINs with unique constraints
     * Performance improvement:
     * - Before: 4 separate subqueries (main address line1, phone, primary contact, program)
     * - After: 2 LEFT JOINs + 1 subquery (75% reduction in subqueries)
     * - Leverages unique constraints: idx_patient_address_unique_main ensures max 1 main address
     */
    @Query("""
        SELECT new com.example.backend.model.dto.PatientHeaderDTO(
            p.id,
            p.firstName,
            p.lastName,
            p.clientId,
            p.medicaidId,
            mainAddr.line1,
            mainPa.phone,
            primaryContact.name,
            (SELECT prog.programIdentifier 
             FROM PatientProgram pp2 JOIN pp2.program prog 
             WHERE pp2.patient.id = p.id 
               AND pp2.statusEffectiveDate = (
                   SELECT MAX(pp3.statusEffectiveDate) 
                   FROM PatientProgram pp3 
                   WHERE pp3.patient.id = p.id
               )),
            p.status
        )
        FROM Patient p
        LEFT JOIN p.patientAddresses mainPa ON mainPa.isMain = true
        LEFT JOIN mainPa.address mainAddr
        LEFT JOIN p.contacts primaryContact ON primaryContact.isPrimary = true
        WHERE p.id = :patientId
          AND p.deletedAt IS NULL
        """)
    PatientHeaderDTO findPatientHeaderById(@Param("patientId") UUID patientId);

    /**
     * Get patient personal information by patient ID with contacts and addresses
     */
    @Query("""
        SELECT p
        FROM Patient p
        LEFT JOIN FETCH p.contacts
        LEFT JOIN FETCH p.patientAddresses pa
        LEFT JOIN FETCH pa.address
        WHERE p.id = :patientId
          AND p.deletedAt IS NULL
        """)
    Patient findPatientPersonalById(@Param("patientId") UUID patientId);

    boolean existsByMedicaidId(String medicaidId);
    
    java.util.Optional<Patient> findByClientId(String clientId);
    
    java.util.Optional<Patient> findBySsn(String ssn);

    /**
     * Bulk insert patients using native SQL for better performance
     */
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO patient (
            id, first_name, last_name, dob, gender, ssn, client_id, agency_id, 
            medicaid_id, primary_language, status, office_id, created_at, updated_at
        ) VALUES (
            :id, :firstName, :lastName, :dob, :gender, :ssn, :clientId, :agencyId,
            :medicaidId, :primaryLanguage, :status, :officeId, NOW(), NOW()
        )
        """, nativeQuery = true)
    void bulkInsertPatient(
        @Param("id") UUID id,
        @Param("firstName") String firstName,
        @Param("lastName") String lastName,
        @Param("dob") java.time.LocalDate dob,
        @Param("gender") String gender,
        @Param("ssn") String ssn,
        @Param("clientId") String clientId,
        @Param("agencyId") String agencyId,
        @Param("medicaidId") String medicaidId,
        @Param("primaryLanguage") String primaryLanguage,
        @Param("status") String status,
        @Param("officeId") UUID officeId
    );
}
