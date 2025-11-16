/**
 * Service Delivery Types
 */

export type ServiceDeliveryStatus = "in_progress" | "completed" | "cancelled";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ServiceDeliveryDTO {
  id: string;
  
  // Related entities
  scheduleEventId: string;
  authorizationId?: string;
  officeId: string;
  officeName: string;
  patientId: string;
  patientName: string;
  staffId: string;
  staffName: string;

  // Service delivery info
  startAt: string;
  endAt: string;
  units?: number;
  status: ServiceDeliveryStatus;
  approvalStatus: ApprovalStatus;
  totalHours?: number;

  // Check-in/check-out summary
  checkInTime?: string;
  checkOutTime?: string;
  isCheckInCheckOutCompleted?: boolean;
  isCheckInCheckOutFullyValid?: boolean;

  // Cancel information
  cancelled?: boolean;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledByStaffId?: string;
  cancelledByStaffName?: string;

  // Unscheduled visit (staff replacement) information
  isUnscheduled?: boolean;
  actualStaffId?: string;
  actualStaffName?: string;
  scheduledStaffId?: string;
  scheduledStaffName?: string;
  unscheduledReason?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ServiceDeliveryFilters {
  staffId?: string;
  patientId?: string;
  officeId?: string;
  status?: ServiceDeliveryStatus;
  approvalStatus?: ApprovalStatus;
  startDate?: string;
  endDate?: string;
}
