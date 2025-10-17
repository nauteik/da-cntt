package com.example.backend.service;

import com.example.backend.model.dto.PayerSelectDTO;

import java.util.List;

/**
 * Service interface for payer operations
 */
public interface PayerService {
    
    /**
     * Get all active payers for select dropdown
     * @return list of active payers
     */
    List<PayerSelectDTO> getPayersForSelect();
}

