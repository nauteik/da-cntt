package com.example.backend.data;

import com.example.backend.model.entity.*;
import com.example.backend.model.enums.CareSetting;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * Loads house data and assigns patients with residential authorization to houses
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HouseDataLoader {

    private final HouseRepository houseRepository;
    private final PatientHouseStayRepository patientHouseStayRepository;
    private final OfficeRepository officeRepository;
    private final PatientRepository patientRepository;
    private final AuthorizationRepository authorizationRepository;
    private final PatientServiceRepository patientServiceRepository;
    private final ServiceTypeRepository serviceTypeRepository;

    @Transactional
    public void loadData() {
        log.info("Loading house data...");

        // Check if data already exists and skip if it does
        if (houseRepository.count() > 0) {
            log.info("House data already exists. Skipping.");
            return;
        }

        // Check prerequisites
        long officeCount = officeRepository.count();
        long patientCount = patientRepository.count();
        
        if (officeCount == 0) {
            log.warn("No offices found. House data loading requires at least one office.");
            return;
        }

        if (patientCount == 0) {
            log.warn("No patients found. House data loading requires at least one patient.");
            return;
        }

        // Load houses for each office
        List<House> houses = loadHouses();
        
        // Assign patients with residential authorization to houses
        assignPatientsToHouses(houses);

        log.info("House data loaded successfully");
    }

    private List<House> loadHouses() {
        List<House> houses = new ArrayList<>();
        List<Office> offices = officeRepository.findAll();
        
        log.info("Creating houses for {} offices...", offices.size());
        
        // House data: [code, name, description]
        String[][] houseData = {
            {"HOUSE-001", "Sunshine House", "A comfortable group home with 24/7 support"},
            {"HOUSE-002", "Harmony House", "Community living facility with shared spaces"},
            {"HOUSE-003", "Peaceful Place", "Independent living with support services"},
            {"HOUSE-004", "Hope Haven", "Family-style residential facility"},
            {"HOUSE-005", "Comfort Corner", "Group home with specialized care"},
            {"HOUSE-006", "Serenity House", "Supported living facility"},
            {"HOUSE-007", "Tranquil Terrace", "Community living with staff support"},
            {"HOUSE-008", "Wellness Way", "Residential facility with medical support"},
        };

        Random random = new Random();
        
        // Create 2-3 houses per office
        for (Office office : offices) {
            int housesPerOffice = 2 + random.nextInt(2); // 2-3 houses
            
            for (int i = 0; i < housesPerOffice && i < houseData.length; i++) {
                String[] data = houseData[i % houseData.length];
                String code = data[0] + "-" + office.getCode();
                String name = data[1] + " - " + office.getName();
                String description = data[2];
                
                // Check if house code already exists for this office
                if (!houseRepository.existsByCodeAndOfficeId(code, office.getId())) {
                    House house = new House(office, code, name);
                    house.setDescription(description);
                    house.setIsActive(true);
                    
                    house = houseRepository.save(house);
                    houses.add(house);
                    log.info("Created house: {} - {} for office {}", code, name, office.getName());
                }
            }
        }
        
        return houses;
    }

    private void assignPatientsToHouses(List<House> houses) {
        if (houses.isEmpty()) {
            log.warn("No houses available to assign patients.");
            return;
        }

        log.info("Assigning patients with residential authorization to houses...");

        // Get residential service types
        List<ServiceType> residentialServices = serviceTypeRepository.findAll().stream()
            .filter(st -> CareSetting.RESIDENTIAL.equals(st.getCareSetting()))
            .collect(Collectors.toList());

        if (residentialServices.isEmpty()) {
            log.warn("No residential service types found. Cannot assign patients to houses.");
            return;
        }

        // Get all patient services with residential care setting
        List<PatientService> allPatientServices = patientServiceRepository.findAll();
        List<PatientService> residentialPatientServices = allPatientServices.stream()
            .filter(ps -> residentialServices.contains(ps.getServiceType()))
            .collect(Collectors.toList());

        if (residentialPatientServices.isEmpty()) {
            log.warn("No patients with residential services found. Cannot assign patients to houses.");
            return;
        }

        // Get all authorizations
        List<Authorization> allAuthorizations = authorizationRepository.findAll();
        
        // Find patients with active residential authorization
        LocalDate today = LocalDate.now();
        List<Patient> eligiblePatients = new ArrayList<>();
        
        for (PatientService ps : residentialPatientServices) {
            Patient patient = ps.getPatient();
            
            // Check if patient has active authorization for this residential service
            boolean hasActiveAuth = allAuthorizations.stream()
                .anyMatch(auth -> {
                    if (!auth.getPatientService().getId().equals(ps.getId())) {
                        return false;
                    }
                    
                    // Check authorization is active
                    boolean isActive = auth.getStartDate().isBefore(today) || auth.getStartDate().equals(today);
                    if (auth.getEndDate() != null) {
                        isActive = isActive && (auth.getEndDate().isAfter(today) || auth.getEndDate().equals(today));
                    }
                    
                    return isActive;
                });
            
            if (hasActiveAuth && !eligiblePatients.contains(patient)) {
                eligiblePatients.add(patient);
            }
        }

        log.info("Found {} patients with active residential authorization", eligiblePatients.size());

        if (eligiblePatients.isEmpty()) {
            log.warn("No patients with active residential authorization found.");
            return;
        }

        // Assign patients to houses (one patient per house)
        Random random = new Random();
        int assignedCount = 0;
        
        for (House house : houses) {
            // Check if house already has a patient
            if (patientHouseStayRepository.existsByHouseIdAndMoveOutDateIsNull(house.getId())) {
                continue;
            }
            
            if (eligiblePatients.isEmpty()) {
                break;
            }
            
            // Randomly select a patient
            Patient patient = eligiblePatients.remove(random.nextInt(eligiblePatients.size()));
            
            // Check if patient is already assigned to another house
            if (patientHouseStayRepository.existsByPatientIdAndMoveOutDateIsNull(patient.getId())) {
                // Put patient back and skip
                eligiblePatients.add(patient);
                continue;
            }
            
            // Create stay record
            // Move in date: random date within last 6 months
            LocalDate moveInDate = today.minusDays(random.nextInt(180));
            
            PatientHouseStay stay = new PatientHouseStay(patient, house, moveInDate);
            patientHouseStayRepository.save(stay);
            
            assignedCount++;
            log.info("Assigned patient {} to house {} (moved in: {})", 
                patient.getFirstName() + " " + patient.getLastName(), 
                house.getName(), 
                moveInDate);
        }
        
        log.info("Assigned {} patients to houses", assignedCount);
    }
}

