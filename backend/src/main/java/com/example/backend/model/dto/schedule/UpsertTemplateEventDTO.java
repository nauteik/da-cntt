package com.example.backend.model.dto.schedule;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;

@Data
@Deprecated
public class UpsertTemplateEventDTO {
    @NotNull
    private Integer weekIndex;

    @NotNull
    @Min(0)
    @Max(6)
    private Short dayOfWeek; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    private UUID authorizationId;

    @Size(max = 32)
    private String eventCode;

    @Min(0)
    @Max(24 * 60)
    private Integer plannedUnits;

    private UUID staffId;

    @Size(max = 2000)
    private String comment;
}


