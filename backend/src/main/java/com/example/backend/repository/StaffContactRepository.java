package com.example.backend.repository;

import com.example.backend.model.entity.StaffContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StaffContactRepository extends JpaRepository<StaffContact, UUID> {
    
    @Query("SELECT sc FROM StaffContact sc WHERE sc.staff.id = :staffId AND sc.isPrimary = true")
    List<StaffContact> findPrimaryContactsByStaffId(@Param("staffId") UUID staffId);
    
    @Query("SELECT sc FROM StaffContact sc WHERE sc.staff.id = :staffId ORDER BY sc.createdAt ASC")
    List<StaffContact> findAllByStaffIdOrderByCreatedAtAsc(@Param("staffId") UUID staffId);
}
