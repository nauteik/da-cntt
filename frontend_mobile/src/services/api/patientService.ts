import { apiClient } from './apiClient';

export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  clientId: string;
  medicaidId?: string;
  dateOfBirth?: string;
  status?: string;
}

export interface GetPatientsParams {
  search?: string;
  page?: number;
  size?: number;
  status?: string[];
  program?: string[];
  services?: string[];
}

export interface PatientSearchResponse {
  success: boolean;
  data: {
    content: PatientSummary[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
  message?: string;
}

export class PatientService {
  /**
   * Search patients by name or ID
   */
  static async searchPatients(params: GetPatientsParams): Promise<PatientSummary[]> {
    try {
      let url = `/patients?page=${params.page || 0}&size=${params.size || 20}`;
      
      if (params.search) {
        url += `&search=${encodeURIComponent(params.search)}`;
      }
      
      console.log('[PatientService] Searching patients:', url);
      
      const response = await apiClient.get<any>(url);
      
      if (!response.success || !response.data) {
        console.error('[PatientService] Search failed:', response);
        return [];
      }

      // Backend returns: { success: true, data: { content: [...], totalElements: ... }, message: "..." }
      // apiClient.get() wraps it: { success: true, data: <backend response> }
      // So we need: response.data.data.content
      
      const backendResponse = response.data; // Backend's ApiResponse
      const pageData = backendResponse.data; // Page object
      
      if (!pageData || !pageData.content) {
        console.error('[PatientService] Invalid page structure:', pageData);
        return [];
      }
      
      // Backend returns PatientSummaryDTO with different field names
      const backendPatients = pageData.content;
      
      // Map backend fields to frontend interface
      const patients: PatientSummary[] = backendPatients.map((patient: any) => {
        // Split clientName into firstName and lastName
        const nameParts = (patient.clientName || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        return {
          id: patient.id,
          firstName: firstName,
          lastName: lastName,
          clientId: patient.clientPayerId || patient.id,
          medicaidId: patient.medicaidId,
          dateOfBirth: patient.asOf, // Using asOf date as DOB placeholder
          status: patient.status,
        };
      });
      
      console.log('[PatientService] Found', patients.length, 'patients');
      console.log('[PatientService] Sample patient:', patients[0]);
      return patients;
    } catch (error) {
      console.error('[PatientService] Error searching patients:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   */
  static async getPatientById(patientId: string) {
    try {
      const response = await apiClient.get<any>(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('[PatientService] Error getting patient:', error);
      throw error;
    }
  }
}

export default PatientService;
