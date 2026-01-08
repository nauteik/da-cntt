/**
 * Daily Note types
 * Maps to backend DailyNoteResponseDTO
 */

export interface MealInfo {
  // Frontend format (from mobile app)
  meal?: string;
  time?: string;
  offered?: string;
  ate?: string;
  notes?: string;
  
  // Backend format (from database)
  mealType?: string;
  whatOffered?: string;
  whatHad?: string;
}

export interface DailyNoteDTO {
  id: string;
  serviceDeliveryId: string;
  patientId: string;
  patientName: string;
  staffId: string;
  staffName: string;
  content: string;
  mealInfo: MealInfo[]; // MealInfo array from backend
  checkInTime?: string; // ISO datetime string
  checkOutTime?: string; // ISO datetime string
  patientSignature?: string; // base64 image
  staffSignature?: string; // base64 image
  createdAt?: string; // ISO datetime string
  updatedAt?: string; // ISO datetime string
  cancelled?: boolean;
  cancelReason?: string;
}

export interface DailyNotesPage {
  content: DailyNoteDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Current page (0-indexed)
}

export interface DailyNoteFilters {
  patientId?: string;
  staffId?: string;
  startDate?: string;
  endDate?: string;
}
