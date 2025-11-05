package com.example.backend.model.dto.schedule;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class GenerateScheduleRequest {
    @NotNull
    private LocalDate endDate;
}


