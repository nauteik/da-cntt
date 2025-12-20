package com.example.backend.data;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Main DataLoader that orchestrates all data loading operations
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final CoreDataLoader coreDataLoader;
    private final OfficeDataLoader officeDataLoader;
    private final UserDataLoader userDataLoader;
    private final RolePermissionDataLoader rolePermissionDataLoader;
    private final PatientDataLoader patientDataLoader;
    private final MedicationDataLoader medicationDataLoader;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");

        try {
            // Load core data first (Permissions, Roles)
            log.info("Step 1/5: Loading core data (Permissions, Roles)...");
            coreDataLoader.loadData();
            
            // Load offices
            log.info("Step 2/5: Loading offices...");
            officeDataLoader.loadData();
            
            // Load role-permission mappings
            log.info("Step 3/5: Loading role-permission mappings...");
            rolePermissionDataLoader.loadData();
            
            // Load users and assign them to roles and offices
            log.info("Step 4/5: Loading users...");
            userDataLoader.loadData();

            // Load patient data
            log.info("Step 5/6: Loading patient data...");
            patientDataLoader.loadData();

            // Load medication data
            log.info("Step 6/6: Loading medication data...");
            medicationDataLoader.loadData();

            
            log.info("✅ Data initialization completed successfully");
        } catch (Exception e) {
            log.error("❌ Error during data initialization: {}", e.getMessage());
            log.debug("Full stack trace:", e);
            // Don't throw exception to prevent application startup failure
            // throw e;
        }
    }
}
