package com.example.backend.repository;

import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.model.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
                CASE WHEN :sortDirection = 'asc' THEN
                    CASE :sortColumn
                        WHEN 'first_name' THEN p.first_name
                        WHEN 'last_name' THEN p.last_name
                        WHEN 'status' THEN p.status::text
                        WHEN 'medicaid_id' THEN p.medicaid_id
                        WHEN 'as_of' THEN pp_latest.status_effective_date::text
                        WHEN 'pp_latest.soc_date' THEN pp_latest.soc_date::text
                        WHEN 'pp_latest.eoc_date' THEN pp_latest.eoc_date::text
                    END
                END ASC NULLS LAST,
                CASE WHEN :sortDirection = 'desc' THEN
                    CASE :sortColumn
                        WHEN 'first_name' THEN p.first_name
                        WHEN 'last_name' THEN p.last_name
                        WHEN 'status' THEN p.status::text
                        WHEN 'medicaid_id' THEN p.medicaid_id
                        WHEN 'as_of' THEN pp_latest.status_effective_date::text
                        WHEN 'pp_latest.soc_date' THEN pp_latest.soc_date::text
                        WHEN 'pp_latest.eoc_date' THEN pp_latest.eoc_date::text
                    END
                END DESC NULLS LAST,
                p.first_name ASC,
                p.last_name ASC
            LIMIT :limit OFFSET :offset
            """,
        nativeQuery = true
    )
    List<PatientSummaryDTO> findPatientSummariesList(
        @Param("search") String search,
        @Param("statusFilter") String statusFilter,
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
            WHERE p.deleted_at IS NULL
                AND (
                    :search IS NULL OR :search = '' OR
                     LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(p.medicaid_id) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(pp.client_payer_id) LIKE LOWER(CONCAT('%', :search, '%'))
                )
                AND (COALESCE(:statusFilter, '') = '' OR p.status::text = ANY(string_to_array(:statusFilter, ',')))
            """,
        nativeQuery = true
    )
    long countPatientSummaries(
        @Param("search") String search,
        @Param("statusFilter") String statusFilter
    );
}
