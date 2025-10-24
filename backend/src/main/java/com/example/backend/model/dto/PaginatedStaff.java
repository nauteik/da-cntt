package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Paginated staff response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedStaff {
    
    private List<StaffSummaryDTO> content;
    
    private PageInfo page;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageInfo {
        private int size;
        private int number; // Current page number (0-indexed)
        private long totalElements;
        private int totalPages;
    }
}
