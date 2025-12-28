package com.example.backend.data;

import com.example.backend.model.entity.*;
import com.example.backend.model.enums.CareSetting;
import com.example.backend.model.enums.PermissionScope;
import com.example.backend.repository.*;
import com.example.backend.service.BulkInsertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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
    private final ServiceTypeRepository serviceTypeRepository;
    private final BulkInsertService bulkInsertService;

    @Transactional
    public void loadData() {
        // Check if data already exists and skip if it does
        if (moduleRepository.count() > 0 || roleRepository.count() > 0 || 
            permissionRepository.count() > 0 || serviceTypeRepository.count() > 0) {
            return;
        } else{
            log.info("Loading core system data...");
            
        // Load modules
        loadModules();

        // Load roles
        loadRoles();

        // Load basic permissions
        loadPermissions();

        // Load service types
        loadServiceTypes();

        log.info("Core system data loaded successfully");
        }
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
            {"ADMIN", "System Admin", "Full access to system configuration and operation", "true"},
            {"MANAGER", "Office Manager", "Manages office, coordinates schedules, and monitors compliance", "false"},
            {"DSP", "Direct Support Professional", "Caregiver who uses the mobile app and records services", "false"},
            {"FINANCE", "Finance & Billing", "Staff responsible for billing & claims", "false"}
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
            {"users", "create", "ORG", "Create new users"},
            {"users", "read", "ORG", "View user list"},
            {"users", "update", "ORG", "Update user information"},
            {"users", "delete", "ORG", "Delete users"},
            {"roles", "read", "ORG", "View role list"},
            {"roles", "assign", "ORG", "Assign roles to users"},
            {"settings", "read", "ORG", "View system settings"},
            {"settings", "update", "ORG", "Update system settings"},

            // Staff permissions
            {"staff", "create", "OFFICE", "Create staff profiles"},
            {"staff", "read", "OFFICE", "View staff profiles"},
            {"staff", "update", "OFFICE", "Update staff profiles"},
            {"staff", "delete", "OFFICE", "Delete staff profiles"},

            // Patient permissions
            {"patients", "create", "OFFICE", "Create patient records"},
            {"patients", "read", "OFFICE", "View patient records"},
            {"patients", "update", "OFFICE", "Update patient records"},
            {"patients", "delete", "OFFICE", "Delete patient records"},

            // ISP permissions
            {"isp", "create", "OFFICE", "Create ISP"},
            {"isp", "read", "OFFICE", "View ISP"},
            {"isp", "update", "OFFICE", "Update ISP"},
            {"isp", "delete", "OFFICE", "Delete ISP"},

            // Schedule permissions
            {"schedule", "create", "OFFICE", "Create work schedules"},
            {"schedule", "read", "OFFICE", "View work schedules"},
            {"schedule", "update", "OFFICE", "Update work schedules"},
            {"schedule", "delete", "OFFICE", "Delete work schedules"},

            // Mobile permissions
            {"mobile", "check-in", "OFFICE", "Check-in via mobile"},
            {"mobile", "check-out", "OFFICE", "Check-out via mobile"},
            {"mobile", "read-notes", "SELF", "Read patient notes"},
            {"mobile", "write-notes", "SELF", "Create/update patient notes"},

            // Office permissions
            {"offices", "create", "ORG", "Create new offices"},
            {"offices", "read", "ORG", "View office list"},
            {"offices", "update", "ORG", "Update office information"},
            {"offices", "delete", "ORG", "Delete offices"},

            // Billing permissions
            {"billing", "read", "ORG", "View billing information"},
            {"billing", "generate", "ORG", "Generate claims"},
            {"billing", "submit", "ORG", "Submit claims"},

            // Fire Drill permissions
            {"firedrill", "create", "OFFICE", "Create fire drill"},
            {"firedrill", "read", "OFFICE", "View fire drill"},
            {"firedrill", "update", "OFFICE", "Update fire drill"},

            // Compliance permissions
            {"compliance", "read", "ORG", "View compliance reports"},
        };

        List<Permission> permissionList = new ArrayList<>();
        for (String[] permData : permissions) {
            String resource = permData[0];
            String action = permData[1];
            String scope = permData[2];
            String description = permData[3];

            if (permissionRepository.findByResourceAndActionAndScope(resource, action, PermissionScope.valueOf(scope)).isEmpty()) {
                Permission permission = new Permission(resource, action, PermissionScope.valueOf(scope));
                permission.setId(java.util.UUID.randomUUID()); // Set UUID for bulk insert
                permission.setDescription(description);
                permissionList.add(permission);
                log.info("Prepared permission: {}:{}:{}", resource, action, scope);
            }
        }

        // Bulk insert permissions using JDBC batch processing for maximum performance
        if (!permissionList.isEmpty()) {
            log.info("Bulk inserting {} permissions using JDBC batch processing...", permissionList.size());
            bulkInsertService.bulkInsertPermissions(permissionList);
        }
    }
    
    private void loadServiceTypes() {
        Object[][] serviceTypes = {
            // Format: code, name, careSetting, description, unitBasis, isBillable
            // Non-Residential (SRS 3.1)
            {"HOME_COMM", "Home & Community Habilitation", CareSetting.NON_RESIDENTIAL, "Assists individuals in acquiring, maintaining, and improving self-help, domestic, and social skills.", "15min", true},
            {"COMPANION", "Companion Services", CareSetting.NON_RESIDENTIAL, "Provides daily companionship, assistance with travel, and social interaction.", "15min", true},
            {"EMP_SUPPORT", "Employment / Supported Employment", CareSetting.NON_RESIDENTIAL, "Supports individuals in finding, training for, and maintaining employment in an integrated setting.", "hour", true},
            {"THERAPY", "Therapy Services", CareSetting.NON_RESIDENTIAL, "Includes physical, speech, behavioral therapy, and psychological counseling.", "15min", true},
            {"BEHAVIOR", "Behavior Support", CareSetting.NON_RESIDENTIAL, "Behavioral assessment, intervention planning, and support to reduce challenging behaviors.", "15min", true},
            {"TRANSPORT", "Transportation", CareSetting.NON_RESIDENTIAL, "Assists with travel to programs, work, medical appointments, and social activities.", "trip", true},
            {"RESPITE_DAY", "Respite Services (Day/Night)", CareSetting.NON_RESIDENTIAL, "Provides short-term relief for primary caregivers, either in-home or during the day.", "hour", true},
            {"ASSISTIVE", "Assistive Technology / Environmental Modifications", CareSetting.NON_RESIDENTIAL, "Provides devices, home modifications, and tools to support mobility, communication, and safety.", "item", true},
            
            // Residential (SRS 3.2)
            {"GROUP_HOME", "Group Homes / Community Living", CareSetting.RESIDENTIAL, "Group homes or apartments with 24/7 staff support to ensure safety and daily living.", "day", true},
            {"LIFE_SHARING", "Life Sharing / Family Living", CareSetting.RESIDENTIAL, "Individuals live with a host family or their own family with continuous support.", "day", true},
            {"SUPPORTED_LIVING", "Supported / Independent Living with Supports", CareSetting.RESIDENTIAL, "Independent living with needs-based support for housekeeping, medical care, and medication management.", "day", true},
            {"ICF", "Intermediate Care Facilities (ICF/IID)", CareSetting.RESIDENTIAL, "Facilities with higher supervision, providing intensive medical/behavioral support for complex needs.", "day", true}
        };

        for (Object[] typeData : serviceTypes) {
            String code = (String) typeData[0];
            String name = (String) typeData[1];
            CareSetting careSetting = (CareSetting) typeData[2];
            String description = (String) typeData[3];
            String unitBasis = (String) typeData[4];
            Boolean isBillable = (Boolean) typeData[5];

            if (!serviceTypeRepository.existsByCode(code)) {
                ServiceType serviceType = new ServiceType(code, name, careSetting);
                serviceType.setDescription(description);
                serviceType.setUnitBasis(unitBasis);
                serviceType.setIsBillable(isBillable);
                serviceTypeRepository.save(serviceType);
                log.info("Created service type: {} - {}", code, name);
            }
        }
    }
}
