package com.example.backend.repository;

import com.example.backend.model.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    
    /**
     * Bulk insert addresses using native SQL for better performance
     */
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO address (
            id, line1, city, state, postal_code, county, type, label, created_at, updated_at
        ) VALUES (
            :id, :line1, :city, :state, :postalCode, :county, :type, :label, NOW(), NOW()
        )
        """, nativeQuery = true)
    void bulkInsertAddress(
        @Param("id") UUID id,
        @Param("line1") String line1,
        @Param("city") String city,
        @Param("state") String state,
        @Param("postalCode") String postalCode,
        @Param("county") String county,
        @Param("type") String type,
        @Param("label") String label
    );
}
