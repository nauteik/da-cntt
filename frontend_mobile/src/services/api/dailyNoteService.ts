import { ApiResponse, DailyNoteForm, PaginatedResponse } from '../../types';
import { apiClient } from './apiClient';

export class DailyNoteService {
  /**
   * Create a new daily care note
   */
  static async createDailyNote(note: Omit<DailyNoteForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<DailyNoteForm>> {
    try {
      // Mock implementation for demo
      const newNote: DailyNoteForm = {
        ...note,
        id: `note_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        data: newNote,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to save daily note',
      };
    }

    // Production implementation:
    // return apiClient.post<DailyNoteForm>('/daily-notes', note);
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