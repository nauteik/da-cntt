import { apiClient } from '../apiClient';
import type {
  ReportFilters,
  AuthVsActualReportDTO,
  AuthorizationReportDTO,
  ClientsWithoutAuthReportDTO,
  ExpiringAuthReportDTO,
  ActiveClientContactDTO,
  ActiveClientDTO,
  ActiveEmployeeDTO,
  CallListingDTO,
  CallSummaryDTO,
  ClientAddressListingDTO,
  EmployeeAttributesDTO,
  GpsDistanceExceptionDTO,
  PayerProgramServiceListingDTO,
  VisitListingDTO,
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
  
  // Add daily report specific filters
  if (filters.employeeName) params.append('employeeName', filters.employeeName);
  if (filters.department) params.append('department', filters.department);
  if (filters.supervisorId) params.append('supervisorId', filters.supervisorId);
  if (filters.officeId) params.append('officeId', filters.officeId);
  
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

  // Daily Reports API Functions

  /**
   * Get Active Client Contacts report
   */
  getActiveClientContacts: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<ActiveClientContactDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/active-client-contacts?${queryString}`;
    
    const response = await apiClient<PageResponse<ActiveClientContactDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Active Clients report
   */
  getActiveClients: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<ActiveClientDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/active-clients?${queryString}`;
    
    const response = await apiClient<PageResponse<ActiveClientDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Active Employees report
   */
  getActiveEmployees: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<ActiveEmployeeDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/active-employees?${queryString}`;
    
    const response = await apiClient<PageResponse<ActiveEmployeeDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Call Listing report
   */
  getCallListing: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<CallListingDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/call-listing?${queryString}`;
    
    const response = await apiClient<PageResponse<CallListingDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Call Summary report
   */
  getCallSummary: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<CallSummaryDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/call-summary?${queryString}`;
    
    const response = await apiClient<PageResponse<CallSummaryDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Client Address Listing report
   */
  getClientAddressListing: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<ClientAddressListingDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/client-address-listing?${queryString}`;
    
    const response = await apiClient<PageResponse<ClientAddressListingDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Employee Attributes report
   */
  getEmployeeAttributes: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<EmployeeAttributesDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/employee-attributes?${queryString}`;
    
    const response = await apiClient<PageResponse<EmployeeAttributesDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get GPS Distance Exception report
   */
  getGpsDistanceException: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<GpsDistanceExceptionDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/gps-distance-exception?${queryString}`;
    
    const response = await apiClient<PageResponse<GpsDistanceExceptionDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Payer-Program-Service Listing report
   */
  getPayerProgramServiceListing: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<PayerProgramServiceListingDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/payer-program-service-listing?${queryString}`;
    
    const response = await apiClient<PageResponse<PayerProgramServiceListingDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Get Visit Listing report
   */
  getVisitListing: async (
    filters: ReportFilters,
    pagination: PaginationParams = {}
  ): Promise<PageResponse<VisitListingDTO>> => {
    const queryString = buildQueryString(filters, { page: 0, size: 25, ...pagination });
    const endpoint = `/reports/daily/visit-listing?${queryString}`;
    
    const response = await apiClient<PageResponse<VisitListingDTO>>(endpoint);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch report');
    }
    
    return response.data;
  },

  /**
   * Export daily report to Excel
   */
  exportDailyReport: async (reportType: string, filters: ReportFilters): Promise<Blob> => {
    const queryString = buildQueryString(filters);
    const endpoint = `/reports/daily/${reportType}/export?${queryString}`;
    
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

