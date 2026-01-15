package com.example.backend.model.dto.report;

/**
 * Projection interface for Active Client Contacts report query results
 */
public interface ActiveClientContactProjection {
    String getAccountName();
    String getClientName();
    String getClientMedicaidId();
    String getContactName();
    String getRelationshipToClient();
    String getEmail();
}
