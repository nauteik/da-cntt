package com.example.backend.data;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

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

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting data initialization...");

        try {
            // Load core data first (Organization, Modules, Roles)
            log.info("Step 1/4: Loading core data (Organization, Modules, Roles)...");
            coreDataLoader.loadData();
            
            // Load offices
            log.info("Step 2/4: Loading offices...");
            officeDataLoader.loadData();
            
            // Load role permissions
            log.info("Step 3/4: Loading role permissions...");
            rolePermissionDataLoader.loadData();
            
            // Load users (depends on roles and offices)
            log.info("Step 4/4: Loading users...");
            userDataLoader.loadData();
            
            log.info("✅ Data initialization completed successfully");
        } catch (Exception e) {
            log.error("❌ Error during data initialization: {}", e.getMessage());
            log.debug("Full stack trace:", e);
            // Don't throw exception to prevent application startup failure
            // throw e;
        }
    }
}
