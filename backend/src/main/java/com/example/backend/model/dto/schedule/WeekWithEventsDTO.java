package com.example.backend.model.dto.schedule;

import lombok.Data;

import java.util.List;

@Data
public class WeekWithEventsDTO {
    private Integer weekIndex;
    private List<TemplateEventDTO> events;
}

