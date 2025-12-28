package com.example.backend.data;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.model.entity.Address;
import com.example.backend.model.entity.Office;
import com.example.backend.repository.AddressRepository;
import com.example.backend.repository.OfficeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


/**
 * Loads office data with addresses
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OfficeDataLoader {

    private final OfficeRepository officeRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public void loadData() {
        // Check if data already exists and skip if it does
        if (officeRepository.count() > 0) {
            return;
        } else{
            log.info("Loading office data...");
            loadOffices();
            log.info("Office data loaded successfully");
        }
    }

    private void loadOffices() {
        // Office data with GPS coordinates for Ho Chi Minh City locations
        Object[][] officeData = {
            // Main Office - District 1 (City Center)
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
                "19801",
                10.762622,  // Latitude - District 1, HCMC
                106.660172  // Longitude - District 1, HCMC
            },
            // Chester Office - District 3
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
                "19013",
                10.786945,  // Latitude - District 3, HCMC
                106.678413  // Longitude - District 3, HCMC
            },
            // Montgomery Office - District 7
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
                "19401",
                10.734920,  // Latitude - District 7, HCMC
                106.717580  // Longitude - District 7, HCMC
            }
        };

        for (Object[] data : officeData) {
            String code = (String) data[0];
            String name = (String) data[1];
            String county = (String) data[2];
            String phone = (String) data[3];
            String email = (String) data[4];
            String line1 = (String) data[5];
            String line2 = (String) data[6];
            String city = (String) data[7];
            String state = (String) data[8];
            String postalCode = (String) data[9];
            Double latitude = (Double) data[10];
            Double longitude = (Double) data[11];

            if (officeRepository.findByCode(code).isEmpty()) {
                // Create address first with GPS coordinates
                Address address = new Address(line1, city, state, postalCode);
                address.setLine2(line2);
                address.setLatitude(java.math.BigDecimal.valueOf(latitude));
                address.setLongitude(java.math.BigDecimal.valueOf(longitude));
                addressRepository.save(address);

                // Create office
                Office office = new Office(code, name);
                office.setCounty(county);
                office.setPhone(phone);
                office.setEmail(email);
                office.setAddress(address);
                officeRepository.save(office);

                log.info("Created office: {} - {} at coordinates ({}, {})", code, name, latitude, longitude);
            }
        }
    }
}
