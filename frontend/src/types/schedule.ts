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

