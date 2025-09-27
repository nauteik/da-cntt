package com.example.backend.repository;

import com.example.backend.model.entity.Permission;
import com.example.backend.model.entity.Role;
import com.example.backend.model.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, UUID> {
    List<RolePermission> findByRole(Role role);
    List<RolePermission> findByPermission(Permission permission);
    boolean existsByRoleAndPermission(Role role, Permission permission);
}
