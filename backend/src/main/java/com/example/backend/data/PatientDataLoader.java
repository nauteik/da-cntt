package com.example.backend.data;

import com.example.backend.model.entity.*;
import com.example.backend.model.enums.Gender;
import com.example.backend.model.enums.PatientStatus;
import com.example.backend.model.enums.AddressType;
import com.example.backend.repository.*;
import com.example.backend.service.BulkInsertService;
import com.github.javafaker.Faker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class PatientDataLoader {

    private final PatientRepository patientRepository;
    private final PayerRepository payerRepository;
    private final ProgramRepository programRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final OfficeRepository officeRepository;
    private final BulkInsertService bulkInsertService;


    public void loadData() {
        log.info("Loading patient data...");
        if (patientRepository.count() == 0 && officeRepository.count() > 0) {
            Faker faker = new Faker();
            Office office = officeRepository.findAll().get(0);
            
            // Load programs first
            List<Program> programs = loadProgramData();
            
            // Load payers matching programs (ODP -> PAODP, etc.)
            List<Payer> payers = loadPayerData(programs);
            
            // Load patient data
            List<Patient> patients = loadPatientData(faker, office);
            List<Address> addresses = loadAddressData(faker);
            loadPatientAddressData(faker, patients, addresses);
            loadPatientContactData(faker, patients, addresses);
            
            // Link patients to programs and payers
            List<PatientPayer> patientPayers = loadPatientPayerData(faker, patients, payers);
            loadPatientProgramData(faker, patients, programs, payers);
            
            // Load services and authorizations
            List<ServiceType> serviceTypes = serviceTypeRepository.findAll();
            List<PatientService> patientServices = loadPatientServiceData(faker, patients, serviceTypes);
            java.util.Map<java.util.UUID, java.util.List<PatientService>> patientIdToServices =
                patientServices.stream().collect(java.util.stream.Collectors.groupingBy(ps -> ps.getPatient().getId()));
            loadAuthorizationData(faker, patientPayers, patientIdToServices);
            
            // Load ISP data
            List<ISP> isps = loadIspData(faker, patients);
            List<ISPGoal> ispGoals = loadIspGoalData(faker, isps);
            loadIspTaskData(faker, ispGoals);
            
            log.info("Patient data loaded.");
        } else {
            log.info("Patient data already exists or no offices found, skipping patient data loading.");
        }
    }

    private List<Patient> loadPatientData(Faker faker, Office office) {
        List<Patient> patients = new ArrayList<>();
        Set<String> usedClientIds = new HashSet<>();
        Set<String> usedMedicaidIds = new HashSet<>();
        Set<String> usedSsns = new HashSet<>();
        
        log.info("Generating 1000 patients...");
        for (int i = 0; i < 1000; i++) {
            Patient patient = new Patient();
            // Set UUID manually for bulk insert
            patient.setId(java.util.UUID.randomUUID());
            patient.setFirstName(faker.name().firstName());
            patient.setLastName(faker.name().lastName());
            patient.setDob(faker.date().birthday().toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            // Use Gender enum while maintaining "Male"/"Female" in the database
            Gender gender = faker.options().option(Gender.MALE, Gender.FEMALE);
            patient.setGender(gender.getLabel());
            
            // Generate unique SSN
            String ssn;
            do {
                ssn = faker.idNumber().ssnValid();
            } while (usedSsns.contains(ssn));
            usedSsns.add(ssn);
            patient.setSsn(ssn);
            
            // Generate unique client_id
            String clientId;
            do {
                clientId = faker.numerify("######");
            } while (usedClientIds.contains(clientId));
            usedClientIds.add(clientId);
            patient.setClientId(clientId);
            
            // Generate unique agency_id
            patient.setAgencyId(faker.numerify("#####"));
            
            // Generate unique medicaid_id
            String medicaidId;
            do {
                medicaidId = faker.numerify("#########");
            } while (usedMedicaidIds.contains(medicaidId));
            usedMedicaidIds.add(medicaidId);
            patient.setMedicaidId(medicaidId);
            
            patient.setPrimaryLanguage("English");
            // Vary status: 80% Active, 15% Inactive, 5% Pending
            int statusRandom = faker.random().nextInt(100);
            if (statusRandom < 80) {
                patient.setStatus(PatientStatus.ACTIVE);
            } else if (statusRandom < 95) {
                patient.setStatus(PatientStatus.INACTIVE);
            } else {
                patient.setStatus(PatientStatus.PENDING);
            }
            patient.setOffice(office);
            patients.add(patient);
            
            // Log progress every 100 patients
            if ((i + 1) % 100 == 0) {
                log.info("Generated {} patients...", i + 1);
            }
        }
        
        // Bulk insert patients using JDBC batch processing for maximum performance
        log.info("Bulk inserting 1000 patients to database using JDBC batch processing...");
        bulkInsertService.bulkInsertPatients(patients);
        
        return patients;
    }

    private List<Address> loadAddressData(Faker faker) {
        List<Address> addresses = new ArrayList<>();
        log.info("Generating 1000 addresses...");
        for (int i = 0; i < 1000; i++) {
            Address address = new Address();
            // Set UUID manually for bulk insert
            address.setId(java.util.UUID.randomUUID());
            address.setLine1(faker.address().streetAddress());
            address.setCity(faker.address().city());
            address.setState(faker.address().stateAbbr());
            address.setPostalCode(faker.address().zipCode());
            address.setCounty("Pennsylvania");
            AddressType type = faker.options().option(AddressType.HOME, AddressType.BUSINESS, AddressType.COMMUNITY);
            address.setType(type);
            address.setLabel(type.getLabel() + " Address");
            
            addresses.add(address);
            
            if ((i + 1) % 100 == 0) {
                log.info("Generated {} addresses...", i + 1);
            }
        }
        
        // Bulk insert addresses using JDBC batch processing for maximum performance
        log.info("Bulk inserting 1000 addresses to database using JDBC batch processing...");
        bulkInsertService.bulkInsertAddresses(addresses);
        
        return addresses;
    }

    private void loadPatientAddressData(Faker faker, List<Patient> patients, List<Address> addresses) {
        List<PatientAddress> patientAddresses = new ArrayList<>();
        log.info("Linking {} patients to addresses...", patients.size());
        for (int i = 0; i < patients.size(); i++) {
            PatientAddress patientAddress = new PatientAddress();
            // Set UUID manually for bulk insert
            patientAddress.setId(java.util.UUID.randomUUID());
            patientAddress.setPatient(patients.get(i));
            patientAddress.setAddress(addresses.get(i));
            String rawPhone = faker.phoneNumber().cellPhone();
            // Remove non-digits
            String digits = rawPhone.replaceAll("\\D", "");
            // Ensure at least 10 digits
            String formattedPhone;
            if (digits.length() >= 10) {
                String area = digits.substring(0, 3);
                String prefix = digits.substring(3, 6);
                String line = digits.substring(6, 10);
                formattedPhone = String.format("(%s) %s-%s", area, prefix, line);
            } else {
                formattedPhone = "(000) 000-0000";
            }
            patientAddress.setPhone(formattedPhone);
            patientAddress.setIsMain(true);
            patientAddresses.add(patientAddress);
        }
        
        // Bulk insert patient addresses using JDBC batch processing for maximum performance
        log.info("Bulk inserting {} patient-address links to database using JDBC batch processing...", patientAddresses.size());
        bulkInsertService.bulkInsertPatientAddresses(patientAddresses);
    }

    private void loadPatientContactData(Faker faker, List<Patient> patients, List<Address> addresses) {
        List<PatientContact> patientContacts = new ArrayList<>();
        log.info("Generating {} patient contacts...", patients.size());
        for (int i = 0; i < patients.size(); i++) {
            PatientContact contact = new PatientContact();
            // Set UUID manually for bulk insert
            contact.setId(java.util.UUID.randomUUID());
            contact.setPatient(patients.get(i));
            contact.setName(faker.name().fullName());
            contact.setRelation(faker.options().option("Parent", "Guardian", "Spouse"));
            contact.setPhone(faker.phoneNumber().cellPhone());
            contact.setEmail(faker.internet().emailAddress());
            contact.setLine1(faker.address().streetAddress());
            contact.setLine2(faker.random().nextBoolean() ? faker.address().secondaryAddress() : null);
            contact.setIsPrimary(true);
            patientContacts.add(contact);
            
            if ((i + 1) % 100 == 0) {
                log.info("Generated {} contacts...", i + 1);
            }
        }
        
        // Bulk insert patient contacts using JDBC batch processing for maximum performance
        log.info("Bulk inserting {} patient contacts to database using JDBC batch processing...", patientContacts.size());
        bulkInsertService.bulkInsertPatientContacts(patientContacts);
    }

    private List<Payer> loadPayerData(List<Program> programs) {
        log.info("Creating payers matching programs...");
        List<Payer> payers = new ArrayList<>();
        
        // Create payers matching each program
        for (Program program : programs) {
            String programIdentifier = program.getProgramIdentifier();
            String payerIdentifier = "PA" + programIdentifier; // ODP -> PAODP, OLTL -> PAOLTL, OMAP -> PAOMAP
            String payerName = "Pennsylvania " + programIdentifier;
            
            if (payerRepository.findByPayerIdentifier(payerIdentifier).isEmpty()) {
                Payer payer = new Payer();
                payer.setPayerIdentifier(payerIdentifier);
                payer.setPayerName(payerName);
                payer.setType(com.example.backend.model.enums.PayerType.MEDICAID);
                payer.setIsActive(true);
                payers.add(payer);
                log.info("Created payer: {} - {} (matched with program: {})", payerIdentifier, payerName, programIdentifier);
            } else {
                payers.add(payerRepository.findByPayerIdentifier(payerIdentifier).get());
                log.info("Payer {} already exists, using existing payer", payerIdentifier);
            }
        }
        
        return payerRepository.saveAll(payers);
    }

    private List<Program> loadProgramData() {
        String[][] programs = {
            {"ODP", "Office of Developmental Programs", "Provides services for individuals with developmental disabilities."},
            {"OLTL", "Office of Long-Term Living", "Provides long-term care services for seniors and adults with disabilities."},
            {"OMAP", "Office of Medical Assistance Programs", "Administers the Medicaid program in Pennsylvania."}
        };

        List<Program> savedPrograms = new ArrayList<>();
        for (String[] programData : programs) {
            String identifier = programData[0];
            String name = programData[1];
            String description = programData[2];

            if (!programRepository.existsByProgramIdentifier(identifier)) {
                Program program = new Program();
                program.setProgramIdentifier(identifier);
                program.setProgramName(name);
                program.setDescription(description);
                program.setActive(true);
                savedPrograms.add(programRepository.save(program));
                log.info("Created program: {} - {}", identifier, name);
            }
        }
        return savedPrograms;
    }

    private List<PatientPayer> loadPatientPayerData(Faker faker, List<Patient> patients, List<Payer> payers) {
        List<PatientPayer> patientPayers = new ArrayList<>();
        for (Patient patient : patients) {
            PatientPayer patientPayer = new PatientPayer();
            // Set UUID manually for bulk insert
            patientPayer.setId(java.util.UUID.randomUUID());
            patientPayer.setPatient(patient);
            patientPayer.setPayer(payers.get(faker.random().nextInt(payers.size())));
            patientPayer.setClientPayerId(patient.getMedicaidId());
            patientPayers.add(patientPayer);
        }
        
        // Bulk insert patient payers using JDBC batch processing for maximum performance
        log.info("Bulk inserting {} patient payers using JDBC batch processing...", patientPayers.size());
        bulkInsertService.bulkInsertPatientPayers(patientPayers);
        
        return patientPayers;
    }

    private void loadPatientProgramData(Faker faker, List<Patient> patients, List<Program> programs, List<Payer> payers) {
        List<PatientProgram> patientPrograms = new ArrayList<>();
        
        // Create a map to easily find payer by program identifier
        java.util.Map<String, Payer> programToPayerMap = new java.util.HashMap<>();
        for (int i = 0; i < programs.size() && i < payers.size(); i++) {
            programToPayerMap.put(programs.get(i).getProgramIdentifier(), payers.get(i));
        }
        
        for (Patient patient : patients) {
            PatientProgram patientProgram = new PatientProgram();
            // Set UUID manually for bulk insert
            patientProgram.setId(java.util.UUID.randomUUID());
            patientProgram.setPatient(patient);
            Program selectedProgram = programs.get(faker.random().nextInt(programs.size()));
            patientProgram.setProgram(selectedProgram);
            patientProgram.setEnrollmentDate(faker.date().past(365, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            patientProgram.setStatusEffectiveDate(faker.date().past(30, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            patientProgram.setSocDate(faker.date().past(30, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            patientProgram.setEocDate(faker.date().future(335, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            patientPrograms.add(patientProgram);
            
            log.debug("Assigned patient {} to program {} with matching payer {}", 
                patient.getId(), 
                selectedProgram.getProgramIdentifier(), 
                programToPayerMap.get(selectedProgram.getProgramIdentifier()).getPayerIdentifier());
        }
        
        // Bulk insert patient programs using JDBC batch processing for maximum performance
        log.info("Bulk inserting {} patient programs using JDBC batch processing...", patientPrograms.size());
        bulkInsertService.bulkInsertPatientPrograms(patientPrograms);
    }

    private List<PatientService> loadPatientServiceData(Faker faker, List<Patient> patients, List<ServiceType> serviceTypes) {
        List<PatientService> mappings = new ArrayList<>();
        if (serviceTypes.isEmpty()) {
            return mappings;
        }
        for (Patient patient : patients) {
            ServiceType randomService = serviceTypes.get(faker.random().nextInt(serviceTypes.size()));
            PatientService ps = new PatientService();
            // Set UUID manually for bulk insert
            ps.setId(java.util.UUID.randomUUID());
            ps.setPatient(patient);
            ps.setServiceType(randomService);
            ps.setStartDate(faker.date().past(120, java.util.concurrent.TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            ps.setEndDate(faker.random().nextBoolean() ? null : faker.date().future(240, java.util.concurrent.TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            mappings.add(ps);
        }
        
        // Bulk insert patient services using JDBC batch processing for maximum performance
        log.info("Bulk inserting {} patient services using JDBC batch processing...", mappings.size());
        bulkInsertService.bulkInsertPatientServices(mappings);
        
        return mappings;
    }

    private void loadAuthorizationData(Faker faker, List<PatientPayer> patientPayers, java.util.Map<java.util.UUID, java.util.List<PatientService>> patientIdToServices) {
        List<Authorization> authorizations = new ArrayList<>();
        int counter = 0;
        for (PatientPayer patientPayer : patientPayers) {
            Authorization auth = new Authorization();
            // Set UUID manually for bulk insert
            auth.setId(java.util.UUID.randomUUID());
            auth.setPatientPayer(patientPayer);
            auth.setPatient(patientPayer.getPatient());
            java.util.List<PatientService> services = patientIdToServices.getOrDefault(patientPayer.getPatient().getId(), java.util.Collections.emptyList());
            if (!services.isEmpty()) {
                auth.setPatientService(services.get(0));
            } else {
                // Skip creating authorization if no patient_service mapping exists to satisfy NOT NULL constraint
                continue;
            }
            auth.setAuthorizationNo(String.format("AUTH-%05d-%d", faker.number().numberBetween(1, 99999), counter++));
            auth.setMaxUnits(BigDecimal.valueOf(faker.number().randomDouble(2, 10, 100)));
            auth.setStartDate(faker.date().past(90, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            auth.setEndDate(faker.date().future(90, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            authorizations.add(auth);
        }
        
        // Bulk insert authorizations using JDBC batch processing for maximum performance
        log.info("Bulk inserting {} authorizations using JDBC batch processing...", authorizations.size());
        bulkInsertService.bulkInsertAuthorizations(authorizations);
    }

    private List<ISP> loadIspData(Faker faker, List<Patient> patients) {
        List<ISP> isps = new ArrayList<>();
        for (Patient patient : patients) {
            ISP isp = new ISP();
            // Set UUID manually for bulk insert
            isp.setId(java.util.UUID.randomUUID());
            isp.setPatient(patient);
            isp.setVersionNo(1);
            isp.setEffectiveAt(faker.date().past(30, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            isps.add(isp);
        }
        
        // Bulk insert ISPs using JDBC batch processing for maximum performance
        log.info("Bulk inserting {} ISPs using JDBC batch processing...", isps.size());
        bulkInsertService.bulkInsertISPs(isps);
        
        return isps;
    }

    private List<ISPGoal> loadIspGoalData(Faker faker, List<ISP> isps) {
        List<ISPGoal> ispGoals = new ArrayList<>();
        for (ISP isp : isps) {
            for (int i = 0; i < 3; i++) {
                ISPGoal goal = new ISPGoal();
                // Set UUID manually for bulk insert
                goal.setId(java.util.UUID.randomUUID());
                goal.setIsp(isp);
                goal.setTitle(faker.company().catchPhrase());
                goal.setDescription(faker.company().bs());
                ispGoals.add(goal);
            }
        }
        
        // Bulk insert ISP goals using JDBC batch processing for maximum performance
        log.info("Bulk inserting {} ISP goals using JDBC batch processing...", ispGoals.size());
        bulkInsertService.bulkInsertISPGoals(ispGoals);
        
        return ispGoals;
    }

    private void loadIspTaskData(Faker faker, List<ISPGoal> ispGoals) {
        List<ISPTask> ispTasks = new ArrayList<>();
        for (ISPGoal goal : ispGoals) {
            for (int i = 0; i < 2; i++) {
                ISPTask task = new ISPTask();
                // Set UUID manually for bulk insert
                task.setId(java.util.UUID.randomUUID());
                task.setIspGoal(goal);
                task.setTask(faker.company().catchPhrase());
                task.setFrequency(faker.options().option("Daily", "Weekly", "Monthly"));
                ispTasks.add(task);
            }
        }
        
        // Bulk insert ISP tasks using JDBC batch processing for maximum performance
        log.info("Bulk inserting {} ISP tasks using JDBC batch processing...", ispTasks.size());
        bulkInsertService.bulkInsertISPTasks(ispTasks);
    }
}
