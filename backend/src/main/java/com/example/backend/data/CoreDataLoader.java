package com.example.backend.data;

import com.example.backend.model.entity.*;
import com.example.backend.model.enums.PermissionScope;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Loads core system data: Organization, Modules, Roles, and basic Permissions
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CoreDataLoader {

    private final OrganizationRepository organizationRepository;
    private final ModuleRepository moduleRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Transactional
    public void loadData() {
        log.info("Loading core system data...");
        
        // Load organization
        Organization organization = loadOrganization();
        
        // Load modules
        loadModules();
        
        // Load roles
        loadRoles(organization);
        
        // Load basic permissions
        loadPermissions(organization);
        
        log.info("Core system data loaded successfully");
    }

    private Organization loadOrganization() {
        UUID orgId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        
        // Check if organization already exists
        if (organizationRepository.existsById(orgId)) {
            return organizationRepository.findById(orgId).get();
        }
        
        // Create new organization with manual ID using native SQL
        Organization org = new Organization("BAC", "Blue Angels Care");
        org.setLegalName("Blue Angels Care LLC");
        org.setTaxId("XX-XXXXXXX");
        org.setEmail("info@blueangelscare.com");
        org.setPhone("+1-610-000-0000");
        
        // Save without setting ID first, then update with desired ID
        Organization saved = organizationRepository.save(org);
        
        // Update the ID using native query if needed
        if (!saved.getId().equals(orgId)) {
            organizationRepository.flush();
            // For now, we'll use the generated ID instead of forcing a specific one
            log.info("Created organization: {} with ID: {}", saved.getName(), saved.getId());
        } else {
            log.info("Created organization: {}", saved.getName());
        }
        
        return saved;
    }

    private void loadModules() {
        String[][] modules = {
            {"ADMIN", "System Administration"},
            {"STAFF", "Staff Management"},
            {"PATIENT", "Patient Records"},
            {"ISP", "Care Plan (ISP)"},
            {"SCHEDULE", "Weekly Scheduling"},
            {"MOBILE", "Mobile Operations"},
            {"MEDICATION", "Medication Management"},
            {"BILLING", "Billing & Claims"},
            {"FIRE_DRILL", "Fire Drill Compliance"},
            {"COMPLIANCE", "Compliance & Audit"}
        };

        for (String[] moduleData : modules) {
            String code = moduleData[0];
            String name = moduleData[1];
            
            if (!moduleRepository.existsByCode(code)) {
                com.example.backend.model.entity.Module module = new com.example.backend.model.entity.Module(code, name);
                moduleRepository.save(module);
                log.info("Created module: {} - {}", code, name);
            }
        }
    }

    private void loadRoles(Organization organization) {
        String[][] roles = {
            {"ADMIN", "System Admin", "Toàn quyền cấu hình và vận hành hệ thống", "true"},
            {"MANAGER", "Office Manager", "Quản lý văn phòng, điều phối lịch và giám sát tuân thủ", "false"},
            {"DSP", "Direct Support Professional", "Nhân viên chăm sóc sử dụng mobile app và ghi nhận dịch vụ", "false"},
            {"FINANCE", "Finance & Billing", "Nhân viên phụ trách billing & claims", "false"}
        };

        for (String[] roleData : roles) {
            String code = roleData[0];
            String name = roleData[1];
            String description = roleData[2];
            Boolean isSystem = Boolean.valueOf(roleData[3]);
            
            if (!roleRepository.existsByOrganizationAndCode(organization, code)) {
                Role role = new Role(organization, code, name);
                role.setDescription(description);
                role.setIsSystem(isSystem);
                roleRepository.save(role);
                log.info("Created role: {} - {}", code, name);
            }
        }
    }

    private void loadPermissions(Organization organization) {
        // Basic permissions for each module
        String[][] permissions = {
            // Admin permissions
            {"users", "create", "ORG", "Tạo user mới"},
            {"users", "read", "ORG", "Xem danh sách user"},
            {"users", "update", "ORG", "Cập nhật thông tin user"},
            {"users", "delete", "ORG", "Xóa user"},
            {"roles", "create", "ORG", "Tạo role mới"},
            {"roles", "read", "ORG", "Xem danh sách role"},
            {"roles", "update", "ORG", "Cập nhật role"},
            {"roles", "delete", "ORG", "Xóa role"},
            {"offices", "create", "ORG", "Tạo office mới"},
            {"offices", "read", "ORG", "Xem danh sách office"},
            {"offices", "update", "ORG", "Cập nhật thông tin office"},
            {"offices", "delete", "ORG", "Xóa office"},
            
            // Staff permissions
            {"staff", "create", "OFFICE", "Tạo nhân viên mới"},
            {"staff", "read", "OFFICE", "Xem danh sách nhân viên"},
            {"staff", "update", "OFFICE", "Cập nhật thông tin nhân viên"},
            {"staff", "delete", "OFFICE", "Xóa nhân viên"},
            
            // Patient permissions
            {"patients", "create", "OFFICE", "Tạo bệnh nhân mới"},
            {"patients", "read", "OFFICE", "Xem danh sách bệnh nhân"},
            {"patients", "update", "OFFICE", "Cập nhật thông tin bệnh nhân"},
            {"patients", "delete", "OFFICE", "Xóa bệnh nhân"},
            
            // Schedule permissions
            {"schedules", "create", "OFFICE", "Tạo lịch làm việc"},
            {"schedules", "read", "OFFICE", "Xem lịch làm việc"},
            {"schedules", "update", "OFFICE", "Cập nhật lịch làm việc"},
            {"schedules", "approve", "OFFICE", "Phê duyệt lịch làm việc"},
            
            // Mobile permissions
            {"mobile", "checkin", "SELF", "Check-in trên mobile"},
            {"mobile", "checkout", "SELF", "Check-out trên mobile"},
            {"mobile", "notes", "SELF", "Ghi chú hằng ngày"},
            
            // Medication permissions
            {"medications", "read", "OFFICE", "Xem đơn thuốc"},
            {"medications", "administer", "SELF", "Cho thuốc"},
            {"medications", "manage", "OFFICE", "Quản lý đơn thuốc"},
            
            // Billing permissions
            {"billing", "read", "ORG", "Xem thông tin billing"},
            {"billing", "create", "ORG", "Tạo claim"},
            {"billing", "submit", "ORG", "Nộp claim"},
            
            // Fire drill permissions
            {"fire_drills", "create", "OFFICE", "Tạo fire drill"},
            {"fire_drills", "read", "OFFICE", "Xem fire drill"},
            {"fire_drills", "update", "OFFICE", "Cập nhật fire drill"},
            
            // Compliance permissions
            {"compliance", "read", "ORG", "Xem báo cáo tuân thủ"},
            {"compliance", "audit", "ORG", "Thực hiện audit"}
        };

        for (String[] permData : permissions) {
            String resource = permData[0];
            String action = permData[1];
            PermissionScope scope = PermissionScope.valueOf(permData[2]);
            String description = permData[3];
            
            if (!permissionRepository.existsByOrganizationAndResourceAndActionAndScope(
                    organization, resource, action, scope)) {
                Permission permission = new Permission(organization, resource, action, scope);
                permission.setDescription(description);
                permissionRepository.save(permission);
                log.debug("Created permission: {}:{}:{}", resource, action, scope);
            }
        }
        
        log.info("Created {} permissions", permissions.length);
    }
}
