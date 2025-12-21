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
  dailyNoteId?: string; // Daily Note ID if exists
}

export class ScheduleService {
  /**
   * Format patient name from "Last Name, First Name" to "First Name Last Name"
   */
  private static formatPatientName(name: string): string {
    if (!name) return '';
    
    // Check if name is in "Last Name, First Name" format
    if (name.includes(',')) {
      const parts = name.split(',').map(part => part.trim());
      if (parts.length === 2) {
        const [lastName, firstName] = parts;
        return `${firstName} ${lastName}`;
      }
    }
    
    // If not in that format, return as is
    return name;
  }

  /**
   * Format time from ISO datetime string to HH:mm format
   * Extracts time portion without timezone conversion
   * @param isoDateTime - ISO datetime string (e.g., "2024-12-11T02:00:00")
   * @returns Formatted time string (e.g., "02:00")
   */
  private static formatTime(isoDateTime: string): string {
    if (!isoDateTime) return '';
    
    try {
      // Extract time portion from ISO string (format: YYYY-MM-DDTHH:mm:ss)
      // This avoids timezone conversion issues
      const timePart = isoDateTime.split('T')[1];
      if (timePart) {
        // Get HH:mm from HH:mm:ss
        const [hours, minutes] = timePart.split(':');
        return `${hours}:${minutes}`;
      }
      
      // Fallback: try parsing as Date if format is different
      const date = new Date(isoDateTime);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('[ScheduleService] Error formatting time:', error);
      return isoDateTime;
    }
  }

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
        throw new Error(response.error || 'Failed to fetch schedule events');
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
          name: this.formatPatientName(event.patientName), // Format from "Last, First" to "First Last"
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
        dailyNoteId: event.dailyNoteId, // Daily Note ID if completed
        startTime: this.formatTime(event.startAt), // Format without timezone conversion
        endTime: this.formatTime(event.endAt), // Format without timezone conversion
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
          name: this.formatPatientName(event.patientName), // Format from "Last, First" to "First Last"
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
        startTime: this.formatTime(event.startAt), // Format without timezone conversion
        endTime: this.formatTime(event.endAt), // Format without timezone conversion
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

  /**
   * Get schedule events for a specific patient
   * @param patientId - Patient UUID
   * @param from - Start date (YYYY-MM-DD)
   * @param to - End date (YYYY-MM-DD)
   * @param status - Filter by status (optional)
   */
  static async getPatientScheduleEvents(
    patientId: string,
    from: string,
    to: string,
    status?: string
  ): Promise<Schedule[]> {
    try {
      let url = `/patients/${patientId}/schedule/events?from=${from}&to=${to}`;
      if (status) {
        url += `&status=${status}`;
      }

      console.log('[ScheduleService] Fetching patient schedule:', url);
      
      const response = await apiClient.get<any>(url);
      
      if (!response.success || !response.data) {
        console.error('[ScheduleService] Failed to load patient schedule:', response);
        return [];
      }

      // Backend returns: { success: true, data: [...], message: "..." }
      // apiClient wraps it: { success: true, data: <backend response> }
      // So we need: response.data.data
      const backendResponse = response.data;
      const events: ScheduleEventResponse[] = backendResponse.data || [];
      
      console.log('[ScheduleService] Found', events.length, 'schedule events for patient');
      
      return events.map((event) => ({
        id: event.id,
        patientId: event.patientId,
        patient: {
          id: event.patientId,
          name: this.formatPatientName(event.patientName), // Format from "Last, First" to "First Last"
          clientId: event.patientClientId,
        } as any,
        employeeId: event.employeeId,
        employeeName: event.employeeName,
        date: event.eventDate,
        startTime: this.formatTime(event.startAt), // Format without timezone conversion
        endTime: this.formatTime(event.endAt), // Format without timezone conversion
        status: event.status as Schedule['status'],
        location: 'Patient Home',
        serviceType: event.serviceCode || 'Unknown',
        authorizationId: event.authorizationId,
        serviceDeliveryId: event.serviceDeliveryId,
        serviceDeliveryStatus: event.serviceDeliveryStatus,
        checkInTime: event.checkInTime,
        checkOutTime: event.checkOutTime,
      }));
    } catch (error) {
      console.error('[ScheduleService] Error fetching patient schedule:', error);
      throw error;
    }
  }
}

export default ScheduleService;