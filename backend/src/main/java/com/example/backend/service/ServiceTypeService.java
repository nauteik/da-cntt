package com.example.backend.service;

import com.example.backend.model.dto.ServiceTypeSelectDTO;

import java.util.List;

/**
 * Service interface for ServiceType operations
 */
public interface ServiceTypeService {

    /**
     * Get all service types for select dropdown.
     * Returns all service types (active and inactive) for selection purposes.
     *
     * @return list of service types with id, code, and name
     */
    List<ServiceTypeSelectDTO> getServiceTypesForSelect();
}

