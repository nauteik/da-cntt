package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.backend.model.entity.StaffAddress;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for managing StaffAddress entities
 * Extends JpaRepository for basic CRUD operations and custom queries
 */
public interface StaffAddressRepository extends JpaRepository<StaffAddress, UUID> {
    List<StaffAddress> findByStaff_Id(UUID staffId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update StaffAddress sa set sa.isMain = false where sa.staff.id = :staffId and sa.id <> :currentId")
    int unsetMainForOtherAddresses(@Param("staffId") UUID staffId, @Param("currentId") UUID currentId);
}
