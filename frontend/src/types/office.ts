/**
 * Office Type Definitions
 * Matches backend DTOs for Office management
 */

// Office DTO
export interface OfficeDTO {
  id: string; // UUID
  code: string;
  name: string;
  county: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  isActive: boolean;
}

export interface OfficeDetailResponse extends OfficeDTO {
  billingConfig: Record<string, unknown> | null;
  // Address fields
  addressId: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  fullAddress: string | null;
  // Statistics
  totalStaff: number;
  activeStaff: number;
  totalPatients: number;
  activePatients: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface OfficeStaffDTO {
  id: string;
  employeeId: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  role: string | null;
  hireDate: string | null;
  releaseDate: string | null;
  isActive: boolean;
  status: string;
}

export interface OfficePatientDTO {
  id: string;
  patientCode: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  isActive: boolean;
}

export interface OfficeCreateRequest {
  code: string;
  name: string;
  county?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  addressId?: string;
  billingConfig?: Record<string, unknown>;
}

export interface OfficeUpdateRequest {
  name?: string;
  county?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  addressId?: string;
  billingConfig?: Record<string, unknown>;
  isActive?: boolean;
}
