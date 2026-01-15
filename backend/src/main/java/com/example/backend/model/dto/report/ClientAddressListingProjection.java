package com.example.backend.model.dto.report;

/**
 * Projection interface for Client Address Listing report query results
 */
public interface ClientAddressListingProjection {
    String getAccountId();
    String getAccountName();
    String getClientMedicaidId();
    String getClientName();
    String getTag();
    String getAddressType();
    String getPhone();
    String getAddress();
    String getCity();
    String getState();
    String getZip();
    String getCounty();
}
