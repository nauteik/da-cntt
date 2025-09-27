package com.example.backend.repository;

import com.example.backend.model.entity.Organization;
import com.example.backend.model.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByOrganizationAndCode(Organization organization, String code);
    List<Role> findByOrganization(Organization organization);
    List<Role> findByOrganizationAndDeletedAtIsNull(Organization organization);
    boolean existsByOrganizationAndCode(Organization organization, String code);
}
