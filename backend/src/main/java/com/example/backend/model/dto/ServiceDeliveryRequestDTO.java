package com.example.backend.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for creating/updating ServiceDelivery
 */
@Data
public class ServiceDeliveryRequestDTO {

    @NotNull(message = "Schedule event ID is required")
    private UUID scheduleEventId;

    // Optional: Nếu không cung cấp, sẽ lấy từ ScheduleEvent
    private UUID authorizationId;

    // === Unscheduled visit (staff replacement) fields ===
    // Set to true if this is an unscheduled visit where a different staff replaces the scheduled one
    private Boolean isUnscheduled = false;

    // Required for unscheduled visits: the actual staff who performs the service
    private UUID actualStaffId;

    // Required for unscheduled visits: reason for replacement
    private String unscheduledReason;

    // Optional: Nếu không cung cấp, sẽ lấy từ ScheduleEvent
    // Thời gian DỰ KIẾN, sẽ được cập nhật thành thời gian THỰC TẾ sau check-in/check-out
    private LocalDateTime startAt;

    // Optional: Nếu không cung cấp, sẽ lấy từ ScheduleEvent
    // Thời gian DỰ KIẾN, sẽ được cập nhật thành thời gian THỰC TẾ sau check-in/check-out
    private LocalDateTime endAt;

    // Optional: Nếu không cung cấp, sẽ lấy plannedUnits từ ScheduleEvent
    // Units sẽ được TỰ ĐỘNG CẬP NHẬT sau khi check-out dựa trên thời gian thực tế
    // 1 unit = 15 phút
    private Integer units;

    private String status; // in_progress, completed, cancelled

    private String approvalStatus; // pending, approved, rejected

    private String notes;
}
