/**
 * Visit Maintenance Types
 * Types for the Visit Maintenance feature (Service Delivery verification view)
 */

export enum VisitStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
  VERIFIED = 'VERIFIED',
  CANCELLED = 'CANCELLED',
}

export interface VisitMaintenanceDTO {
  // IDs
  serviceDeliveryId: string;
  scheduleEventId: string;
  clientId: string;
  employeeId: string;

  // Client Information
  clientName: string;
  clientMedicaidId?: string;

  // Employee Information
  employeeName: string;
  employeeCode?: string;

  // Service Information
  serviceName: string;
  serviceCode?: string;

  // Schedule Times
  visitDate: string; // Format: MM/dd/yyyy
  scheduledTimeIn: string; // Format: hh:mm a
  scheduledTimeOut: string; // Format: hh:mm a
  scheduledHours: number;

  // Actual Times (Clock In/Out)
  callIn: string | null; // Format: hh:mm a
  callOut: string | null; // Format: hh:mm a
  callHours: number | null;

  // Adjusted Times (Manual corrections)
  adjustedIn: string | null; // Format: hh:mm a
  adjustedOut: string | null; // Format: hh:mm a
  adjustedHours: number | null;

  // Billing Information
  payHours: number; // Hours to pay employee
  billHours: number; // Hours to bill to payer
  units: number; // Converted to 15-min units
  doNotBill: boolean; // Cancel flag

  // Status
  visitStatus: VisitStatus;
  visitStatusDisplay: string;

  // Additional Info
  notes?: string;
  isUnscheduled: boolean;
  unscheduledReason?: string;
  authorizationNumber?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface VisitMaintenanceQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string; // Format: YYYY-MM-DD
  clientId?: string;
  employeeId?: string;
  officeId?: string;
  status?: VisitStatus;
  search?: string;
  cancelled?: boolean;
}

export interface VisitMaintenanceResponse {
  content: VisitMaintenanceDTO[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
