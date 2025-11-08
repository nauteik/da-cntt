import { ApiResponse, PaginatedResponse, Schedule } from '../../types';
import { apiClient } from './apiClient';

// Schedule Event Response from Backend (ScheduleEventDTO)
interface ScheduleEventResponse {
  id: string;
  patientId: string;
  patientName: string;
  patientClientId: string;
  eventDate: string;
  startAt: string;
  endAt: string;
  status: string;
  plannedUnits?: number;
  actualUnits?: number;
  programIdentifier?: string;
  employeeId: string;
  employeeName: string;
  supervisorId?: string;
  supervisorName?: string;
  authorizationId?: string; // Required for creating Service Delivery
  serviceDeliveryId?: string; // Current Service Delivery (if exists)
  serviceDeliveryStatus?: string; // Service Delivery status
  serviceCode?: string;
  eventCode?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export class ScheduleService {
  /**
   * Get schedule events for a staff member
   * @param staffId - Staff UUID
   * @param from - Start date (YYYY-MM-DD)
   * @param to - End date (YYYY-MM-DD)
   * @param status - Filter by status (optional)
   * @param page - Page number (0-indexed)
   * @param size - Page size
   */
  static async getStaffScheduleEvents(
    staffId: string,
    from: string,
    to: string,
    status?: string,
    page: number = 0,
    size: number = 20
  ): Promise<Schedule[]> {
    try {
      let url = `/staff/${staffId}/schedule/events?from=${from}&to=${to}&page=${page}&size=${size}`;
      if (status) {
        url += `&status=${status}`;
      }

      console.log('[ScheduleService] Fetching:', url);
      
      const response = await apiClient.get<any>(url);
      
      if (!response.success) {
        console.error('[ScheduleService] Full error response:', JSON.stringify(response, null, 2));
        
        // TEMPORARY: Return mock data for testing UI
        console.warn('[ScheduleService] Using mock data for testing...');
        return this.getMockScheduleEvents(from);
      }

      // Transform backend response to Schedule type
      // Backend returns Page<ScheduleEventDTO> inside data.data
      const pageData = response.data?.data;
      if (!pageData) {
        console.warn('[ScheduleService] No data in response:', response);
        return [];
      }
      
      const events: ScheduleEventResponse[] = pageData.content || [];
      console.log('[ScheduleService] Found', events.length, 'events');
      
      // Debug: Log first event to check authorizationId
      if (events.length > 0) {
        console.log('[ScheduleService] Sample event:', {
          id: events[0].id,
          patientName: events[0].patientName,
          authorizationId: events[0].authorizationId,
          hasAuthorization: !!events[0].authorizationId,
        });
      }
      
      return events.map((event) => ({
        id: event.id,
        patientId: event.patientId,
        patient: {
          id: event.patientId,
          name: event.patientName,
          patientId: event.patientClientId || event.patientId,
          address: 'Address not available', // TODO: Fetch from patient details
          phone: 'Phone not available', // TODO: Fetch from patient details
          dateOfBirth: 'DOB not available', // TODO: Fetch from patient details
        },
        employeeId: event.employeeId,
        employeeName: event.employeeName,
        authorizationId: event.authorizationId, // Required for Service Delivery
        serviceDeliveryId: event.serviceDeliveryId, // Current Service Delivery
        serviceDeliveryStatus: event.serviceDeliveryStatus, // Service Delivery status
        checkInTime: event.checkInTime, // Check-in timestamp from CheckEvent
        checkOutTime: event.checkOutTime, // Check-out timestamp from CheckEvent
        startTime: new Date(event.startAt).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        endTime: new Date(event.endAt).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        date: event.eventDate, // Backend already provides formatted date
        status: this.mapStatusToScheduleStatus(event.status),
        notes: event.serviceCode || event.programIdentifier,
        location: 'Location not available', // TODO: Fetch from patient details
        serviceType: event.serviceCode || 'Home Care',
        // Additional backend fields - not provided in ScheduleEventDTO
        // These would need separate API calls or backend enhancement
      }));
    } catch (error) {
      console.error('Error fetching schedule events:', error);
      throw error;
    }
  }

  /**
   * Get a specific schedule event by patient and event ID
   */
  static async getScheduleEventById(
    patientId: string, 
    eventId: string
  ): Promise<Schedule> {
    try {
      const response = await apiClient.get<any>(
        `/patients/${patientId}/schedule/events/${eventId}`
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch schedule event');
      }

      const event: ScheduleEventResponse = response.data.data;
      
      return {
        id: event.id,
        patientId: event.patientId,
        patient: {
          id: event.patientId,
          name: event.patientName,
          patientId: event.patientClientId || event.patientId,
          address: 'Address not available',
          phone: 'Phone not available',
          dateOfBirth: 'DOB not available',
        },
        employeeId: event.employeeId,
        employeeName: event.employeeName,
        authorizationId: event.authorizationId, // Required for Service Delivery
        serviceDeliveryId: event.serviceDeliveryId, // Current Service Delivery
        serviceDeliveryStatus: event.serviceDeliveryStatus, // Service Delivery status
        checkInTime: event.checkInTime, // Check-in timestamp from CheckEvent
        checkOutTime: event.checkOutTime, // Check-out timestamp from CheckEvent
        startTime: new Date(event.startAt).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        endTime: new Date(event.endAt).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        date: event.eventDate,
        status: this.mapStatusToScheduleStatus(event.status),
        notes: event.serviceCode || event.programIdentifier,
        location: 'Location not available',
        serviceType: event.serviceCode || 'Home Care',
      };
    } catch (error) {
      console.error('Error fetching schedule event:', error);
      throw error;
    }
  }

  /**
   * TEMPORARY: Mock schedule events for testing UI
   */
  private static getMockScheduleEvents(date: string): Schedule[] {
    const today = new Date().toISOString().split('T')[0];
    
    if (date !== today) {
      return []; // Only return mock data for today
    }

    return [
      {
        id: 'mock-event-1',
        patientId: 'mock-patient-1',
        patient: {
          id: 'mock-patient-1',
          name: 'John Doe',
          patientId: 'P001',
          address: '123 Main St, Springfield',
          phone: '(555) 123-4567',
          dateOfBirth: '1950-01-15',
        },
        employeeId: 'mock-staff-1',
        employeeName: 'Jane Smith',
        authorizationId: 'mock-authorization-1', // Mock authorization for testing
        startTime: '09:00',
        endTime: '11:00',
        date: today,
        status: 'upcoming',
        notes: 'Regular home visit',
        location: '123 Main St, Springfield',
        serviceType: 'Home Care',
      },
      {
        id: 'mock-event-2',
        patientId: 'mock-patient-2',
        patient: {
          id: 'mock-patient-2',
          name: 'Mary Johnson',
          patientId: 'P002',
          address: '456 Oak Ave, Springfield',
          phone: '(555) 234-5678',
          dateOfBirth: '1945-06-20',
        },
        employeeId: 'mock-staff-1',
        employeeName: 'Jane Smith',
        authorizationId: 'mock-authorization-2', // Mock authorization for testing
        startTime: '14:00',
        endTime: '16:00',
        date: today,
        status: 'upcoming',
        notes: 'Medication assistance',
        location: '456 Oak Ave, Springfield',
        serviceType: 'Medical Care',
      },
    ];
  }

  /**
   * Map backend status to Schedule status
   */
  private static mapStatusToScheduleStatus(
    backendStatus: string
  ): 'upcoming' | 'in-progress' | 'completed' | 'cancelled' {
    switch (backendStatus?.toUpperCase()) {
      case 'SCHEDULED':
        return 'upcoming';
      case 'IN_PROGRESS':
        return 'in-progress';
      case 'COMPLETED':
        return 'completed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'upcoming';
    }
  }

  /**
   * Get schedules for a specific date (uses staff schedule events)
   */
  static async getSchedulesByDate(
    staffId: string,
    date: string
  ): Promise<ApiResponse<Schedule[]>> {
    try {
      const schedules = await this.getStaffScheduleEvents(
        staffId,
        date,
        date
      );

      return {
        success: true,
        data: schedules,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch schedules',
      };
    }
  }

  /**
   * Get schedules for current user
   */
  static async getMySchedules(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Schedule>>> {
    return apiClient.get<PaginatedResponse<Schedule>>(
      `/schedules/my?page=${page}&limit=${limit}`
    );
  }

  /**
   * Get schedule by ID
   */
  static async getScheduleById(id: string): Promise<ApiResponse<Schedule>> {
    return apiClient.get<Schedule>(`/schedules/${id}`);
  }

  /**
   * Update schedule status
   */
  static async updateScheduleStatus(
    id: string,
    status: Schedule['status']
  ): Promise<ApiResponse<Schedule>> {
    return apiClient.patch<Schedule>(`/schedules/${id}/status`, { status });
  }

  /**
   * Add notes to schedule
   */
  static async addScheduleNotes(
    id: string,
    notes: string
  ): Promise<ApiResponse<Schedule>> {
    return apiClient.patch<Schedule>(`/schedules/${id}/notes`, { notes });
  }

  /**
   * Get schedules by date range
   */
  static async getSchedulesByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<Schedule[]>> {
    return apiClient.get<Schedule[]>(
      `/schedules?startDate=${startDate}&endDate=${endDate}`
    );
  }
}

export default ScheduleService;