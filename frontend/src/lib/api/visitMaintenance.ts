import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { VisitMaintenanceQueryParams, VisitMaintenanceResponse } from '@/types/visitMaintenance';

/**
 * API functions for Visit Maintenance
 */

/**
 * Get all visits with optional filters and pagination
 */
export async function getVisits(params?: VisitMaintenanceQueryParams): Promise<ApiResponse<VisitMaintenanceResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.clientId) queryParams.append('clientId', params.clientId);
  if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
  if (params?.officeId) queryParams.append('officeId', params.officeId);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.cancelled !== undefined) queryParams.append('cancelled', params.cancelled.toString());

  const url = `/service-delivery/visit-maintenance${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return apiClient<VisitMaintenanceResponse>(url);
}

/**
 * Get a single visit by ID
 */
export async function getVisitDetail(visitId: string): Promise<ApiResponse<import('@/types/visitMaintenance').VisitMaintenanceDTO>> {
  return apiClient<import('@/types/visitMaintenance').VisitMaintenanceDTO>(`/service-delivery/visit-maintenance/${visitId}`);
}
