package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for payer select dropdown
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayerSelectDTO {

    private UUID id;

    private String payerIdentifier;

    private String payerName;
}

