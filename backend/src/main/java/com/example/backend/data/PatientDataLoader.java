package com.example.backend.data;

import com.example.backend.model.entity.*;
import com.example.backend.model.enums.Gender;
import com.example.backend.model.enums.PatientStatus;
import com.example.backend.repository.*;
import com.github.javafaker.Faker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class PatientDataLoader {

    private final PatientRepository patientRepository;
    private final AddressRepository addressRepository;
    private final PatientAddressRepository patientAddressRepository;
    private final PatientContactRepository patientContactRepository;
    private final PayerRepository payerRepository;
    private final PatientPayerRepository patientPayerRepository;
    private final ProgramRepository programRepository;
    private final PatientProgramRepository patientProgramRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final ServiceAuthorizationRepository serviceAuthorizationRepository;
    private final ISPRepository ispRepository;
    private final ISPGoalRepository ispGoalRepository;
    private final ISPTaskRepository ispTaskRepository;
    private final OfficeRepository officeRepository;


    public void loadData() {
        log.info("Loading patient data...");
        if (patientRepository.count() == 0 && officeRepository.count() > 0) {
            Faker faker = new Faker();
            Office office = officeRepository.findAll().get(0);
            List<Patient> patients = loadPatientData(faker, office);
            List<Address> addresses = loadAddressData(faker);
            loadPatientAddressData(faker, patients, addresses);
            loadPatientContactData(faker, patients, addresses);
            List<Payer> payers = loadPayerData(faker);
            List<Program> programs = loadProgramData();
            List<PatientPayer> patientPayers = loadPatientPayerData(faker, patients, payers);
            loadPatientProgramData(faker, patients, programs);
            List<ServiceType> serviceTypes = serviceTypeRepository.findAll();
            List<ServiceAuthorization> serviceAuthorizations = loadServiceAuthorizationData(faker, patientPayers, serviceTypes);
            List<ISP> isps = loadIspData(faker, patients);
            List<ISPGoal> ispGoals = loadIspGoalData(faker, isps, serviceAuthorizations);
            loadIspTaskData(faker, ispGoals);
            log.info("Patient data loaded.");
        } else {
            log.info("Patient data already exists or no offices found, skipping patient data loading.");
        }
    }

    private List<Patient> loadPatientData(Faker faker, Office office) {
        List<Patient> patients = new ArrayList<>();
        log.info("Generating 1000 patients...");
        for (int i = 0; i < 1000; i++) {
            Patient patient = new Patient();
            patient.setFirstName(faker.name().firstName());
            patient.setLastName(faker.name().lastName());
            patient.setDob(faker.date().birthday().toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            // Use Gender enum while maintaining "Male"/"Female" in the database
            Gender gender = faker.options().option(Gender.MALE, Gender.FEMALE);
            patient.setGender(gender.getLabel());
            patient.setSsn(faker.idNumber().ssnValid());
            patient.setClientId(faker.numerify("######"));
            patient.setAgencyId(faker.numerify("#####"));
            patient.setMedicaidId(faker.numerify("#########"));
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
        log.info("Saving 1000 patients to database...");
        return patientRepository.saveAll(patients);
    }

    private List<Address> loadAddressData(Faker faker) {
        List<Address> addresses = new ArrayList<>();
        log.info("Generating 1000 addresses...");
        for (int i = 0; i < 1000; i++) {
            Address address = new Address();
            address.setLine1(faker.address().streetAddress());
            address.setCity(faker.address().city());
            address.setState(faker.address().stateAbbr());
            address.setPostalCode(faker.address().zipCode());
            address.setCounty("Pennsylvania");
            addresses.add(address);
            
            if ((i + 1) % 100 == 0) {
                log.info("Generated {} addresses...", i + 1);
            }
        }
        log.info("Saving 1000 addresses to database...");
        return addressRepository.saveAll(addresses);
    }

    private void loadPatientAddressData(Faker faker, List<Patient> patients, List<Address> addresses) {
        List<PatientAddress> patientAddresses = new ArrayList<>();
        log.info("Linking {} patients to addresses...", patients.size());
        for (int i = 0; i < patients.size(); i++) {
            PatientAddress patientAddress = new PatientAddress();
            patientAddress.setPatient(patients.get(i));
            patientAddress.setAddress(addresses.get(i));
            patientAddress.setPhone(faker.phoneNumber().cellPhone());
            patientAddress.setIsMain(true);
            patientAddresses.add(patientAddress);
        }
        log.info("Saving {} patient-address links to database...", patientAddresses.size());
        patientAddressRepository.saveAll(patientAddresses);
    }

    private void loadPatientContactData(Faker faker, List<Patient> patients, List<Address> addresses) {
        List<PatientContact> patientContacts = new ArrayList<>();
        log.info("Generating {} patient contacts...", patients.size());
        for (int i = 0; i < patients.size(); i++) {
            PatientContact contact = new PatientContact();
            contact.setPatient(patients.get(i));
            contact.setName(faker.name().fullName());
            contact.setRelation(faker.options().option("Parent", "Guardian", "Spouse"));
            contact.setPhone(faker.phoneNumber().cellPhone());
            contact.setEmail(faker.internet().emailAddress());
            contact.setAddress(addresses.get(i));
            contact.setIsPrimary(true);
            patientContacts.add(contact);
            
            if ((i + 1) % 100 == 0) {
                log.info("Generated {} contacts...", i + 1);
            }
        }
        log.info("Saving {} patient contacts to database...", patientContacts.size());
        patientContactRepository.saveAll(patientContacts);
    }

    private List<Payer> loadPayerData(Faker faker) {
        List<Payer> payers = new ArrayList<>();
        log.info("Generating 10 payers for variety...");
        for (int i = 0; i < 10; i++) {
            Payer payer = new Payer();
            payer.setPayerName(faker.company().name());
            payer.setPayerIdentifier(faker.numerify("PAYER-#####"));
            payers.add(payer);
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
            patientPayer.setPatient(patient);
            patientPayer.setPayer(payers.get(faker.random().nextInt(payers.size())));
            patientPayer.setClientPayerId(faker.numerify("CP-#####"));
            patientPayers.add(patientPayer);
        }
        return patientPayerRepository.saveAll(patientPayers);
    }

    private void loadPatientProgramData(Faker faker, List<Patient> patients, List<Program> programs) {
        List<PatientProgram> patientPrograms = new ArrayList<>();
        for (Patient patient : patients) {
            PatientProgram patientProgram = new PatientProgram();
            patientProgram.setPatient(patient);
            patientProgram.setProgram(programs.get(faker.random().nextInt(programs.size())));
            patientProgram.setEnrollmentDate(faker.date().past(365, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            patientProgram.setStatusEffectiveDate(faker.date().past(30, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            patientProgram.setSocDate(faker.date().past(30, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            patientProgram.setEocDate(faker.date().future(335, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            patientPrograms.add(patientProgram);
        }
        patientProgramRepository.saveAll(patientPrograms);
    }

    private List<ServiceAuthorization> loadServiceAuthorizationData(Faker faker, List<PatientPayer> patientPayers, List<ServiceType> serviceTypes) {
        List<ServiceAuthorization> serviceAuthorizations = new ArrayList<>();
        int counter = 0;
        for (PatientPayer patientPayer : patientPayers) {
            ServiceAuthorization auth = new ServiceAuthorization();
            auth.setPatientPayer(patientPayer);
            auth.setServiceType(serviceTypes.get(faker.random().nextInt(serviceTypes.size())));
            auth.setAuthorizationNo(String.format("AUTH-%05d-%d", faker.number().numberBetween(1, 99999), counter++));
            auth.setMaxUnits(BigDecimal.valueOf(faker.number().randomDouble(2, 10, 100)));
            auth.setStartDate(faker.date().past(90, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            auth.setEndDate(faker.date().future(90, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            serviceAuthorizations.add(auth);
        }
        return serviceAuthorizationRepository.saveAll(serviceAuthorizations);
    }

    private List<ISP> loadIspData(Faker faker, List<Patient> patients) {
        List<ISP> isps = new ArrayList<>();
        for (Patient patient : patients) {
            ISP isp = new ISP();
            isp.setPatient(patient);
            isp.setVersionNo(1);
            isp.setEffectiveAt(faker.date().past(30, TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
            isps.add(isp);
        }
        return ispRepository.saveAll(isps);
    }

    private List<ISPGoal> loadIspGoalData(Faker faker, List<ISP> isps, List<ServiceAuthorization> serviceAuthorizations) {
        List<ISPGoal> ispGoals = new ArrayList<>();
        for (ISP isp : isps) {
            for (int i = 0; i < 3; i++) {
                ISPGoal goal = new ISPGoal();
                goal.setIsp(isp);
                goal.setTitle(faker.company().catchPhrase());
                goal.setDescription(faker.company().bs());
                goal.setServiceAuthorization(serviceAuthorizations.get(faker.random().nextInt(serviceAuthorizations.size())));
                ispGoals.add(goal);
            }
        }
        return ispGoalRepository.saveAll(ispGoals);
    }

    private void loadIspTaskData(Faker faker, List<ISPGoal> ispGoals) {
        List<ISPTask> ispTasks = new ArrayList<>();
        for (ISPGoal goal : ispGoals) {
            for (int i = 0; i < 2; i++) {
                ISPTask task = new ISPTask();
                task.setIspGoal(goal);
                task.setTask(faker.company().catchPhrase());
                task.setFrequency(faker.options().option("Daily", "Weekly", "Monthly"));
                ispTasks.add(task);
            }
        }
        ispTaskRepository.saveAll(ispTasks);
    }
}
