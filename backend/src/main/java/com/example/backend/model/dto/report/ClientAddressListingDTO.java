package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Client Address Listing report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientAddressListingDTO {
    
    private String accountId;
    private String accountName;
    private String clientMedicaidId;
    private String clientName;
    private String tag;
    private String addressType;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zip;
    private String county;
}
