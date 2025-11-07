package com.example.backend.model.dto.schedule;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class InsertTemplateEventDTO {
    @NotNull
    private Integer weekIndex;

    @NotEmpty
    private List<@NotNull @Min(0) @Max(6) Short> weekdays; // 0=Sun..6=Sat

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


