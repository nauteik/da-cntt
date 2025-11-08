import { apiClient } from './apiClient';

export interface CheckInRequest {
  serviceDeliveryId: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
}

export interface CheckOutRequest {
  serviceDeliveryId: string;
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
}

export interface CheckInCheckOutResponse {
  id: string;
  serviceDeliveryId: string;
  patientId: string;
  patientName: string;
  staffId: string;
  staffName: string;
  
  // Check-in information
  checkInTime?: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInLocation?: string;
  checkInDistanceMeters?: number;
  checkInDistanceFormatted?: string;
  checkInValid?: boolean;
  
  // Check-out information
  checkOutTime?: string;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutLocation?: string;
  checkOutDistanceMeters?: number;
  checkOutDistanceFormatted?: string;
  checkOutValid?: boolean;
  
  // Total hours
  totalHours?: number;
  
  // Patient address GPS
  patientLatitude?: number;
  patientLongitude?: number;
  patientAddress?: string;
  
  // Status flags
  isCompleted?: boolean;
  isFullyValid?: boolean;
  
  notes?: string;
}

class CheckInCheckOutService {
  /**
   * Check in to a service delivery with GPS location
   */
  async checkIn(request: CheckInRequest): Promise<CheckInCheckOutResponse> {
    console.log('[CheckInCheckOutService] Check-in request:', JSON.stringify(request, null, 2));
    
    const response = await apiClient.post<CheckInCheckOutResponse>(
      '/service-delivery/check-in-check-out/check-in',
      request
    );
    
    console.log('[CheckInCheckOutService] API response:', JSON.stringify(response, null, 2));
    
    if (!response.success || !response.data) {
      console.error('[CheckInCheckOutService] Check-in failed:', response.error);
      throw new Error(response.error || 'Failed to check in');
    }
    
    console.log('[CheckInCheckOutService] Check-in success:', JSON.stringify(response.data, null, 2));
    return response.data;
  }

  /**
   * Check out from a service delivery with GPS location
   */
  async checkOut(request: CheckOutRequest): Promise<CheckInCheckOutResponse> {
    console.log('[CheckInCheckOutService] Check-out request:', request);
    
    const response = await apiClient.post<CheckInCheckOutResponse>(
      '/service-delivery/check-in-check-out/check-out',
      request
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to check out');
    }
    
    console.log('[CheckInCheckOutService] Check-out response:', response.data);
    return response.data;
  }

  /**
   * Get check-in/check-out info by service delivery ID
   */
  async getById(serviceDeliveryId: string): Promise<CheckInCheckOutResponse> {
    console.log('[CheckInCheckOutService] Get check-in/check-out info for:', serviceDeliveryId);
    
    const response = await apiClient.get<CheckInCheckOutResponse>(
      `/service-delivery/check-in-check-out/${serviceDeliveryId}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get check-in/check-out info');
    }
    
    return response.data;
  }

  /**
   * Get incomplete check-outs for a staff member (checked in but not checked out)
   */
  async getIncompleteByStaff(staffId: string): Promise<CheckInCheckOutResponse[]> {
    console.log('[CheckInCheckOutService] Get incomplete check-outs for staff:', staffId);
    
    const response = await apiClient.get<CheckInCheckOutResponse[]>(
      `/service-delivery/check-in-check-out/staff/${staffId}/incomplete`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get incomplete check-outs');
    }
    
    return response.data;
  }
}

export default new CheckInCheckOutService();
