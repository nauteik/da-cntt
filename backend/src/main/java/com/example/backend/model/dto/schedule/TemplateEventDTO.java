package com.example.backend.model.dto.schedule;

import lombok.Data;

import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;

@Data
public class TemplateEventDTO {
    private UUID id;
    private UUID templateWeekId;
    private Short dayOfWeek; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    private LocalTime startTime;
    private LocalTime endTime;
    private UUID authorizationId;
    private String serviceCode;
    private String serviceName;
    private String eventCode;
    private Integer plannedUnits;
    private Map<String, Object> meta;
    private UUID staffId;
    private String staffName;
    private String comment;
    private String billType;
}


