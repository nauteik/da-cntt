// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
  email?: string; // Support email field for backend
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfoResponse {
  userId: string;
  displayName: string;
  email: string;
  roles: string[];
  expiresAt: string;
  mfaEnabled: boolean;
  officeId: string | null;
  token: string;
}

export interface User {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  role: string;
  phone: string;
  token?: string;
  officeId?: string | null;
}

// Patient and Schedule Types
export interface Patient {
  id: string;
  name: string;
  patientId: string;
  address: string;
  phone?: string;
  dateOfBirth?: string;
  medicalHistory?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Schedule {
  id: string;
  patientId: string;
  patient: Patient;
  employeeId: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'upcoming' | 'completed' | 'in-progress' | 'cancelled';
  notes?: string;
  location: string;
  serviceType: string;
}

// Daily Care Note Types
export interface MealEntry {
  time: string;
  whatHad: string;
  whatOffered: string;
}

// Location and Check-in Types
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: string;
}

export interface CheckInData {
  timestamp: string;
  location: LocationData;
  type: 'check_in';
  scheduleId?: string;
  patientId?: string;
}

export interface CheckOutData {
  checkInTime: string;
  checkOutTime: string;
  checkInLocation: LocationData;
  checkOutLocation: LocationData;
  totalHours: number;
  additionalNotes?: string;
  careCompleted: boolean;
}

// Cancel Schedule Types
export interface CancelScheduleData {
  scheduleId: string;
  category: string;
  reason: string;
  timestamp: string;
  cancelledBy: string;
}

export interface CancelCategory {
  id: string;
  label: string;
  icon: string;
}

// ============= Unscheduled Visit Types =============
/**
 * Request to create an unscheduled/emergency visit
 * No approval needed - creates schedule immediately
 */
export interface UnscheduledVisitRequest {
  patientId: string; // Patient's medical record ID (required)
  patientName?: string; // Optional - can be auto-filled by backend
  location: string; // Visit address
  reason?: string; // Reason for unscheduled visit
  requestedBy: string; // Staff ID creating the visit
  requestedAt?: string; // ISO timestamp
}

/**
 * Unscheduled visit entity (created schedule)
 * Can be checked-in/out immediately like regular schedules
 */
export interface UnscheduledVisit {
  id: string;
  patientId: string;
  patientName?: string;
  location: string;
  reason?: string;
  createdBy: string; // Staff who created it
  createdAt: string;
  updatedAt: string;
  // Schedule-related fields
  scheduleId?: string; // Associated schedule for check-in/out
  status: 'active' | 'completed' | 'cancelled';
  // Progress tracking
  checkedIn?: boolean;
  checkInTime?: string;
  checkedOut?: boolean;
  checkOutTime?: string;
  dailyNoteCompleted?: boolean;
  dailyNoteId?: string;
}

export interface DailyNoteForm {
  id?: string;
  employeeName: string;
  employeeId: string;
  patientName: string;
  patientId: string;
  careLocation: string;
  checkInTime: string;
  checkOutTime: string;
  careContent: string;
  breakfast: MealEntry;
  lunch: MealEntry;
  dinner: MealEntry;
  employeeSignature: string;
  patientSignature: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Navigation Types
export interface TabParamList {
  Schedule: undefined;
  DailyNote: { patientId?: string };
  Settings: undefined;
}

export interface RootStackParamList {
  Login: undefined;
  Tabs: undefined;
  PatientDetails: { patientId: string };
  EditProfile: undefined;
}

// Settings Types
export interface AppSettings {
  notifications: boolean;
  autoSync: boolean;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
}