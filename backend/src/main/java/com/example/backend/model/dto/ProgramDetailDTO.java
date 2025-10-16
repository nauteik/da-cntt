package com.example.backend.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
public class ProgramDetailDTO {

    private String programIdentifier;

    private String supervisorName;

    private LocalDate enrollmentDate;

    private LocalDate eocDate;

    private LocalDateTime createdAt;

    private LocalDate statusEffectiveDate;

    private LocalDate socDate;

    private LocalDate eligibilityBeginDate;

    private LocalDate eligibilityEndDate;

    private Map<String, Object> reasonForChange;
}


