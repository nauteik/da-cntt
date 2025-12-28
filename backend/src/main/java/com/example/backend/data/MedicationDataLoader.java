package com.example.backend.data;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Component;

import com.example.backend.model.entity.MedicationOrder;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.PatientAllergy;
import com.example.backend.model.enums.DrugForm;
import com.example.backend.repository.MedicationOrderRepository;
import com.example.backend.repository.PatientAllergyRepository;
import com.example.backend.repository.PatientRepository;
import com.github.javafaker.Faker;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicationDataLoader {

    private final PatientRepository patientRepository;
    private final MedicationOrderRepository orderRepository;
    private final PatientAllergyRepository allergyRepository;

    public void loadData() {
        long orderCount = orderRepository.count();
        
        if (orderCount == 0) {
            log.info("Loading sample medication data...");
            List<Patient> patients = patientRepository.findAll();
            if (patients.isEmpty()) {
                log.warn("No patients found, skipping medication data loading. Run PatientDataLoader first.");
                return;
            }

            Faker faker = new Faker();
            Random random = new Random();

            // Load data for all patients to ensure everyone has sample data
            int count = patients.size();
            log.info("Generating medication data for ALL {} patients...", count);
            for (int i = 0; i < count; i++) {
                Patient patient = patients.get(i);

                // 1. Create Sample Allergies (70% of patients have allergies)
                if (random.nextInt(100) < 70) {
                    PatientAllergy allergy = new PatientAllergy();
                    allergy.setPatient(patient);
                    String allergen = faker.options().option("Penicillin", "Peanuts", "Latex", "Sulfa Drugs", "Aspirin");
                    allergy.setAllergen(allergen);
                    allergy.setReaction("Severe skin rash and respiratory distress");
                    allergy.setSeverity(faker.options().option("Severe", "Moderate", "Mild"));
                    allergy.setIsActive(true);
                    allergyRepository.save(allergy);
                }

                // 2. Create a Scheduled Medication (Everyone has at least one)
                MedicationOrder scheduledOrder = new MedicationOrder();
                scheduledOrder.setPatient(patient);
                String drug = faker.options().option("Lisinopril", "Metformin", "Amlodipine", "Atorvastatin", "Levothyroxine");
                scheduledOrder.setDrugName(drug);
                scheduledOrder.setDrugForm(DrugForm.TABLET);
                scheduledOrder.setDosage(faker.options().option("10mg", "20mg", "500mg", "5mg"));
                scheduledOrder.setRoute("Oral");
                scheduledOrder.setFrequency("Daily at 08:00");
                scheduledOrder.setIndication("Chronic Condition Management");
                scheduledOrder.setStartAt(LocalDate.now().minusMonths(1));
                scheduledOrder.setIsPrn(false);
                scheduledOrder.setIsControlled(false);
                scheduledOrder.setCurrentStock(30.0);
                scheduledOrder.setReorderLevel(7.0);
                scheduledOrder.setUnitOfMeasure("tablets");
                scheduledOrder.setPrescribingProvider("Dr. " + faker.name().lastName());
                scheduledOrder.setPharmacyInfo("Local Pharmacy - (555) " + faker.phoneNumber().subscriberNumber(7));
                orderRepository.save(scheduledOrder);

                // 3. Create a PRN Medication (80% of patients)
                if (random.nextInt(100) < 80) {
                    MedicationOrder prnOrder = new MedicationOrder();
                    prnOrder.setPatient(patient);
                    prnOrder.setDrugName(faker.options().option("Acetaminophen", "Ibuprofen", "Albuterol Inhaler"));
                    prnOrder.setDrugForm(random.nextBoolean() ? DrugForm.TABLET : DrugForm.INHALER);
                    prnOrder.setDosage(faker.options().option("500mg", "200mg", "2 puffs"));
                    prnOrder.setRoute(prnOrder.getDrugForm() == DrugForm.INHALER ? "Inhalation" : "Oral");
                    prnOrder.setFrequency("Every 6 hours as needed");
                    prnOrder.setIndication("Pain or Symptom Relief");
                    prnOrder.setStartAt(LocalDate.now().minusMonths(2));
                    prnOrder.setIsPrn(true);
                    prnOrder.setIsControlled(false);
                    prnOrder.setCurrentStock(15.0);
                    prnOrder.setReorderLevel(5.0);
                    prnOrder.setUnitOfMeasure(prnOrder.getDrugForm() == DrugForm.INHALER ? "doses" : "tablets");
                    prnOrder.setPrescribingProvider("Dr. " + faker.name().lastName());
                    orderRepository.save(prnOrder);
                }

                // 4. Create a Controlled Medication for some patients (20% of patients)
                if (random.nextInt(100) < 20) {
                    MedicationOrder controlledOrder = new MedicationOrder();
                    controlledOrder.setPatient(patient);
                    controlledOrder.setDrugName(faker.options().option("Morphine Sulfate", "Oxycodone", "Lorazepam"));
                    controlledOrder.setDrugForm(faker.options().option(DrugForm.LIQUID, DrugForm.TABLET));
                    controlledOrder.setDosage(faker.options().option("5mg/ml", "5mg", "1mg"));
                    controlledOrder.setRoute("Oral");
                    controlledOrder.setFrequency("Twice daily");
                    controlledOrder.setIndication("Severe Pain Management");
                    controlledOrder.setStartAt(LocalDate.now().minusWeeks(2));
                    controlledOrder.setIsPrn(false);
                    controlledOrder.setIsControlled(true);
                    controlledOrder.setCurrentStock(20.0);
                    controlledOrder.setReorderLevel(5.0);
                    controlledOrder.setUnitOfMeasure(controlledOrder.getDrugForm() == DrugForm.LIQUID ? "ml" : "tablets");
                    controlledOrder.setPrescribingProvider("Dr. " + faker.name().lastName());
                    orderRepository.save(controlledOrder);
                }
            }
            log.info("Medication data loaded for all patients.");
        } 
    }
}
