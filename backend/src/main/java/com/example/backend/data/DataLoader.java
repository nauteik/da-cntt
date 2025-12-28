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
    private final HouseDataLoader houseDataLoader;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");

        try {
            // Load core data first (Permissions, Roles)
            coreDataLoader.loadData();
            
            // Load offices
            officeDataLoader.loadData();
            
            // Load role-permission mappings
            rolePermissionDataLoader.loadData();
            
            // Load users and assign them to roles and offices
            userDataLoader.loadData();

            // Load patient data
            patientDataLoader.loadData();

            // Load medication data
            medicationDataLoader.loadData();

            // Load house data and assign patients
            houseDataLoader.loadData();
            
        } catch (Exception e) {
            log.info("Error during data initialization: {}", e.getMessage());
            log.debug("Full stack trace:", e);
            // Don't throw exception to prevent application startup failure
            // throw e;
        }
    }
}
