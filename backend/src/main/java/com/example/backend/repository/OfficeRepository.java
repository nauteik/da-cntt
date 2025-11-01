package com.example.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.model.entity.Office;

@Repository
public interface OfficeRepository extends JpaRepository<Office, UUID> {
    
    /**
     * Find office by code
     */
    Optional<Office> findByCode(String code);
    
    /**
     * Find all active offices
     */
    List<Office> findByIsActiveTrueAndDeletedAtIsNull();
    
    /**
     * Find all offices including inactive ones
     */
    List<Office> findByDeletedAtIsNull();
    
    /**
     * Find office by ID with address
     */
    @Query("SELECT o FROM Office o LEFT JOIN FETCH o.address WHERE o.id = :id AND o.deletedAt IS NULL")
    Optional<Office> findByIdWithAddress(@Param("id") UUID id);
    
    /**
     * Find office by code (excluding deleted)
     */
    Optional<Office> findByCodeAndDeletedAtIsNull(String code);
    
    /**
     * Check if office code exists (excluding deleted)
     */
    boolean existsByCodeAndDeletedAtIsNull(String code);
    
    /**
     * Check if office code exists for different office ID
     */
    @Query("SELECT COUNT(o) > 0 FROM Office o WHERE o.code = :code AND o.id != :officeId AND o.deletedAt IS NULL")
    boolean existsByCodeAndIdNot(@Param("code") String code, @Param("officeId") UUID officeId);
}
