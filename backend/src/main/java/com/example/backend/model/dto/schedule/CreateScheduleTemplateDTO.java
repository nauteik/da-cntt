package com.example.backend.model.dto.schedule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateScheduleTemplateDTO {
    
    @NotBlank
    @Size(max = 255)
    private String name = "Master Weekly";
    
    @Size(max = 1000)
    private String description;
}

