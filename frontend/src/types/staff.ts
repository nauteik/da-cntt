/**
 * Staff/Employee related types
 * Maps to backend StaffSummaryDTO and related entities
 */

export enum StaffStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface StaffSummary {
  id: string;
  name: string;
  status: StaffStatus;
  employeeId: string;
  position: string;
  hireDate: string; // ISO date string
  releaseDate: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface PaginatedStaff {
  content: StaffSummary[];
  page: {
    size: number;
    number: number; // Current page number (0-indexed)
    totalElements: number;
    totalPages: number;
  };
}

export interface StaffFilters {
  status?: StaffStatus;
  position?: string;
  search?: string;
}

export interface StaffQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
  status?: StaffStatus[];
}
