// API Client
export { apiClient, ApiClient } from './apiClient';

// Services
export { AuthService } from './authService';
export { DailyNoteService } from './dailyNoteService';
export { ScheduleService } from './scheduleService';
export { UnscheduledVisitService } from './unscheduledVisitService';
export { PatientService } from './patientService';

// Re-export for convenience
import { AuthService } from './authService';
import { DailyNoteService } from './dailyNoteService';
import { ScheduleService } from './scheduleService';
import { UnscheduledVisitService } from './unscheduledVisitService';
import { PatientService } from './patientService';

export default {
  auth: AuthService,
  schedule: ScheduleService,
  dailyNote: DailyNoteService,
  unscheduledVisit: UnscheduledVisitService,
  patient: PatientService,
};