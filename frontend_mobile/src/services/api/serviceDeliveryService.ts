import { apiClient } from './apiClient';

export interface ServiceDeliveryRequest {
  scheduleEventId: string;
  authorizationId?: string;
  startAt?: string;
  endAt?: string;
  units?: number;
  status?: string;
  approvalStatus?: string;
  // Unscheduled visit fields
  isUnscheduled?: boolean;
  actualStaffId?: string;
  unscheduledReason?: string;
}

export interface ServiceDeliveryResponse {
  id: string;
  scheduleEventId: string;
  authorizationId?: string;
  officeId: string;
  officeName: string;
  patientId: string;
  patientName: string;
  patientAddress?: string;
  patientCity?: string;
  patientState?: string;
  patientZipCode?: string;
  staffId: string;
  staffName: string;
  startAt: string;
  endAt: string;
  units: number;
  status: string;
  approvalStatus: string;
  totalHours?: number;
  checkInTime?: string;
  checkOutTime?: string;
  dailyNoteId?: string; // Daily Note ID if completed
  isCheckInCheckOutCompleted: boolean;
  isCheckInCheckOutFullyValid: boolean;
  createdAt: string;
  updatedAt: string;
  // Unscheduled visit fields
  isUnscheduled?: boolean;
  actualStaffId?: string;
  actualStaffName?: string;
  scheduledStaffId?: string;
  scheduledStaffName?: string;
  unscheduledReason?: string;
  // Cancellation fields
  cancelled?: boolean;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

const serviceDeliveryService = {
  /**
   * Create a new service delivery from schedule event
   */
  create: async (data: ServiceDeliveryRequest): Promise<ServiceDeliveryResponse> => {
    const response = await apiClient.post<any>('/service-delivery', data);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create service delivery');
    }
    return response.data.data;
  },

  /**
   * Get service delivery by ID
   */
  getById: async (id: string): Promise<ServiceDeliveryResponse> => {
    const response = await apiClient.get<any>(`/service-delivery/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get service delivery');
    }
    return response.data.data;
  },

  /**
   * Get service deliveries by staff
   */
  getByStaff: async (staffId: string): Promise<ServiceDeliveryResponse[]> => {
    const response = await apiClient.get<any>(`/service-delivery/staff/${staffId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get service deliveries');
    }
    const serviceDeliveries = response.data.data;
    // Debug: Log first service delivery to check dailyNoteId
    if (serviceDeliveries && serviceDeliveries.length > 0) {
      console.log('[serviceDeliveryService] Sample service delivery:', {
        id: serviceDeliveries[0].id,
        patientName: serviceDeliveries[0].patientName,
        isUnscheduled: serviceDeliveries[0].isUnscheduled,
        checkInTime: serviceDeliveries[0].checkInTime,
        checkOutTime: serviceDeliveries[0].checkOutTime,
        dailyNoteId: serviceDeliveries[0].dailyNoteId,
      });
    }
    return serviceDeliveries;
  },

  /**
   * Get service deliveries by patient
   */
  getByPatient: async (patientId: string): Promise<ServiceDeliveryResponse[]> => {
    const response = await apiClient.get<any>(`/service-delivery/patient/${patientId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get service deliveries');
    }
    return response.data.data;
  },

  /**
   * Update service delivery status
   */
  updateStatus: async (id: string, status: string): Promise<ServiceDeliveryResponse> => {
    const response = await apiClient.patch<any>(`/service-delivery/${id}/status?status=${status}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update status');
    }
    return response.data.data;
  },

  /**
   * Update service delivery approval status
   */
  updateApprovalStatus: async (id: string, approvalStatus: string): Promise<ServiceDeliveryResponse> => {
    const response = await apiClient.patch<any>(`/service-delivery/${id}/approval-status?approvalStatus=${approvalStatus}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update approval status');
    }
    return response.data.data;
  },
};

export default serviceDeliveryService;
