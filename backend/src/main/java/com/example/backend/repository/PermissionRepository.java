package com.example.backend.repository;

import com.example.backend.model.entity.Organization;
import com.example.backend.model.entity.Permission;
import com.example.backend.model.enums.PermissionScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    Optional<Permission> findByOrganizationAndResourceAndActionAndScope(
        Organization organization, String resource, String action, PermissionScope scope);
    
    List<Permission> findByOrganization(Organization organization);
    
    boolean existsByOrganizationAndResourceAndActionAndScope(
        Organization organization, String resource, String action, PermissionScope scope);
}
