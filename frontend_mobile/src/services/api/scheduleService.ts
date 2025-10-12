import { ApiResponse, PaginatedResponse, Schedule } from '../../types';
import { apiClient } from './apiClient';

export class ScheduleService {
  /**
   * Get schedules for a specific date
   */
  static async getSchedulesByDate(date: string): Promise<ApiResponse<Schedule[]>> {
    try {
      // Mock data for demo
      const mockSchedules: Schedule[] = [
        {
          id: '1',
          patientId: 'P001',
          patient: {
            id: 'P001',
            name: 'John Smith',
            patientId: 'P001',
            address: '123 Main St, Downtown',
            phone: '+1 (555) 123-4567',
            dateOfBirth: '1965-03-15',
            emergencyContact: {
              name: 'Jane Smith',
              phone: '+1 (555) 987-6543',
              relationship: 'Spouse',
            },
          },
          employeeId: 'EMP001',
          startTime: '09:00',
          endTime: '11:00',
          date,
          status: 'upcoming',
          notes: 'Regular checkup and medication review',
          location: '123 Main St, Downtown',
          serviceType: 'Regular Care',
        },
        {
          id: '2',
          patientId: 'P002',
          patient: {
            id: 'P002',
            name: 'Mary Johnson',
            patientId: 'P002',
            address: '456 Oak Ave, Uptown',
            phone: '+1 (555) 234-5678',
            dateOfBirth: '1970-08-22',
            emergencyContact: {
              name: 'Robert Johnson',
              phone: '+1 (555) 876-5432',
              relationship: 'Son',
            },
          },
          employeeId: 'EMP001',
          startTime: '14:00',
          endTime: '16:00',
          date,
          status: 'in-progress',
          notes: 'Physical therapy session',
          location: '456 Oak Ave, Uptown',
          serviceType: 'Physical Therapy',
        },
        {
          id: '3',
          patientId: 'P003',
          patient: {
            id: 'P003',
            name: 'Robert Wilson',
            patientId: 'P003',
            address: '789 Pine St, Midtown',
            phone: '+1 (555) 345-6789',
            dateOfBirth: '1958-12-10',
            emergencyContact: {
              name: 'Linda Wilson',
              phone: '+1 (555) 765-4321',
              relationship: 'Daughter',
            },
          },
          employeeId: 'EMP001',
          startTime: '17:00',
          endTime: '18:30',
          date,
          status: 'upcoming',
          notes: 'Daily care assistance',
          location: '789 Pine St, Midtown',
          serviceType: 'Daily Care',
        },
      ];

      return {
        success: true,
        data: mockSchedules,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch schedules',
      };
    }

    // Production implementation:
    // return apiClient.get<Schedule[]>(`/schedules?date=${date}`);
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