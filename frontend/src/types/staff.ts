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
  role?: string[];
}

export interface StaffHeaderDTO {
  id: string;
  staffName: string;
  employeeId: string;
  phoneNo: string;
  email: string;
  mainEmergencyContact: string;
}

export interface StaffContactDTO {
  id: string;
  relation: string;
  name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  isPrimary: boolean;
}

export interface StaffAddressDTO {
  id: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  county: string;
  phone: string;
  email: string;
  type: string;
  label: string;
  isMain: boolean;
}

export interface StaffPersonalDTO {
  id: string;
  ssn: string;
  status: string;
  effectiveDate: string;
  employeeId: string;
  position: string;
  hireDate: string;
  supervisor: string;
  supervisorId: string;
  officeName: string;
  officeId: string;
  nationalProviderId: string;
  firstName: string;
  lastName: string;
  dob: string;
  primaryLanguage: string;
  gender: string;
  isSupervisor: boolean;
  contacts: StaffContactDTO[];
  addresses: StaffAddressDTO[];
}

// For selects (dropdowns)
export interface StaffSelectDTO {
  id: string;
  displayName: string;
}