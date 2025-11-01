import { ApiResponse, UnscheduledVisit, UnscheduledVisitRequest } from '../../types';
import { apiClient } from './apiClient';

// Mock storage for visits (in-memory for now)
let mockVisits: UnscheduledVisit[] = [];

/**
 * Service for managing unscheduled visits
 * Creates emergency/unscheduled visits immediately - no approval needed
 * Staff can check-in/out and complete daily notes right away
 */
export class UnscheduledVisitService {
  /**
   * Create a new unscheduled visit (creates schedule immediately)
   */
  static async create(
    request: UnscheduledVisitRequest
  ): Promise<ApiResponse<UnscheduledVisit>> {
    // TODO: Backend API not implemented yet - using mock data for now
    // return apiClient.post<UnscheduledVisit>('/unscheduled-visits', request);
    
    // Mock response for testing
    console.log('Mock: Creating unscheduled visit', request);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockVisit: UnscheduledVisit = {
          id: `USV-${Date.now()}`,
          patientId: request.patientId,
          patientName: request.patientName,
          location: request.location,
          reason: request.reason,
          createdBy: request.requestedBy,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          scheduleId: `SCH-${Date.now()}`,
          status: 'active',
        };
        
        // Add to mock storage
        mockVisits.push(mockVisit);
        
        resolve({
          success: true,
          data: mockVisit,
        });
      }, 500);
    });
  }

  /**
   * Get all unscheduled visits
   */
  static async list(params?: {
    status?: 'active' | 'completed' | 'cancelled';
    patientId?: string;
    createdBy?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<UnscheduledVisit[]>> {
    // TODO: Backend API not implemented yet - using mock data for now
    
    // Mock response for testing
    console.log('Mock: Listing unscheduled visits', params);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredVisits = [...mockVisits];
        
        // Apply filters
        if (params?.status) {
          filteredVisits = filteredVisits.filter(v => v.status === params.status);
        }
        if (params?.createdBy) {
          filteredVisits = filteredVisits.filter(v => v.createdBy === params.createdBy);
        }
        if (params?.patientId) {
          filteredVisits = filteredVisits.filter(v => v.patientId === params.patientId);
        }
        
        resolve({
          success: true,
          data: filteredVisits,
        });
      }, 300);
    });
  }

  /**
   * Get a specific unscheduled visit by ID
   */
  static async getById(id: string): Promise<ApiResponse<UnscheduledVisit>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const visit = mockVisits.find(v => v.id === id);
        if (visit) {
          resolve({ success: true, data: visit });
        } else {
          resolve({ success: false, error: 'Visit not found' });
        }
      }, 200);
    });
  }

  /**
   * Update an unscheduled visit
   */
  static async update(
    id: string,
    updates: Partial<UnscheduledVisit>
  ): Promise<ApiResponse<UnscheduledVisit>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockVisits.findIndex(v => v.id === id);
        if (index !== -1) {
          mockVisits[index] = { ...mockVisits[index], ...updates, updatedAt: new Date().toISOString() };
          resolve({ success: true, data: mockVisits[index] });
        } else {
          resolve({ success: false, error: 'Visit not found' });
        }
      }, 300);
    });
  }

  /**
   * Delete/cancel an unscheduled visit
   */
  static async delete(id: string): Promise<ApiResponse<void>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockVisits.findIndex(v => v.id === id);
        if (index !== -1) {
          mockVisits.splice(index, 1);
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Visit not found' });
        }
      }, 300);
    });
  }
}

export default UnscheduledVisitService;
