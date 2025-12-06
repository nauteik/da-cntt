/**
 * Authorization related types
 */

export enum AuthorizationStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
}

export interface AuthorizationSearchRequest {
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  payerId?: string;
  supervisorId?: string;
  programId?: string;
  serviceTypeId?: string;
  authorizationNo?: string;
  clientId?: string;
  clientFirstName?: string;
  clientLastName?: string;
  status?: AuthorizationStatus | string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface AuthorizationSearchResult {
  authorizationId: string;
  authorizationNo: string;
  clientId: string;
  clientFirstName: string;
  clientLastName: string;
  clientName: string;
  payerName: string;
  payerIdentifier: string;
  supervisorName: string;
  programIdentifier: string;
  serviceCode: string;
  serviceName: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  maxUnits: number;
  totalUsed: number;
  totalRemaining: number;
  format: string;
  status: AuthorizationStatus;
}

export interface PaginatedAuthorizations {
  content: AuthorizationSearchResult[];
  page: {
    size: number;
    number: number; // Current page number (0-indexed)
    totalElements: number;
    totalPages: number;
  };
}

/**
 * Authorization detail DTO for view/edit page
 */
export interface AuthorizationDetailDTO {
  authorizationId: string;
  authorizationNo: string;
  clientId: string;
  clientName: string;
  patientId: string; // Important: needed to fetch patient services
  payerIdentifier: string;
  format: string; // Authorization Type (e.g., "Unit")
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  maxUnits: number;
  comments?: string;
}

/**
 * Patient Service for display in Service Limitations section
 */
export interface PatientServiceDTO {
  id: string;
  serviceCode: string;
  serviceName: string;
  startDate: string;
  endDate?: string;
  totalUnits?: number;
}

/**
 * Form data for updating authorization
 */
export interface UpdateAuthorizationFormData {
  authorizationNo: string;
  format: string;
  startDate: string; // Format: YYYY-MM-DD for DatePicker
  endDate?: string;
  maxUnits: number;
  comments?: string;
}

