import { apiClient } from "../apiClient";
import type { DailyNoteDTO, DailyNotesPage } from "@/types/dailyNote";

/**
 * Daily Note API client
 */

export const dailyNoteApi = {
  /**
   * Get all daily notes with pagination
   */
  async getDailyNotes(
    page: number = 0,
    size: number = 20
  ): Promise<DailyNotesPage> {
    const response = await apiClient<DailyNotesPage>(
      `/daily-notes?page=${page}&size=${size}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch daily notes");
    }
    return response.data;
  },

  /**
   * Get daily note by ID
   */
  async getDailyNoteById(id: string): Promise<DailyNoteDTO> {
    const response = await apiClient<DailyNoteDTO>(`/daily-notes/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch daily note");
    }
    return response.data;
  },

  /**
   * Get daily notes by patient ID (via service delivery)
   * Since backend doesn't have a direct endpoint, we'll fetch all and filter
   * In a production app, you'd want a dedicated endpoint
   */
  async getDailyNotesByPatient(
    patientId: string,
    page: number = 0,
    size: number = 20
  ): Promise<DailyNotesPage> {
    // For now, we'll get all notes and filter on frontend
    // TODO: Add backend endpoint /api/daily-notes/patient/{patientId}
    const response = await apiClient<DailyNotesPage>(
      `/daily-notes?page=${page}&size=${size}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch daily notes");
    }
    
    // Filter by patient ID
    const filteredContent = response.data.content.filter(
      (note: DailyNoteDTO) => note.patientId === patientId
    );
    
    return {
      ...response.data,
      content: filteredContent,
      totalElements: filteredContent.length,
      totalPages: Math.ceil(filteredContent.length / size),
    };
  },
};
