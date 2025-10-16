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

export enum AddressType {
  HOME = "HOME",
  COMMUNITY = "COMMUNITY",
  SENIOR = "SENIOR",
  BUSINESS = "BUSINESS",
}

export interface AddressDTO {
  id: string;
  label?: string;
  type?: AddressType;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  county: string;
  phone: string;
  email?: string;
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

// Patient Program Types
// Backend-aligned Program Tab DTOs
export interface ProgramDetailDTO {
  programIdentifier?: string;
  supervisorName?: string;
  enrollmentDate?: string;
  eocDate?: string;
  createdAt?: string;
  statusEffectiveDate?: string;
  socDate?: string;
  eligibilityBeginDate?: string;
  eligibilityEndDate?: string;
  reasonForChange?: Record<string, unknown> | null;
}

export interface PayerDetailDTO {
  payerName?: string;
  payerIdentifier?: string;
  rank?: number;
  clientPayerId?: string;
  startDate?: string;
  groupNo?: string;
  endDate?: string;
  medicaidId?: string;
}

export interface ServiceDetailDTO {
  serviceName?: string;
  serviceCode?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuthorizationDTO {
  payerIdentifier?: string;
  serviceCode?: string;
  authorizationNo?: string;
  eventCode?: string;
  modifiers?: Record<string, unknown> | null;
  format?: string;
  startDate?: string;
  endDate?: string;
  comments?: string;
  maxUnits?: number;
  totalUsed?: number;
  totalMissed?: number;
  totalRemaining?: number;
  meta?: Record<string, unknown> | null;
}

export interface PatientProgramDTO {
  program: ProgramDetailDTO[];
  payer: PayerDetailDTO[];
  services: ServiceDetailDTO[];
  authorizations: AuthorizationDTO[];
}

// Select DTOs for form dropdowns
export interface StaffSelectDTO {
  id: string;
  displayName: string; // Format: "fullName (employeeCode) - officeName"
}

export interface ProgramSelectDTO {
  id: string;
  programIdentifier: string;
}