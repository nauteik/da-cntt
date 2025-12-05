/**
 * Schedule related types
 * Maps to backend ScheduleTemplate, TemplateEvent, and ScheduleEvent entities
 */

export interface TemplateEventDTO {
  id: string;
  templateWeekId?: string;
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayOfWeek: number;
  // Backwards compatibility with existing UI calendar (0=Sun..6=Sat). Optional.
  weekday?: number;
  startTime: string; // HH:mm[:ss]
  endTime: string; // HH:mm[:ss]
  authorizationId?: string;
  eventCode?: string;
  plannedUnits?: number;
  serviceCode?: string; // For display
  serviceName?: string; // For display
  staffId?: string;
  staffName?: string;
  comment?: string;
  billType?: string; // from Authorization.format
}

// Authorization select (service) options for Add Event form
export interface AuthorizationSelectDTO {
  id: string;
  serviceCode?: string;
  serviceName?: string;
  eventCode?: string;
  billType?: string;
}

export interface ScheduleTemplateDTO {
  id: string;
  patientId: string;
  officeId?: string;
  name: string;
  description?: string;
  status: string; // "active" | "inactive"
  createdAt?: string; // ISO datetime string
  updatedAt?: string; // ISO datetime string
  generatedThrough?: string; // ISO datetime string - last generated date
}

export interface CreateScheduleTemplateDTO {
  name?: string;
  description?: string;
}

export interface ScheduleEventDTO {
  id: string;
  patientId: string;
  patientName?: string; // For display in staff context
  patientClientId?: string; // For display in staff context
  eventDate: string; // ISO date string
  startAt: string; // ISO datetime string
  endAt: string; // ISO datetime string
  authorizationId?: string;
  eventCode?: string;
  status: ScheduleEventStatus;
  plannedUnits: number;
  actualUnits?: number;
  // For display purposes
  programIdentifier?: string;
  employeeId?: string;
  employeeName?: string;
  supervisorId?: string;
  supervisorName?: string;
  serviceCode?: string;
  checkInTime?: string; // ISO datetime string
  checkOutTime?: string; // ISO datetime string
  // Additional fields for Edit form
  actualStartAt?: string; // ISO datetime string - read-only in form
  actualEndAt?: string; // ISO datetime string - read-only in form
  comments?: string;
}

export enum ScheduleEventStatus {
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
  activeSchedulePopulation?: boolean;
}

export interface GenerateScheduleFormData {
  endDate: string; // ISO date string
}

export interface WeekWithEventsDTO {
  weekIndex: number;
  events: TemplateEventDTO[];
}

export interface ScheduleTemplateWeeksDTO {
  template: ScheduleTemplateDTO;
  weeks: WeekWithEventsDTO[];
}

// New types for schedule creation and preview

export interface CreateScheduleEventDTO {
  patientId: string;
  eventDate: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  authorizationId: string;
  staffId?: string; // Optional
  eventCode?: string;
  status: string; // PLANNED, CONFIRMED, etc.
  plannedUnits: number;
  comments?: string;
}

export interface RepeatConfigDTO {
  interval: number; // e.g., 1, 2, 3
  frequency: "WEEK" | "MONTH";
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday (for weekly repeat)
  endDate?: string; // ISO date string - repeat until this date
  occurrences?: number; // Or repeat for X occurrences
}

export interface CreateSchedulePreviewRequestDTO {
  scheduleEvent: CreateScheduleEventDTO;
  repeatConfig?: RepeatConfigDTO; // Optional - if null, create single event
}

export interface ScheduleConflictDTO {
  conflictType: "PATIENT_CONFLICT" | "STAFF_CONFLICT";
  conflictingEventId: string;
  eventDate: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  message: string; // Human-readable conflict description
  conflictingWithName?: string; // Name of conflicting patient/staff
  resolved: boolean; // Whether the conflict has been resolved
}

export interface CreateSchedulePreviewResponseDTO {
  scheduleEvents: ScheduleEventDTO[];
  conflicts: ScheduleConflictDTO[];
  canSave: boolean; // True if no conflicts or all conflicts resolved
  message: string; // Summary message about the preview
}

export interface CreateScheduleBatchRequestDTO {
  scheduleEvents: CreateScheduleEventDTO[];
}

export interface PaginatedScheduleEvents {
  content: ScheduleEventDTO[];
  page: {
    size: number;
    number: number; // Current page number (0-indexed)
    totalElements: number;
    totalPages: number;
  };
}

export interface ScheduleQueryParams {
  from: string; // ISO date string
  to: string; // ISO date string
  patientId?: string;
  staffId?: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface UpdateScheduleEventDTO {
  authorizationId?: string;
  eventDate?: string; // ISO date string (YYYY-MM-DD)
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  staffId?: string;
  eventCode?: string;
  status: string; // Required
  plannedUnits?: number;
  // Actual times and units are read-only in form, but included for completeness
  actualUnits?: number;
  actualStartAt?: string; // ISO datetime string - should not be updated via Edit form
  actualEndAt?: string; // ISO datetime string - should not be updated via Edit form
  comments?: string;
}

