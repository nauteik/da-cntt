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
  page: {
    size: number;
    number: number; // Current page number (0-indexed)
    totalElements: number;
    totalPages: number;
  };
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
  search?: string;
  status?: PatientStatus[];
}

// Patient Detail Types
export interface ContactDTO {
  id: string;
  relation: string;
  name: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface AddressDTO {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  county: string;
  phone: string;
  isMain: boolean;
}

export interface PatientHeaderDTO {
  id: string;
  clientName: string;
  clientId: string;
  medicaidId: string;
  mainAddress: string;
  phoneNo: string;
  mainEmergencyContact: string;
  programName: string;
  status: PatientStatus;
}

export interface PatientPersonalDTO {
  id: string;
  medicaidId: string;
  clientId: string;
  agencyId: string;
  ssn: string;
  firstName: string;
  lastName: string;
  dob: string; // ISO date string
  gender: string;
  primaryLanguage: string;
  medicalProfile: Record<string, unknown>;
  contacts: ContactDTO[];
  addresses: AddressDTO[];
}
