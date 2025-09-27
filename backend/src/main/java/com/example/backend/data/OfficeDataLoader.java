package com.example.backend.data;

import com.example.backend.model.entity.Address;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Organization;
import com.example.backend.repository.AddressRepository;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * Loads office data with addresses
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OfficeDataLoader {

    private final OrganizationRepository organizationRepository;
    private final OfficeRepository officeRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public void loadData() {
        log.info("Loading office data...");
        
        // Get the organization (should be created by CoreDataLoader)
        Organization organization = organizationRepository.findAll().stream()
            .filter(org -> "BAC".equals(org.getCode()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("BAC Organization not found. Run CoreDataLoader first."));
        
        loadOffices(organization);
        
        log.info("Office data loaded successfully");
    }

    private void loadOffices(Organization organization) {
        String[][] officeData = {
            // Main Office
            {
                "MAIN",
                "BAC Main Office", 
                "Delaware",
                "+1-610-000-0001",
                "office@blueangelscare.com",
                "123 Main Street",
                null,
                "Wilmington",
                "DE",
                "19801"
            },
            // Chester Office
            {
                "CHESTER",
                "BAC Chester Office",
                "Delaware", 
                "+1-610-000-0002",
                "chester@blueangelscare.com",
                "456 Chester Avenue",
                "Suite 200",
                "Chester",
                "PA",
                "19013"
            },
            // Montgomery Office
            {
                "MONTGOMERY",
                "BAC Montgomery Office",
                "Montgomery",
                "+1-610-000-0003", 
                "montgomery@blueangelscare.com",
                "789 Montgomery Drive",
                "Floor 3",
                "Norristown",
                "PA",
                "19401"
            }
        };

        for (String[] data : officeData) {
            String code = data[0];
            String name = data[1];
            String county = data[2];
            String phone = data[3];
            String email = data[4];
            String line1 = data[5];
            String line2 = data[6];
            String city = data[7];
            String state = data[8];
            String postalCode = data[9];
            
            if (!officeRepository.existsByOrganizationAndCode(organization, code)) {
                // Create address first
                Address address = new Address();
                address.setOrganization(organization);
                address.setLine1(line1);
                address.setLine2(line2);
                address.setCity(city);
                address.setState(state);
                address.setPostalCode(postalCode);
                address.setCountry("USA");
                address.setMeta(new HashMap<>());
                Address savedAddress = addressRepository.save(address);
                
                // Create office
                Office office = new Office(organization, code, name);
                office.setAddress(savedAddress);
                office.setCounty(county);
                office.setPhone(phone);
                office.setEmail(email);
                office.setTimezone("America/New_York");
                
                Map<String, Object> billingConfig = new HashMap<>();
                billingConfig.put("claim_submission_method", "medicaid_portal");
                office.setBillingConfig(billingConfig);
                
                officeRepository.save(office);
                log.info("Created office: {} - {} at {}, {}", code, name, city, state);
            }
        }
    }
}
