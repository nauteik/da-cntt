package com.example.backend.model.dto.report;

/**
 * Projection interface for Payer-Program-Service Listing report query results
 */
public interface PayerProgramServiceListingProjection {
    String getPayerName();
    String getProgramName();
    String getServiceCode();
    String getServiceName();
}
