package com.example.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.example.backend.model.entity.MedicationAdministration;
import com.example.backend.model.entity.MedicationOrder;
import com.example.backend.model.entity.PatientAllergy;

public interface MedicationService {
    // Order Management
    MedicationOrder createOrder(MedicationOrder order);
    List<MedicationOrder> getActiveOrders(UUID patientId);
    void discontinueOrder(UUID orderId);
    List<MedicationOrder> getLowStockOrders();

    // Administration (eMAR)
    MedicationAdministration recordAdministration(MedicationAdministration admin);
    List<MedicationAdministration> getPatientMAR(UUID patientId, LocalDate date);
    void recordPrnFollowUp(UUID adminId, String effectiveness);

    // Allergies
    PatientAllergy addAllergy(PatientAllergy allergy);
    List<PatientAllergy> getPatientAllergies(UUID patientId);
}
