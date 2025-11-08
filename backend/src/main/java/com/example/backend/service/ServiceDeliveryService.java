package com.example.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;

import com.example.backend.dto.ServiceDeliveryRequestDTO;
import com.example.backend.dto.ServiceDeliveryResponseDTO;

/**
 * Service interface for ServiceDelivery operations
 */
public interface ServiceDeliveryService {
    
    /**
     * Create a new service delivery
     */
    ServiceDeliveryResponseDTO create(ServiceDeliveryRequestDTO dto);
    
    /**
     * Get service delivery by ID
     */
    ServiceDeliveryResponseDTO getById(UUID id);
    
    /**
     * Update service delivery
     */
    ServiceDeliveryResponseDTO update(UUID id, ServiceDeliveryRequestDTO dto);
    
    /**
     * Delete service delivery
     */
    void delete(UUID id);
    
    /**
     * List all service deliveries with pagination
     */
    Page<ServiceDeliveryResponseDTO> list(int page, int size);
    
    /**
     * Get service deliveries by staff
     */
    List<ServiceDeliveryResponseDTO> getByStaff(UUID staffId);
    
    /**
     * Get service deliveries by patient
     */
    List<ServiceDeliveryResponseDTO> getByPatient(UUID patientId);
    
    /**
     * Get service deliveries by office
     */
    List<ServiceDeliveryResponseDTO> getByOffice(UUID officeId);
    
    /**
     * Get service deliveries by date range
     */
    List<ServiceDeliveryResponseDTO> getByDateRange(LocalDate startDate, LocalDate endDate);
    
    /**
     * Get service deliveries by status
     */
    List<ServiceDeliveryResponseDTO> getByStatus(String status);
    
    /**
     * Update status
     */
    ServiceDeliveryResponseDTO updateStatus(UUID id, String status);
    
    /**
     * Update approval status
     */
    ServiceDeliveryResponseDTO updateApprovalStatus(UUID id, String approvalStatus);
}
