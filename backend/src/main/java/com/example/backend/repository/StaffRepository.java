package com.example.backend.repository;

import com.example.backend.model.dto.StaffSummaryDTO;
import com.example.backend.model.dto.StaffHeaderDTO;
import com.example.backend.model.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Staff entity
 */
@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID> {
    List<Staff> findByIsActiveTrueAndDeletedAtIsNull();
    Optional<Staff> findById(UUID id);
    Optional<Staff> findBySsn(String ssn);

    @Query(
        value = """
            SELECT
                s.id,
                s.first_name,
                s.last_name,
                CASE WHEN s.is_active = true THEN 'ACTIVE' ELSE 'INACTIVE' END as status,
                s.employee_id,
                r.name as position,
                s.hire_date,
                s.release_date,
                s.updated_at
            FROM staff s
            LEFT JOIN app_user u ON s.user_id = u.id
            LEFT JOIN role r ON u.role_id = r.id
            WHERE s.deleted_at IS NULL
                AND (
                    :search IS NULL OR :search = '' OR
                     LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(s.employee_id) LIKE LOWER(CONCAT('%', :search, '%'))
                )
                AND (COALESCE(:statusFilter, '') = '' OR 
                     CASE WHEN s.is_active = true THEN 'ACTIVE' ELSE 'INACTIVE' END = ANY(string_to_array(:statusFilter, ',')))
                AND (COALESCE(:roleFilter, '') = '' OR 
                     r.name = ANY(string_to_array(:roleFilter, ',')))
            ORDER BY
                CASE WHEN COALESCE(:sortColumn, '') != '' AND :sortDirection = 'asc' THEN
                    CASE :sortColumn
                        WHEN 'name' THEN s.first_name
                        WHEN 'firstName' THEN s.first_name
                        WHEN 'lastName' THEN s.last_name
                        WHEN 'employeeId' THEN s.employee_id
                        WHEN 'position' THEN r.name
                        WHEN 'hireDate' THEN s.hire_date::text
                        WHEN 'releaseDate' THEN s.release_date::text
                        WHEN 'updatedAt' THEN s.updated_at::text
                        WHEN 'status' THEN CASE WHEN s.is_active = true THEN 'ACTIVE' ELSE 'INACTIVE' END
                    END
                END ASC NULLS LAST,
                CASE WHEN COALESCE(:sortColumn, '') != '' AND :sortDirection = 'desc' THEN
                    CASE :sortColumn
                        WHEN 'name' THEN s.first_name
                        WHEN 'firstName' THEN s.first_name
                        WHEN 'lastName' THEN s.last_name
                        WHEN 'employeeId' THEN s.employee_id
                        WHEN 'position' THEN r.name
                        WHEN 'hireDate' THEN s.hire_date::text
                        WHEN 'releaseDate' THEN s.release_date::text
                        WHEN 'updatedAt' THEN s.updated_at::text
                        WHEN 'status' THEN CASE WHEN s.is_active = true THEN 'ACTIVE' ELSE 'INACTIVE' END
                    END
                END DESC NULLS LAST,
                CASE WHEN :sortColumn = 'name' AND :sortDirection = 'asc' THEN s.last_name END ASC NULLS LAST,
                CASE WHEN :sortColumn = 'name' AND :sortDirection = 'desc' THEN s.last_name END DESC NULLS LAST,
                s.updated_at DESC,
                s.id ASC
            LIMIT :limit OFFSET :offset
            """,
        nativeQuery = true
    )
    List<StaffSummaryDTO> findStaffSummariesList(
        @Param("search") String search,
        @Param("statusFilter") String statusFilter,
        @Param("roleFilter") String roleFilter,
        @Param("sortColumn") String sortColumn,
        @Param("sortDirection") String sortDirection,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    @Query(
        value = """
            SELECT COUNT(s.id)
            FROM staff s
            LEFT JOIN app_user u ON s.user_id = u.id
            LEFT JOIN role r ON u.role_id = r.id
            WHERE s.deleted_at IS NULL
                AND (
                    :search IS NULL OR :search = '' OR
                     LOWER(CONCAT(s.first_name, ' ', s.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(s.employee_id) LIKE LOWER(CONCAT('%', :search, '%'))
                )
                AND (COALESCE(:statusFilter, '') = '' OR 
                     CASE WHEN s.is_active = true THEN 'ACTIVE' ELSE 'INACTIVE' END = ANY(string_to_array(:statusFilter, ',')))
                AND (COALESCE(:roleFilter, '') = '' OR 
                     r.name = ANY(string_to_array(:roleFilter, ',')))
            """,
        nativeQuery = true
    )
    long countStaffSummaries(
        @Param("search") String search,
        @Param("statusFilter") String statusFilter,
        @Param("roleFilter") String roleFilter
    );

    /**
     * Get staff header information by staff ID
     */
    @Query("""
        SELECT new com.example.backend.model.dto.StaffHeaderDTO(
            s.id,
            s.firstName,
            s.lastName,
            s.employeeId,
            COALESCE(mainSa.phone, ''),
            COALESCE(mainSa.email, ''),
            COALESCE(primaryContact.name, '')
        )
        FROM Staff s
        LEFT JOIN s.staffAddresses mainSa ON mainSa.isMain = true
        LEFT JOIN s.staffContacts primaryContact ON primaryContact.isPrimary = true
        WHERE s.id = :staffId
          AND s.deletedAt IS NULL
        """)
    StaffHeaderDTO findStaffHeaderById(@Param("staffId") UUID staffId);
}
