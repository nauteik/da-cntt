/**
 * Service Delivery Types
 */

/**
 * Task Status for tracking shift progress based on check-in/check-out events
 * - NOT_STARTED: Shift scheduled but check-in not yet done
 * - IN_PROGRESS: Check-in done, check-out not yet done (shift ongoing)
 * - COMPLETED: Both check-in and check-out done (shift finished)
 * - INCOMPLETE: Check-in done but check-out missed (time has passed)
 */
export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
}

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
  taskStatus: TaskStatus; // New enum-based status
  status: ServiceDeliveryStatus; // Legacy string status for backward compatibility
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
