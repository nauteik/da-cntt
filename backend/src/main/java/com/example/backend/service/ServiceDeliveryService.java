package com.example.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;

import com.example.backend.dto.ServiceDeliveryRequestDTO;
import com.example.backend.dto.ServiceDeliveryResponseDTO;
import com.example.backend.model.dto.VisitMaintenanceDTO;
import com.example.backend.model.enums.VisitStatus;

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
    
    /**
     * Cancel service delivery
     */
    ServiceDeliveryResponseDTO cancel(UUID id, String reason);
    
    /**
     * Get visit maintenance view with detailed information for billing verification
     * 
     * @param startDate Filter by visit start date (inclusive)
     * @param endDate Filter by visit end date (inclusive)
     * @param clientId Filter by specific client
     * @param employeeId Filter by specific employee
     * @param officeId Filter by office
     * @param status Filter by visit status
     * @param search Search in client name, employee name, or service name
     * @param cancelled Filter by cancelled status
     * @param page Page number (0-based)
     * @param size Page size
     * @param sortBy Sort field
     * @param sortDir Sort direction (asc/desc)
     * @return Page of visit maintenance records
     */
    Page<VisitMaintenanceDTO> getVisitMaintenance(
            LocalDate startDate,
            LocalDate endDate,
            UUID clientId,
            UUID employeeId,
            UUID officeId,
            VisitStatus status,
            String search,
            Boolean cancelled,
            int page,
            int size,
            String sortBy,
            String sortDir);
}
