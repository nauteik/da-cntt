import { apiClient } from '../apiClient';
import type {
  ReportFilters,
  AuthVsActualReportDTO,
  AuthorizationReportDTO,
  ClientsWithoutAuthReportDTO,
  ExpiringAuthReportDTO,
  PageResponse,
  PaginationParams,
} from '@/types/report';

/**
 * Helper to build query string from filters and pagination
 */
function buildQueryString(filters: ReportFilters, pagination: PaginationParams = {}): string {
  const params = new URLSearchParams();
  
  // Add filters
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  if (filters.fromTime) params.append('fromTime', filters.fromTime);
  if (filters.toTime) params.append('toTime', filters.toTime);
  if (filters.clientMedicaidId) params.append('clientMedicaidId', filters.clientMedicaidId);
  if (filters.clientSearch) params.append('clientSearch', filters.clientSearch);
  if (filters.expiresAfterDays !== undefined) {
    params.append('expiresAfterDays', filters.expiresAfterDays.toString());
  }
  
  // Add array filters
  if (filters.payerIds?.length) {
    filters.payerIds.forEach(id => params.append('payerIds', id));
  }
  if (filters.programIds?.length) {
    filters.programIds.forEach(id => params.append('programIds', id));
  }
  if (filters.serviceTypeIds?.length) {
    filters.serviceTypeIds.forEach(id => params.append('serviceTypeIds', id));
  }
  
  // Add pagination
  if (pagination.page !== undefined) params.append('page', pagination.page.toString());
  if (pagination.size !== undefined) params.append('size', pagination.size.toString());
  if (pagination.sort) params.append('sort', pagination.sort);
  
  return params.toString();
}

/**
 * Report API service
 */
export const reportApi = {
  /**
   * Get Authorization vs Actual Used by Client report
   */
  getAuthVsActualReport: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<AuthVsActualReportDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/authorization/auth-vs-actual?${queryString}`;
    
    const response = await apiClient<PageResponse<AuthVsActualReportDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Authorizations report
   */
  getAuthorizationsReport: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<AuthorizationReportDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/authorization/authorizations?${queryString}`;
    
    const response = await apiClient<PageResponse<AuthorizationReportDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Clients Without Authorizations report
   */
  getClientsWithoutAuthReport: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<ClientsWithoutAuthReportDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/authorization/clients-without-auth?${queryString}`;
    
    const response = await apiClient<PageResponse<ClientsWithoutAuthReportDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Expiring Authorizations report
   */
  getExpiringAuthReport: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<ExpiringAuthReportDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/authorization/expiring-auth?${queryString}`;
    
    const response = await apiClient<PageResponse<ExpiringAuthReportDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Export report to Excel
   */
  exportReport: async (reportType: string, filters: ReportFilters): Promise<Blob> => {
    const queryString = buildQueryString(filters);
    const endpoint = `/reports/authorization/${reportType}/export?${queryString}`;
    
    // For blob response, need to use fetch directly since apiClient expects JSON
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL + "/api";
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to export report');
    }
    
    return await response.blob();
  },
};

