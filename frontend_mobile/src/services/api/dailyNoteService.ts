import { ApiResponse, DailyNoteForm, PaginatedResponse } from '../../types';
import { apiClient } from './apiClient';

export interface MealEntry {
  mealType?: 'breakfast' | 'lunch' | 'dinner';
  time: string;
  whatHad: string;
  whatOffered: string;
}

export interface DailyNoteRequest {
  serviceDeliveryId: string;
  content: string;
  mealInfo?: MealEntry[];
  patientSignature?: string; // base64 string
  staffSignature?: string; // base64 string
  cancelled?: boolean;
  cancelReason?: string;
}

export interface DailyNoteResponse {
  id: string;
  serviceDeliveryId: string;
  patientId?: string;
  patientName?: string;
  staffId?: string;
  staffName?: string;
  content: string;
  mealInfo: MealEntry[];
  checkInTime?: string;
  checkOutTime?: string;
  patientSignature?: string;
  staffSignature?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class DailyNoteService {
  /**
   * Create a new daily care note (Backend API)
   */
  static async createDailyNote(data: DailyNoteRequest): Promise<ApiResponse<DailyNoteResponse>> {
    try {
      console.log('[DailyNoteService] Creating daily note:', {
        serviceDeliveryId: data.serviceDeliveryId,
        contentLength: data.content.length,
        mealCount: data.mealInfo?.length || 0,
        hasPatientSig: !!data.patientSignature,
        hasStaffSig: !!data.staffSignature,
      });

      const response = await apiClient.post<any>('/daily-notes', data);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create daily note');
      }

      // Backend returns: { success: true, data: <daily note>, message: "..." }
      const backendResponse = response.data;
      const dailyNote = backendResponse.data || backendResponse;

      console.log('[DailyNoteService] Daily note created:', dailyNote.id);

      return {
        success: true,
        data: dailyNote,
      };
    } catch (error) {
      console.error('[DailyNoteService] Error creating daily note:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create daily note',
      };
    }
  }

  /**
   * Update an existing daily care note
   */
  static async updateDailyNote(
    id: string,
    note: Partial<DailyNoteForm>
  ): Promise<ApiResponse<DailyNoteForm>> {
    return apiClient.put<DailyNoteForm>(`/daily-notes/${id}`, note);
  }

  /**
   * Get daily note by ID
   */
  static async getDailyNoteById(id: string): Promise<ApiResponse<DailyNoteForm>> {
    return apiClient.get<DailyNoteForm>(`/daily-notes/${id}`);
  }

  /**
   * Get daily notes for a specific date
   */
  static async getDailyNotesByDate(date: string): Promise<ApiResponse<DailyNoteForm[]>> {
    return apiClient.get<DailyNoteForm[]>(`/daily-notes?date=${date}`);
  }

  /**
   * Get daily notes for a specific patient
   */
  static async getDailyNotesByPatient(
    patientId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<DailyNoteForm>>> {
    return apiClient.get<PaginatedResponse<DailyNoteForm>>(
      `/daily-notes?patientId=${patientId}&page=${page}&limit=${limit}`
    );
  }

  /**
   * Get daily notes for current user
   */
  static async getMyDailyNotes(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<DailyNoteForm>>> {
    return apiClient.get<PaginatedResponse<DailyNoteForm>>(
      `/daily-notes/my?page=${page}&limit=${limit}`
    );
  }

  /**
   * Delete a daily note
   */
  static async deleteDailyNote(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/daily-notes/${id}`);
  }

  /**
   * Search daily notes
   */
  static async searchDailyNotes(
    query: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      patientId?: string;
      employeeId?: string;
    }
  ): Promise<ApiResponse<DailyNoteForm[]>> {
    const searchParams = new URLSearchParams({
      q: query,
      ...filters,
    });

    return apiClient.get<DailyNoteForm[]>(`/daily-notes/search?${searchParams}`);
  }

  /**
   * Export daily notes to PDF
   */
  static async exportDailyNotesToPDF(
    filters: {
      startDate: string;
      endDate: string;
      patientId?: string;
      employeeId?: string;
    }
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.post<{ downloadUrl: string }>('/daily-notes/export/pdf', filters);
  }
}

export default DailyNoteService;