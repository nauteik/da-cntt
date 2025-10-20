package com.example.backend.data;

import com.example.backend.model.entity.Permission;
import com.example.backend.model.entity.Role;
import com.example.backend.model.entity.RolePermission;
import com.example.backend.model.enums.PermissionScope;
import com.example.backend.repository.PermissionRepository;
import com.example.backend.repository.RolePermissionRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.service.BulkInsertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Loads role-permission mappings
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RolePermissionDataLoader {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final BulkInsertService bulkInsertService;

    @Transactional
    public void loadData() {
        log.info("Loading role-permission mappings...");

        // Check if data already exists and skip if it does
        if (rolePermissionRepository.count() > 0) {
            log.info("Role-permission mappings already exist. Skipping.");
            return;
        }

        assignPermissionsToRoles();

        log.info("Role-permission mappings loaded successfully");
    }

    private void assignPermissionsToRoles() {
        List<RolePermission> rolePermissionList = new ArrayList<>();

        // Admin role - full access
        rolePermissionList.addAll(assignPermissionsToRole("ADMIN", new String[]{
            "users:create:ORG", "users:read:ORG", "users:update:ORG", "users:delete:ORG",
            "roles:read:ORG", "roles:assign:ORG",
            "settings:read:ORG", "settings:update:ORG",
            "offices:create:ORG", "offices:read:ORG", "offices:update:ORG", "offices:delete:ORG",
            "staff:create:OFFICE", "staff:read:OFFICE", "staff:update:OFFICE", "staff:delete:OFFICE",
            "patients:create:OFFICE", "patients:read:OFFICE", "patients:update:OFFICE", "patients:delete:OFFICE",
            "schedule:create:OFFICE", "schedule:read:OFFICE", "schedule:update:OFFICE", "schedule:delete:OFFICE",
            "mobile:check-in:OFFICE", "mobile:check-out:OFFICE", "mobile:read-notes:SELF", "mobile:write-notes:SELF",
            "billing:read:ORG", "billing:generate:ORG", "billing:submit:ORG",
            "firedrill:create:OFFICE", "firedrill:read:OFFICE", "firedrill:update:OFFICE",
            "compliance:read:ORG"
        }));

        // Manager role - office management
        rolePermissionList.addAll(assignPermissionsToRole("MANAGER", new String[]{
            "users:read:ORG",
            "offices:read:ORG",
            "staff:create:OFFICE", "staff:read:OFFICE", "staff:update:OFFICE", "staff:delete:OFFICE",
            "patients:create:OFFICE", "patients:read:OFFICE", "patients:update:OFFICE", "patients:delete:OFFICE",
            "schedule:create:OFFICE", "schedule:read:OFFICE", "schedule:update:OFFICE", "schedule:delete:OFFICE",
            "mobile:check-in:OFFICE", "mobile:check-out:OFFICE", "mobile:read-notes:SELF", "mobile:write-notes:SELF",
            "billing:read:ORG",
            "firedrill:create:OFFICE", "firedrill:read:OFFICE", "firedrill:update:OFFICE",
            "compliance:read:ORG"
        }));

        // DSP role - direct care
        rolePermissionList.addAll(assignPermissionsToRole("DSP", new String[]{
            "staff:read:OFFICE",
            "patients:read:OFFICE",
            "schedule:read:OFFICE",
            "mobile:check-in:OFFICE", "mobile:check-out:OFFICE", "mobile:read-notes:SELF", "mobile:write-notes:SELF"
        }));

        // Finance role - billing and finance
        rolePermissionList.addAll(assignPermissionsToRole("FINANCE", new String[]{
            "users:read:ORG",
            "offices:read:ORG",
            "staff:read:OFFICE",
            "patients:read:OFFICE",
            "schedule:read:OFFICE",
            "billing:read:ORG", "billing:generate:ORG", "billing:submit:ORG",
            "compliance:read:ORG"
        }));

        // Bulk insert role permissions using JDBC batch processing for maximum performance
        if (!rolePermissionList.isEmpty()) {
            log.info("Bulk inserting {} role permissions using JDBC batch processing...", rolePermissionList.size());
            bulkInsertService.bulkInsertRolePermissions(rolePermissionList);
        }
    }

    private List<RolePermission> assignPermissionsToRole(String roleCode, String[] permissionKeys) {
        List<RolePermission> rolePermissionList = new ArrayList<>();
        Role role = roleRepository.findByCode(roleCode)
            .orElseThrow(() -> new RuntimeException("Role not found: " + roleCode));

        for (String permissionKey : permissionKeys) {
            String[] parts = permissionKey.split(":");
            String resource = parts[0];
            String action = parts[1];
            String scopeStr = parts[2];

            Permission permission = permissionRepository.findByResourceAndActionAndScope(
                resource, action, PermissionScope.valueOf(scopeStr)
            ).orElse(null);

            if (permission != null) {
                if (!rolePermissionRepository.existsByRoleAndPermission(role, permission)) {
                    RolePermission rolePermission = new RolePermission(role, permission);
                    rolePermission.setId(java.util.UUID.randomUUID()); // Set UUID for bulk insert
                    rolePermissionList.add(rolePermission);
                    log.debug("Prepared role permission: {} - {}:{}:{}", roleCode, resource, action, scopeStr);
                }
            } else {
                log.warn("Permission not found: {}", permissionKey);
            }
        }

        log.info("Prepared {} permissions for role: {}", rolePermissionList.size(), roleCode);
        return rolePermissionList;
    }
}
