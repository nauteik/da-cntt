package com.example.backend.repository;

import com.example.backend.model.entity.House;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HouseRepository extends JpaRepository<House, UUID> {

    List<House> findByOfficeId(UUID officeId);

    List<House> findByOfficeIdAndIsActiveTrue(UUID officeId);

    boolean existsByCodeAndOfficeId(String code, UUID officeId);

    Optional<House> findByCodeAndOfficeId(String code, UUID officeId);

    @Query("""
        SELECT h FROM House h
        WHERE (:officeId IS NULL OR h.office.id = :officeId)
        AND (:search IS NULL OR :search = '' OR 
             LOWER(h.code) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY h.office.name, h.code
        """)
    Page<House> findAllWithFilters(
        @Param("officeId") UUID officeId,
        @Param("search") String search,
        Pageable pageable
    );
}





