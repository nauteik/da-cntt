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

    private final OrganizationRepository organizationRepository;
    private final OfficeRepository officeRepository;
    private final RoleRepository roleRepository;
    private final AppUserRepository appUserRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserOfficeRepository userOfficeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void loadData() {
        log.info("Loading user data...");
        
        Organization organization = organizationRepository.findAll().stream()
            .filter(org -> "BAC".equals(org.getCode()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("BAC Organization not found. Run CoreDataLoader first."));
        
        List<Office> offices = officeRepository.findByOrganization(organization);
        if (offices.isEmpty()) {
            throw new RuntimeException("No offices found. Run OfficeDataLoader first.");
        }
        
        loadUsers(organization, offices);
        
        log.info("User data loaded successfully");
    }

    private void loadUsers(Organization organization, List<Office> offices) {
        // Admin users
        createUsersForRole(organization, offices, "ADMIN", new String[][]{
            {"admin1", "admin1@blueangelscare.com", "System Administrator 1", "+1-610-100-0001"},
            {"admin2", "admin2@blueangelscare.com", "System Administrator 2", "+1-610-100-0002"}
        });

        // Manager users  
        createUsersForRole(organization, offices, "MANAGER", new String[][]{
            {"manager1", "manager1@blueangelscare.com", "Office Manager Delaware", "+1-610-100-0003"},
            {"manager2", "manager2@blueangelscare.com", "Office Manager Chester", "+1-610-100-0004"}
        });

        // DSP users
        createUsersForRole(organization, offices, "DSP", new String[][]{
            {"dsp1", "dsp1@blueangelscare.com", "Direct Support Professional 1", "+1-610-100-0005"},
            {"dsp2", "dsp2@blueangelscare.com", "Direct Support Professional 2", "+1-610-100-0006"}
        });

        // Finance users
        createUsersForRole(organization, offices, "FINANCE", new String[][]{
            {"finance1", "finance1@blueangelscare.com", "Finance Specialist 1", "+1-610-100-0007"},
            {"finance2", "finance2@blueangelscare.com", "Finance Specialist 2", "+1-610-100-0008"}
        });
    }

    private void createUsersForRole(Organization organization, List<Office> offices, String roleCode, String[][] userData) {
        Role role = roleRepository.findByOrganizationAndCode(organization, roleCode)
            .orElseThrow(() -> new RuntimeException("Role not found: " + roleCode));

        for (int i = 0; i < userData.length; i++) {
            String[] data = userData[i];
            String username = data[0];
            String email = data[1];
            String displayName = data[2];
            String phone = data[3];
            
            if (!appUserRepository.existsByOrganizationAndUsername(organization, username)) {
                // Create user
                String hashedPassword = passwordEncoder.encode("password123"); // Default password
                AppUser user = new AppUser(organization, username, displayName, hashedPassword);
                user.setEmail(email);
                user.setPhone(phone);
                user.setPreferences(new HashMap<>());
                AppUser savedUser = appUserRepository.save(user);
                
                // Assign role
                UserRole userRole = new UserRole(savedUser, role);
                userRoleRepository.save(userRole);
                
                // Assign to offices (different logic for different roles)
                assignUserToOffices(savedUser, offices, roleCode, i);
                
                log.info("Created user: {} ({}) with role: {}", username, displayName, roleCode);
            }
        }
    }

    private void assignUserToOffices(AppUser user, List<Office> offices, String roleCode, int userIndex) {
        switch (roleCode) {
            case "ADMIN":
                // Admins have access to all offices
                for (int j = 0; j < offices.size(); j++) {
                    Office office = offices.get(j);
                    UserOffice userOffice = new UserOffice(user, office, j == 0); // First office is primary
                    userOfficeRepository.save(userOffice);
                }
                break;
                
            case "MANAGER":
                // Managers are assigned to specific offices
                if (userIndex < offices.size()) {
                    Office primaryOffice = offices.get(userIndex);
                    UserOffice userOffice = new UserOffice(user, primaryOffice, true);
                    userOfficeRepository.save(userOffice);
                }
                break;
                
            case "DSP":
                // DSPs can work in multiple offices but have one primary
                Office primaryOffice = offices.get(userIndex % offices.size());
                UserOffice primaryUserOffice = new UserOffice(user, primaryOffice, true);
                userOfficeRepository.save(primaryUserOffice);
                
                // Also assign to one additional office
                if (offices.size() > 1) {
                    Office secondaryOffice = offices.get((userIndex + 1) % offices.size());
                    UserOffice secondaryUserOffice = new UserOffice(user, secondaryOffice, false);
                    userOfficeRepository.save(secondaryUserOffice);
                }
                break;
                
            case "FINANCE":
                // Finance users have access to all offices for billing purposes
                for (int j = 0; j < offices.size(); j++) {
                    Office office = offices.get(j);
                    UserOffice userOffice = new UserOffice(user, office, j == 0); // First office is primary
                    userOfficeRepository.save(userOffice);
                }
                break;
        }
    }
}
