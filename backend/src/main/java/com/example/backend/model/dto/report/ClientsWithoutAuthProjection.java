package com.example.backend.model.dto.report;

/**
 * Projection interface for Clients Without Authorizations report query results
 */
public interface ClientsWithoutAuthProjection {
    String getClientName();
    String getClientType();
    String getMedicaidId();
    String getAlternatePayer();
    String getPayer();
    String getProgram();
    String getService();
    String getSupervisor();
}

