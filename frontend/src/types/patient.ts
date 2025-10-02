/**
 * Patient/Client related types
 * Maps to backend PatientSummaryDTO and related entities
 */

export enum PatientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}

export interface PatientSummary {
  id: string;
  clientName: string;
  status: PatientStatus;
  program: string;
  supervisor: string;
  medicaidId: string;
  clientPayerId: string;
  asOf: string; // ISO date string
  soc: string; // Start of Care - ISO date string
  eoc: string; // End of Care - ISO date string
  services: string[];
}

export interface PaginatedPatients {
  content: PatientSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Current page number (0-indexed)
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PatientFilters {
  status?: PatientStatus;
  program?: string;
  supervisor?: string;
  search?: string;
}

export interface PatientQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}
