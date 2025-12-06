package com.example.backend.service;

import com.example.backend.model.dto.AuthorizationDetailDTO;
import com.example.backend.model.dto.AuthorizationSearchDTO;
import com.example.backend.model.dto.AuthorizationSearchRequestDTO;
import com.example.backend.model.dto.UpdateAuthorizationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service interface for authorization operations
 */
public interface AuthorizationService {
    
    /**
     * Search authorizations with various filters and pagination
     * 
     * @param request search request with filter parameters
     * @param pageable pagination and sorting information
     * @return page of authorization search results
     */
    Page<AuthorizationSearchDTO> searchAuthorizations(AuthorizationSearchRequestDTO request, Pageable pageable);
    
    /**
     * Get authorization details by ID
     * 
     * @param id authorization UUID
     * @return authorization detail DTO
     */
    AuthorizationDetailDTO getAuthorizationById(UUID id);
    
    /**
     * Update authorization
     * 
     * @param id authorization UUID
     * @param dto update DTO with fields to update
     * @return updated authorization detail DTO
     */
    AuthorizationDetailDTO updateAuthorization(UUID id, UpdateAuthorizationDTO dto);
}

