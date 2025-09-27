package com.example.backend.repository;

import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfficeRepository extends JpaRepository<Office, UUID> {
    Optional<Office> findByOrganizationAndCode(Organization organization, String code);
    List<Office> findByOrganization(Organization organization);
    List<Office> findByOrganizationAndDeletedAtIsNull(Organization organization);
    boolean existsByOrganizationAndCode(Organization organization, String code);
}
