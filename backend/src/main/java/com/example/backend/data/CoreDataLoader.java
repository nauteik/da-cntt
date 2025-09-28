package com.example.backend.data;

import com.example.backend.model.entity.*;
import com.example.backend.model.enums.PermissionScope;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Loads core system data: Organization, Modules, Roles, and basic Permissions
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CoreDataLoader {

    private final ModuleRepository moduleRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Transactional
    public void loadData() {
        log.info("Loading core system data...");

        // Load modules
        loadModules();

        // Load roles
        loadRoles();

        // Load basic permissions
        loadPermissions();

        log.info("Core system data loaded successfully");
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

    private void loadRoles() {
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

            if (!roleRepository.existsByCode(code)) {
                Role role = new Role(code, name);
                role.setDescription(description);
                role.setIsSystem(isSystem);
                roleRepository.save(role);
                log.info("Created role: {} - {}", code, name);
            }
        }
    }

    private void loadPermissions() {
        // Basic permissions for each module
        String[][] permissions = {
            // Admin permissions
            {"users", "create", "ORG", "Tạo user mới"},
            {"users", "read", "ORG", "Xem danh sách user"},
            {"users", "update", "ORG", "Cập nhật thông tin user"},
            {"users", "delete", "ORG", "Xóa user"},
            {"roles", "read", "ORG", "Xem danh sách vai trò"},
            {"roles", "assign", "ORG", "Gán vai trò cho user"},
            {"settings", "read", "ORG", "Xem cấu hình hệ thống"},
            {"settings", "update", "ORG", "Cập nhật cấu hình hệ thống"},

            // Staff permissions
            {"staff", "create", "OFFICE", "Tạo hồ sơ nhân viên"},
            {"staff", "read", "OFFICE", "Xem hồ sơ nhân viên"},
            {"staff", "update", "OFFICE", "Cập nhật hồ sơ nhân viên"},
            {"staff", "delete", "OFFICE", "Xóa hồ sơ nhân viên"},

            // Patient permissions
            {"patients", "create", "OFFICE", "Tạo hồ sơ bệnh nhân"},
            {"patients", "read", "OFFICE", "Xem hồ sơ bệnh nhân"},
            {"patients", "update", "OFFICE", "Cập nhật hồ sơ bệnh nhân"},
            {"patients", "delete", "OFFICE", "Xóa hồ sơ bệnh nhân"},

            // ISP permissions
            {"isp", "create", "OFFICE", "Tạo ISP"},
            {"isp", "read", "OFFICE", "Xem ISP"},
            {"isp", "update", "OFFICE", "Cập nhật ISP"},
            {"isp", "delete", "OFFICE", "Xóa ISP"},

            // Schedule permissions
            {"schedule", "create", "OFFICE", "Tạo lịch làm việc"},
            {"schedule", "read", "OFFICE", "Xem lịch làm việc"},
            {"schedule", "update", "OFFICE", "Cập nhật lịch làm việc"},
            {"schedule", "delete", "OFFICE", "Xóa lịch làm việc"},

            // Mobile permissions
            {"mobile", "check-in", "OFFICE", "Check-in qua mobile"},
            {"mobile", "check-out", "OFFICE", "Check-out qua mobile"},
            {"mobile", "read-notes", "SELF", "Đọc ghi chú bệnh nhân"},
            {"mobile", "write-notes", "SELF", "Tạo/cập nhật ghi chú bệnh nhân"},

            // Billing permissions
            {"billing", "read", "OFFICE", "Xem thông tin billing"},
            {"billing", "generate", "OFFICE", "Tạo claims"},
            {"billing", "submit", "OFFICE", "Submit claims"},

            // Fire Drill permissions
            {"firedrill", "create", "OFFICE", "Tạo fire drill"},
            {"firedrill", "read", "OFFICE", "Xem fire drill"},
            {"firedrill", "update", "OFFICE", "Cập nhật fire drill"},

            // Compliance permissions
            {"compliance", "read", "ORG", "Xem báo cáo tuân thủ"},
        };

        for (String[] permData : permissions) {
            String resource = permData[0];
            String action = permData[1];
            String scope = permData[2];
            String description = permData[3];

            if (permissionRepository.findByResourceAndActionAndScope(resource, action, PermissionScope.valueOf(scope)).isEmpty()) {
                Permission permission = new Permission(resource, action, PermissionScope.valueOf(scope));
                permission.setDescription(description);
                permissionRepository.save(permission);
                log.info("Created permission: {}:{}:{}", resource, action, scope);
            }
        }
    }
}
