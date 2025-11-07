package com.example.backend.model.dto.schedule;

import lombok.Data;

import java.util.List;

@Data
public class ScheduleTemplateWeeksDTO {
    private ScheduleTemplateDTO template;
    private List<WeekWithEventsDTO> weeks;
}

