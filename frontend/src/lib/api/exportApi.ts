/**
 * Export API service - Centralized export functions for all entity types
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL + "/api";

/**
 * Helper to build query string from filters
 */
function buildQueryString(filters: Record<string, string | string[] | number | boolean | undefined | null>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => params.append(key, item.toString()));
      } else {
        params.append(key, value.toString());
      }
    }
  });
  
  return params.toString();
}

/**
 * Helper to download blob as file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export API service
 */
export const exportApi = {
  /**
   * Export Patients to Excel
   */
  exportPatients: async (filters: {
    search?: string;
    status?: string[];
    program?: string[];
    services?: string[];
  }): Promise<void> => {
    const queryString = buildQueryString(filters);
    const endpoint = `/reports/patients/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export patients');
    }
    
    const blob = await response.blob();
    const filename = `Patients_${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  },

  /**
   * Export Houses to Excel
   */
  exportHouses: async (filters: {
    officeId?: string;
    search?: string;
  }): Promise<void> => {
    const queryString = buildQueryString(filters);
    const endpoint = `/reports/houses/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export houses');
    }
    
    const blob = await response.blob();
    const filename = `Houses_${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  },

  /**
   * Export Schedule Events to Excel
   */
  exportScheduleEvents: async (filters: {
    from: string;
    to: string;
    patientId?: string;
    staffId?: string;
    status?: string;
    search?: string;
  }): Promise<void> => {
    const queryString = buildQueryString(filters);
    const endpoint = `/reports/schedules/export?${queryString}`;
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export schedule events');
    }
    
    const blob = await response.blob();
    const filename = `ScheduleEvents_${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  },

  /**
   * Export Staff to Excel
   */
  exportStaff: async (filters: {
    search?: string;
    status?: string[];
    role?: string[];
  }): Promise<void> => {
    const queryString = buildQueryString(filters);
    const endpoint = `/reports/staff/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export staff');
    }
    
    const blob = await response.blob();
    const filename = `Staff_${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  },

  /**
   * Export Authorizations to Excel
   */
  exportAuthorizations: async (filters: {
    startDate?: string;
    endDate?: string;
    payerId?: string;
    supervisorId?: string;
    programId?: string;
    serviceTypeId?: string;
    authorizationNo?: string;
    clientId?: string;
    clientFirstName?: string;
    clientLastName?: string;
    status?: string;
  }): Promise<void> => {
    const queryString = buildQueryString(filters);
    const endpoint = `/reports/authorizations/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export authorizations');
    }
    
    const blob = await response.blob();
    const filename = `Authorizations_${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  },

  /**
   * Export Visit Maintenance to Excel
   */
  exportVisits: async (filters: {
    startDate?: string;
    endDate?: string;
    clientId?: string;
    employeeId?: string;
    officeId?: string;
    status?: string;
    search?: string;
    cancelled?: boolean;
  }): Promise<void> => {
    const queryString = buildQueryString(filters);
    const endpoint = `/reports/visits/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export visits');
    }
    
    const blob = await response.blob();
    const filename = `VisitMaintenance_${new Date().toISOString().split('T')[0]}.xlsx`;
    downloadBlob(blob, filename);
  },
};
