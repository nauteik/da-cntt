package com.example.backend.data;

import com.example.backend.model.entity.Address;
import com.example.backend.model.entity.Office;
import com.example.backend.repository.AddressRepository;
import com.example.backend.repository.OfficeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;


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
        log.info("Loading office data...");

        // Check if data already exists and skip if it does
        if (officeRepository.count() > 0) {
            log.info("Office data already exists. Skipping.");
            return;
        }

        loadOffices();

        log.info("Office data loaded successfully");
    }

    private void loadOffices() {
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

            if (officeRepository.findByCode(code).isEmpty()) {
                // Create address first
                Address address = new Address(line1, city, state, postalCode);
                address.setLine2(line2);
                addressRepository.save(address);

                // Create office
                Office office = new Office(code, name);
                office.setCounty(county);
                office.setPhone(phone);
                office.setEmail(email);
                office.setAddress(address);
                officeRepository.save(office);

                log.info("Created office: {} - {}", code, name);
            }
        }
    }
}
