/**
 * Schedule related types
 * Maps to backend ScheduleTemplate, TemplateEvent, and ScheduleEvent entities
 */

export interface TemplateEventDTO {
  id: string;
  weekday: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  authorizationId: string;
  eventCode?: string;
  plannedUnits: number;
  serviceCode?: string; // For display
  serviceName?: string; // For display
}

export interface ScheduleTemplateDTO {
  id: string;
  patientId: string;
  name: string;
  description?: string;
  status: string; // "active" | "inactive"
  generatedThrough?: string; // ISO date string - last generated date
  events: TemplateEventDTO[];
}

export interface ScheduleEventDTO {
  id: string;
  patientId: string;
  eventDate: string; // ISO date string
  startAt: string; // ISO datetime string
  endAt: string; // ISO datetime string
  authorizationId?: string;
  eventCode?: string;
  status: ScheduleEventStatus;
  plannedUnits: number;
  actualUnits?: number;
  // For display purposes
  programName?: string;
  employeeName?: string;
  supervisorName?: string;
  serviceCode?: string;
  checkInTime?: string; // ISO datetime string
  checkOutTime?: string; // ISO datetime string
}

export enum ScheduleEventStatus {
  DRAFT = "DRAFT",
  PLANNED = "PLANNED",
  CONFIRMED = "CONFIRMED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Form data types
export interface AddEventFormData {
  serviceId: string;
  eventCode?: string;
  billType?: string;
  weekdays: number[]; // Array of selected weekdays
  startTime: string;
  endTime: string;
  employeeId?: string;
  comments?: string;
  activeSchedulePopulation: boolean;
}

export interface GenerateScheduleFormData {
  endDate: string; // ISO date string
}

