package com.example.backend.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class PatientProgramDTO {

    private List<ProgramDetailDTO> program;

    private List<PayerDetailDTO> payer;

    private List<ServiceDetailDTO> services;

    private List<AuthorizationDTO> authorizations;
}


