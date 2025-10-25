package com.example.backend.data;

import com.example.backend.model.entity.*;
import com.example.backend.repository.*;
import com.example.backend.repository.StaffRepository;
import com.example.backend.repository.StaffContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import com.github.javafaker.Faker;

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
    private final UserOfficeRepository userOfficeRepository;
    private final StaffRepository staffRepository;
    private final StaffAddressRepository staffAddressRepository;
    private final StaffContactRepository staffContactRepository;
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
            String email = data[1];

            if (appUserRepository.findByEmail(email).isEmpty()) {
                // Create user
                String hashedPassword = passwordEncoder.encode("password123"); // Default password
                AppUser user = new AppUser(email, hashedPassword, role);
                user.setPreferences(new HashMap<>());
                AppUser savedUser = appUserRepository.save(user);

                // Assign to offices
                Office office = assignUserToOffices(savedUser, offices, roleCode, i);

                // Create Staff entity
                createStaffForUser(savedUser, office, data);

                log.info("Created user: {} with role: {}", email, roleCode);
            }
        }
    }

    private void createStaffForUser(AppUser user, Office office, String[] data) {
        if (office == null) {
            log.warn("Cannot create staff for user {} as no office is assigned.", user.getEmail());
            return;
        }

        String fullName = data[2];
        String phone = data[3];
        String email = fullName.toLowerCase().replace(" ", ".") + "@blueangelscare.com";

        String[] nameParts = fullName.split(" ", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        Staff staff = new Staff(office, firstName, lastName);
        staff.setUser(user);
        staff.setEmployeeId(data[0]); // Using username as employee code
        staff.setIsActive(true);

        staffRepository.save(staff);

        // Create StaffAddress entity
        StaffAddress staffAddress = new StaffAddress(staff, null, phone, email);
        staffAddress.setIsMain(true);
        staffAddressRepository.save(staffAddress);

        // Create StaffContact entity
        Faker faker = new Faker();
        StaffContact staffContact = new StaffContact(staff, faker.options().option("Spouse", "Parent", "Sibling"), faker.name().fullName());
        staffContact.setPhone(faker.phoneNumber().cellPhone());
        staffContact.setEmail(faker.internet().emailAddress());
        staffContact.setLine1(faker.address().streetAddress());
        staffContact.setLine2(faker.random().nextBoolean() ? faker.address().secondaryAddress() : null);
        staffContact.setIsPrimary(true);
        staffContactRepository.save(staffContact);
    }

    private Office assignUserToOffices(AppUser user, List<Office> offices, String roleCode, int userIndex) {
        Office assignedOffice = null;
        if ("ADMIN".equals(roleCode)) {
            // Admins are assigned to all offices
            offices.forEach(office -> userOfficeRepository.save(new UserOffice(user, office)));
            if (!offices.isEmpty()) {
                assignedOffice = offices.get(0); // Assign to the first office for staff record purposes
            }
        } else {
            // Other roles are assigned to a specific office based on index (cycling through offices)
            if (!offices.isEmpty()) {
                assignedOffice = offices.get(userIndex % offices.size());
                userOfficeRepository.save(new UserOffice(user, assignedOffice));
            }
        }
        return assignedOffice;
    }
}

