package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Active Client Contacts report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveClientContactDTO {
    
    private String accountName;
    private String clientName;
    private String clientMedicaidId;
    private String contactName;
    private String relationshipToClient;
    private String email;
}
