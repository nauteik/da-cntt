/**
 * House Type Definitions
 * Matches backend DTOs for House management
 */

// House DTO
export interface HouseDTO {
  id: string; // UUID
  officeId: string;
  officeName: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  // Address information
  addressId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  fullAddress?: string | null;
  // Current patient information
  currentPatientId?: string | null;
  currentPatientName?: string | null;
  currentStayId?: string | null;
}

// Paginated Houses
export interface PaginatedHouses {
  content: HouseDTO[];
  page: {
    size: number;
    number: number; // Current page number (0-indexed)
    totalElements: number;
    totalPages: number;
  };
}

// House Create Request
export interface HouseCreateRequest {
  officeId: string;
  code: string;
  name: string;
  addressId?: string;
  description?: string;
}

// House Update Request
export interface HouseUpdateRequest {
  code?: string;
  name?: string;
  addressId?: string;
  description?: string;
  isActive?: boolean;
}

// Assign Patient Request
export interface AssignPatientRequest {
  patientId: string;
  moveInDate: string; // ISO date string
}

// Unassign Patient Request
export interface UnassignPatientRequest {
  moveOutDate: string; // ISO date string
}

// Patient House Stay DTO
export interface PatientHouseStayDTO {
  id: string;
  patientId: string;
  patientName: string;
  houseId: string;
  houseName: string;
  houseCode: string;
  moveInDate: string; // ISO date string
  moveOutDate?: string | null; // ISO date string
  isActive: boolean;
}

// House Search Params
export interface HouseSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  officeId?: string;
  search?: string;
}





