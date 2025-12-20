package com.example.backend.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.model.entity.MedicationAdministration;
import com.example.backend.model.entity.MedicationOrder;
import com.example.backend.model.entity.PatientAllergy;
import com.example.backend.exception.ValidationException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.MedicationAdministrationRepository;
import com.example.backend.repository.MedicationOrderRepository;
import com.example.backend.repository.PatientAllergyRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.repository.StaffRepository;
import com.example.backend.service.MedicationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationServiceImpl implements MedicationService {

    private final MedicationOrderRepository orderRepository;
    private final MedicationAdministrationRepository adminRepository;
    private final PatientAllergyRepository allergyRepository;
    private final PatientRepository patientRepository;
    private final StaffRepository staffRepository;

    @Override
    @Transactional
    public MedicationOrder createOrder(MedicationOrder order) {
        if (order.getPatientIdInput() != null) {
            patientRepository.findById(order.getPatientIdInput()).ifPresent(order::setPatient);
        }
        // Logic to check for allergies before saving could be added here
        return orderRepository.save(order);
    }

    @Override
    public List<MedicationOrder> getActiveOrders(UUID patientId) {
        return orderRepository.findByPatientIdAndStatus(patientId, "active");
    }

    @Override
    @Transactional
    public void discontinueOrder(UUID orderId) {
        orderRepository.findById(orderId).ifPresent(order -> {
            order.setStatus("discontinued");
            orderRepository.save(order);
        });
    }

    @Override
    public List<MedicationOrder> getLowStockOrders() {
        return orderRepository.findLowStockMedications();
    }

    @Override
    @Transactional
    public MedicationAdministration recordAdministration(MedicationAdministration admin) {
        UUID inputOrderId = admin.getMedicationOrderIdInput();
        if (inputOrderId == null && admin.getMedicationOrder() != null) {
            inputOrderId = admin.getMedicationOrder().getId();
        }

        if (inputOrderId == null) {
            throw new ValidationException("Medication order ID is required");
        }

        final UUID finalOrderId = inputOrderId;
        MedicationOrder order = orderRepository.findById(finalOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication Order", finalOrderId));

        admin.setMedicationOrder(order);
        
        if (admin.getPatientIdInput() != null) {
            patientRepository.findById(admin.getPatientIdInput()).ifPresent(admin::setPatient);
        } else if (order.getPatient() != null) {
            admin.setPatient(order.getPatient());
        }

        if (admin.getStaffIdInput() != null) {
            admin.setStaff(staffRepository.findById(admin.getStaffIdInput())
                .orElseThrow(() -> new ValidationException("Administering Staff ID not found: " + admin.getStaffIdInput())));
        }

        if (admin.getWitnessStaffIdInput() != null) {
            admin.setWitnessStaff(staffRepository.findById(admin.getWitnessStaffIdInput())
                .orElseThrow(() -> new ValidationException("Witness Staff ID not found: " + admin.getWitnessStaffIdInput())));
            
            if (admin.getStaffIdInput() != null && admin.getStaffIdInput().equals(admin.getWitnessStaffIdInput())) {
                throw new ValidationException("Witness cannot be the same person as the administering staff");
            }
        }

        // 1. Check if controlled med requires witness
        if (Boolean.TRUE.equals(order.getIsControlled()) && admin.getWitnessStaff() == null) {
            throw new ValidationException("Controlled medication requires a witness signature from a valid staff member");
        }

        // 2. Deduct stock (assuming doseGiven can be parsed to double for simplicity here)
        try {
            Double amount = Double.parseDouble(admin.getDoseGiven().replaceAll("[^0-9.]", ""));
            order.deductStock(amount);
            orderRepository.save(order);
        } catch (Exception e) {
            // Log error but continue if dose format is complex
        }

        return adminRepository.save(admin);
    }

    @Override
    public List<MedicationAdministration> getPatientMAR(UUID patientId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        return adminRepository.findByPatientIdAndAdministeredAtBetween(patientId, start, end);
    }

    @Override
    @Transactional
    public void recordPrnFollowUp(UUID adminId, String effectiveness) {
        adminRepository.findById(adminId).ifPresent(admin -> {
            admin.setPrnFollowUp(effectiveness);
            adminRepository.save(admin);
        });
    }

    @Override
    @Transactional
    public PatientAllergy addAllergy(PatientAllergy allergy) {
        if (allergy.getPatientIdInput() != null) {
            patientRepository.findById(allergy.getPatientIdInput()).ifPresent(allergy::setPatient);
        }
        return allergyRepository.save(allergy);
    }

    @Override
    public List<PatientAllergy> getPatientAllergies(UUID patientId) {
        return allergyRepository.findByPatientIdAndIsActiveTrue(patientId);
    }
}
