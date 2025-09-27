package com.example.backend.data;

import com.example.backend.model.entity.Organization;
import com.example.backend.model.entity.Permission;
import com.example.backend.model.entity.Role;
import com.example.backend.model.entity.RolePermission;
import com.example.backend.repository.OrganizationRepository;
import com.example.backend.repository.PermissionRepository;
import com.example.backend.repository.RolePermissionRepository;
import com.example.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Loads role-permission mappings
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RolePermissionDataLoader {

    private final OrganizationRepository organizationRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Transactional
    public void loadData() {
        log.info("Loading role-permission mappings...");
        
        Organization organization = organizationRepository.findAll().stream()
            .filter(org -> "BAC".equals(org.getCode()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("BAC Organization not found. Run CoreDataLoader first."));
        
        assignPermissionsToRoles(organization);
        
        log.info("Role-permission mappings loaded successfully");
    }

    private void assignPermissionsToRoles(Organization organization) {
        // Admin role - full access
        assignPermissionsToRole("ADMIN", new String[]{
            "users:create:ORG", "users:read:ORG", "users:update:ORG", "users:delete:ORG",
            "roles:create:ORG", "roles:read:ORG", "roles:update:ORG", "roles:delete:ORG",
            "offices:create:ORG", "offices:read:ORG", "offices:update:ORG", "offices:delete:ORG",
            "staff:create:OFFICE", "staff:read:OFFICE", "staff:update:OFFICE", "staff:delete:OFFICE",
            "patients:create:OFFICE", "patients:read:OFFICE", "patients:update:OFFICE", "patients:delete:OFFICE",
            "schedules:create:OFFICE", "schedules:read:OFFICE", "schedules:update:OFFICE", "schedules:approve:OFFICE",
            "mobile:checkin:SELF", "mobile:checkout:SELF", "mobile:notes:SELF",
            "medications:read:OFFICE", "medications:administer:SELF", "medications:manage:OFFICE",
            "billing:read:ORG", "billing:create:ORG", "billing:submit:ORG",
            "fire_drills:create:OFFICE", "fire_drills:read:OFFICE", "fire_drills:update:OFFICE",
            "compliance:read:ORG", "compliance:audit:ORG"
        }, organization);

        // Manager role - office management
        assignPermissionsToRole("MANAGER", new String[]{
            "users:read:ORG", "users:update:ORG",
            "offices:read:ORG",
            "staff:create:OFFICE", "staff:read:OFFICE", "staff:update:OFFICE", "staff:delete:OFFICE",
            "patients:create:OFFICE", "patients:read:OFFICE", "patients:update:OFFICE", "patients:delete:OFFICE",
            "schedules:create:OFFICE", "schedules:read:OFFICE", "schedules:update:OFFICE", "schedules:approve:OFFICE",
            "mobile:checkin:SELF", "mobile:checkout:SELF", "mobile:notes:SELF",
            "medications:read:OFFICE", "medications:manage:OFFICE",
            "billing:read:ORG",
            "fire_drills:create:OFFICE", "fire_drills:read:OFFICE", "fire_drills:update:OFFICE",
            "compliance:read:ORG"
        }, organization);

        // DSP role - direct care
        assignPermissionsToRole("DSP", new String[]{
            "staff:read:OFFICE",
            "patients:read:OFFICE", "patients:update:OFFICE",
            "schedules:read:OFFICE",
            "mobile:checkin:SELF", "mobile:checkout:SELF", "mobile:notes:SELF",
            "medications:read:OFFICE", "medications:administer:SELF",
            "fire_drills:read:OFFICE"
        }, organization);

        // Finance role - billing and finance
        assignPermissionsToRole("FINANCE", new String[]{
            "users:read:ORG",
            "offices:read:ORG",
            "staff:read:OFFICE",
            "patients:read:OFFICE",
            "schedules:read:OFFICE",
            "billing:read:ORG", "billing:create:ORG", "billing:submit:ORG",
            "compliance:read:ORG"
        }, organization);
    }

    private void assignPermissionsToRole(String roleCode, String[] permissionKeys, Organization organization) {
        Role role = roleRepository.findByOrganizationAndCode(organization, roleCode)
            .orElseThrow(() -> new RuntimeException("Role not found: " + roleCode));

        for (String permissionKey : permissionKeys) {
            String[] parts = permissionKey.split(":");
            String resource = parts[0];
            String action = parts[1];
            String scopeStr = parts[2];

            Permission permission = permissionRepository.findByOrganizationAndResourceAndActionAndScope(
                organization, resource, action, com.example.backend.model.enums.PermissionScope.valueOf(scopeStr)
            ).orElse(null);

            if (permission != null) {
                if (!rolePermissionRepository.existsByRoleAndPermission(role, permission)) {
                    RolePermission rolePermission = new RolePermission(role, permission);
                    rolePermissionRepository.save(rolePermission);
                }
            } else {
                log.warn("Permission not found: {}", permissionKey);
            }
        }

        log.info("Assigned {} permissions to role: {}", permissionKeys.length, roleCode);
    }
}
