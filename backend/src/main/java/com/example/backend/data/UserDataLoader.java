package com.example.backend.data;

import com.example.backend.model.entity.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;

/**
 * Loads user data with role assignments and office mappings
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserDataLoader {

    private final OfficeRepository officeRepository;
    private final RoleRepository roleRepository;
    private final AppUserRepository appUserRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserOfficeRepository userOfficeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void loadData() {
        if (appUserRepository.count() > 0) {
            log.info("User data already loaded. Skipping.");
            return;
        }
        log.info("Loading user data...");

        List<Office> offices = officeRepository.findAll();
        if (offices.isEmpty()) {
            throw new RuntimeException("No offices found. Run OfficeDataLoader first.");
        }

        loadUsers(offices);

        log.info("User data loaded successfully");
    }

    private void loadUsers(List<Office> offices) {
        // Admin users
        createUsersForRole(offices, "ADMIN", new String[][]{
            {"admin1", "admin1@blueangelscare.com", "System Administrator 1", "+1-610-100-0001"},
            {"admin2", "admin2@blueangelscare.com", "System Administrator 2", "+1-610-100-0002"}
        });

        // Manager users
        createUsersForRole(offices, "MANAGER", new String[][]{
            {"manager1", "manager1@blueangelscare.com", "Office Manager Delaware", "+1-610-100-0003"},
            {"manager2", "manager2@blueangelscare.com", "Office Manager Chester", "+1-610-100-0004"}
        });

        // DSP users
        createUsersForRole(offices, "DSP", new String[][]{
            {"dsp1", "dsp1@blueangelscare.com", "Direct Support Professional 1", "+1-610-100-0005"},
            {"dsp2", "dsp2@blueangelscare.com", "Direct Support Professional 2", "+1-610-100-0006"}
        });

        // Finance users
        createUsersForRole(offices, "FINANCE", new String[][]{
            {"finance1", "finance1@blueangelscare.com", "Finance Specialist 1", "+1-610-100-0007"},
            {"finance2", "finance2@blueangelscare.com", "Finance Specialist 2", "+1-610-100-0008"}
        });
    }

    private void createUsersForRole(List<Office> offices, String roleCode, String[][] userData) {
        Role role = roleRepository.findByCode(roleCode)
            .orElseThrow(() -> new RuntimeException("Role not found: " + roleCode));

        for (int i = 0; i < userData.length; i++) {
            String[] data = userData[i];
            String username = data[0];
            String email = data[1];
            String displayName = data[2];
            String phone = data[3];

            if (appUserRepository.findByUsername(username).isEmpty()) {
                // Create user
                String hashedPassword = passwordEncoder.encode("password123"); // Default password
                AppUser user = new AppUser(username, displayName, hashedPassword);
                user.setEmail(email);
                user.setPhone(phone);
                user.setPreferences(new HashMap<>());
                AppUser savedUser = appUserRepository.save(user);

                // Assign role
                UserRole userRole = new UserRole(savedUser, role);
                userRoleRepository.save(userRole);

                // Assign to offices
                assignUserToOffices(savedUser, offices, roleCode, i);

                log.info("Created user: {} ({}) with role: {}", username, displayName, roleCode);
            }
        }
    }

    private void assignUserToOffices(AppUser user, List<Office> offices, String roleCode, int userIndex) {
        if ("ADMIN".equals(roleCode)) {
            // Admins are assigned to all offices
            offices.forEach(office -> userOfficeRepository.save(new UserOffice(user, office)));
        } else {
            // Other roles are assigned to a specific office based on index (cycling through offices)
            if (!offices.isEmpty()) {
                Office office = offices.get(userIndex % offices.size());
                userOfficeRepository.save(new UserOffice(user, office));
            }
        }
    }
}

