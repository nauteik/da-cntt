package com.example.backend.repository;

import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.model.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    
    /**
     * Find patients with summary information using native query with array_agg.
     * This is the most efficient approach:
     * - Single query (no N+1 problem)
     * - Database-level aggregation for services
     * - Works efficiently with any page size (25, 50, 100, etc.)
     * - No Cartesian product issue
     * 
     * Includes:
     * - Patient basic info
     * - Latest program enrollment (based on most recent statusEffectiveDate)
     * - Supervisor information
     * - Primary payer (lowest rank)
     * - All services aggregated as array
     */
    @Query(value = """
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
        ORDER BY :#{#pageable.sort.toString().replace(': ', ' ')}
        """,
        countQuery = """
            SELECT COUNT(DISTINCT p.id) 
            FROM patient p
            LEFT JOIN staff s ON p.supervisor_id = s.id
            LEFT JOIN patient_program pp_latest ON pp_latest.id = (
                SELECT id FROM patient_program pp1 
                WHERE pp1.patient_id = p.id 
                ORDER BY pp1.status_effective_date DESC 
                LIMIT 1
            )
            WHERE p.deleted_at IS NULL
        """,
        nativeQuery = true)
    Page<PatientSummaryDTO> findPatientSummaries(Pageable pageable);
}
