export interface ReportFilters {
  fromDate: string | null;
  toDate: string | null;
  fromTime: string | null;
  toTime: string | null;
  payerIds?: string[];
  programIds?: string[];
  serviceTypeIds?: string[];
  clientMedicaidId?: string;
  clientSearch?: string;
  expiresAfterDays?: number;
  employeeName?: string;
  department?: string;
  supervisorId?: string;
  officeId?: string;
}

export interface AuthVsActualReportDTO {
  clientName: string;
  clientType: string;
  medicaidId: string;
  alternatePayer: string;
  payer: string;
  program: string;
  service: string;
  authStartDate: string;
  authEndDate: string;
  authId: string;
  authorizedUnits: number;
  usedUnits: number;
  availableUnits: number;
  limitType: string;
  jurisdiction: string;
}

export interface AuthorizationReportDTO {
  clientName: string;
  payerName: string;
  programIdentifier: string;
  serviceCode: string;
  authorizationNo: string;
  startDate: string;
  endDate: string;
  maxUnits: number;
  totalUsed: number;
  totalRemaining: number;
  status: string;
}

export interface ClientsWithoutAuthReportDTO {
  clientName: string;
  clientType: string;
  medicaidId: string;
  alternatePayer: string;
  payer: string;
  program: string;
  service: string;
  supervisor: string;
}

export interface ExpiringAuthReportDTO {
  clientName: string;
  clientType: string;
  medicaidId: string;
  alternatePayer: string;
  payer: string;
  program: string;
  service: string;
  startDate: string;
  endDate: string;
  authId: string;
  authorizedUnits: number;
  limit: string;
  available: number;
  jurisdiction: string;
  daysUntilExpiration: number;
}

export type ReportType = 
  | 'auth-vs-actual' 
  | 'authorizations' 
  | 'clients-without-auth' 
  | 'expiring-auth'
  | 'active-client-contacts'
  | 'active-clients'
  | 'active-employees'
  | 'call-listing'
  | 'call-summary'
  | 'client-address-listing'
  | 'employee-attributes'
  | 'gps-distance-exception'
  | 'payer-program-service-listing'
  | 'visit-listing';

export interface ReportMetadata {
  key: ReportType;
  name: string;
  categoryKey: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// Filter field configs for each report type
export interface FilterFieldConfig {
  showDateRange: boolean;
  showTimeRange: boolean;
  showPayers: boolean;
  showPrograms: boolean;
  showServices: boolean;
  showClient: boolean;
  showClientMedicaidId: boolean;
  showExpiresAfter: boolean;
  showEmployeeName: boolean;
  showDepartment: boolean;
  showSupervisor: boolean;
  showOffice: boolean;
}

export const REPORT_FILTER_CONFIGS: Record<ReportType, FilterFieldConfig> = {
  'auth-vs-actual': {
    showDateRange: true,
    showTimeRange: true,
    showPayers: true,
    showPrograms: true,
    showServices: true,
    showClient: true,
    showClientMedicaidId: true,
    showExpiresAfter: false,
    showEmployeeName: false,
    showDepartment: false,
    showSupervisor: false,
    showOffice: false,
  },
  'authorizations': {
    showDateRange: true,
    showTimeRange: true,
    showPayers: true,
    showPrograms: true,
    showServices: true,
    showClient: true,
    showClientMedicaidId: true,
    showExpiresAfter: false,
    showEmployeeName: false,
    showDepartment: false,
    showSupervisor: false,
    showOffice: false,
  },
  'clients-without-auth': {
    showDateRange: true,
    showTimeRange: true,
    showPayers: false,
    showPrograms: false,
    showServices: false,
    showClient: true,
    showClientMedicaidId: true,
    showExpiresAfter: false,
    showEmployeeName: false,
    showDepartment: false,
    showSupervisor: false,
    showOffice: false,
  },
  'expiring-auth': {
    showDateRange: true,
    showTimeRange: true,
    showPayers: true,
    showPrograms: true,
    showServices: true,
    showClient: true,
    showClientMedicaidId: true,
    showExpiresAfter: true,
    showEmployeeName: false,
    showDepartment: false,
    showSupervisor: false,
    showOffice: false,
  },
  'active-client-contacts': {
    showDateRange: true,
    showTimeRange: true,
    showPayers: true,
    showPrograms: true,
    showServices: false,
    showClient: true,
    showClientMedicaidId: true,
    showExpiresAfter: false,
    showEmployeeName: false,
    showDepartment: false,
    showSupervisor: true,
    showOffice: false,
  },
  'active-clients': {
    showDateRange: true,
    showTimeRange: true,
    showPayers: true,
    showPrograms: true,
    showServices: true,
    showClient: true,
    showClientMedicaidId: true,
    showExpiresAfter: false,
    showEmployeeName: false,
    showDepartment: false,
    showSupervisor: false,
    showOffice: false,
  },
  'active-employees': {
    showDateRange: true,
    showTimeRange: true,
    showPayers: false,
    showPrograms: false,
    showServices: false,
    showClient: false,
    showClientMedicaidId: false,
    showExpiresAfter: false,
    showEmployeeName: true,
    showDepartment: false,
    showSupervisor: false,
    showOffice: true,
  },
  'call-listing': {
    showDateRange: true,
    showTimeRange: true,
    showPayers: true,
    showPrograms: true,
    showServices: true,
    showClient: true,
    showClientMedicaidId: true,
    showExpiresAfter: false,
    showEmployeeName: true,
    showDepartment: false,
    showSupervisor: true,
    showOffice: true,
  },
  'call-summary': {
    showDateRange: true,
    showTimeRange: true,
    showPayers: true,
    showPrograms: true,
    showServices: true,
    showClient: true,
    showClientMedicaidId: true,
    showExpiresAfter: false,
    showEmployeeName: true,
    showDepartment: false,
    showSupervisor: true,
    showOffice: true,
  },
  'client-address-listing': {
    showDateRange: false,
    showTimeRange: false,
    showPayers: false,
    showPrograms: false,
    showServices: false,
    showClient: false,
    showClientMedicaidId: true,
    showExpiresAfter: false,
    showEmployeeName: false,
    showDepartment: false,
    showSupervisor: false,
    showOffice: false,
  },
  'employee-attributes': {
    showDateRange: false,
    showTimeRange: false,
    showPayers: false,
    showPrograms: false,
    showServices: false,
    showClient: false,
    showClientMedicaidId: false,
    showExpiresAfter: false,
    showEmployeeName: true,
    showDepartment: false,
    showSupervisor: false,
    showOffice: false,
  },
  'gps-distance-exception': {
    showDateRange: true,
    showTimeRange: false,
    showPayers: false,
    showPrograms: false,
    showServices: true,
    showClient: false,
    showClientMedicaidId: false,
    showExpiresAfter: false,
    showEmployeeName: false,
    showDepartment: false,
    showSupervisor: false,
    showOffice: false,
  },
  'payer-program-service-listing': {
    showDateRange: false,
    showTimeRange: false,
    showPayers: true,
    showPrograms: true,
    showServices: false,
    showClient: false,
    showClientMedicaidId: false,
    showExpiresAfter: false,
    showEmployeeName: false,
    showDepartment: false,
    showSupervisor: false,
    showOffice: false,
  },
  'visit-listing': {
    showDateRange: true,
    showTimeRange: false,
    showPayers: true,
    showPrograms: true,
    showServices: true,
    showClient: false,
    showClientMedicaidId: true,
    showExpiresAfter: false,
    showEmployeeName: true,
    showDepartment: true,
    showSupervisor: true,
    showOffice: false,
  },
};

// Daily Report DTOs

export interface ActiveClientContactDTO {
  accountName: string;
  clientName: string;
  clientMedicaidId: string;
  contactName: string;
  relationshipToClient: string;
  email: string;
}

export interface ActiveClientDTO {
  accountName: string;
  providerId: string;
  clientMedicaidId: string;
  clientName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  latitude: number;
  longitude: number;
  activeSinceDate: string;
  totalActiveClients: number;
}

export interface ActiveEmployeeDTO {
  accountName: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  phone: string;
  department: string;
  totalEmployees: number;
}

export interface CallListingDTO {
  serviceId: string;
  accountName: string;
  accountId: string;
  clientId: string;
  clientMedicaidId: string;
  clientName: string;
  phone: string;
  employeeName: string;
  employeeId: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  callInTime: string;
  callOutTime: string;
  visitKey: string;
  groupCode: string;
  status: string;
  indicators: string;
}

export interface CallSummaryDTO {
  officeId: string;
  clientId: string;
  clientMedicaidId: string;
  clientName: string;
  employeeName: string;
  employeeId: string;
  visitKey: string;
  startTime: string;
  endTime: string;
  callsStart: number;
  callsEnd: number;
  hoursTotal: number;
  units: number;
}

export interface ClientAddressListingDTO {
  accountId: string;
  accountName: string;
  clientMedicaidId: string;
  clientName: string;
  tag: string;
  addressType: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
}

export interface EmployeeAttributesDTO {
  employeeName: string;
  attributeName: string;
  attributeValue: string;
}

export interface GpsDistanceExceptionDTO {
  serviceId: string;
  accountName: string;
  clientName: string;
  clientMedicaidId: string;
  employeeName: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  expectedDistance: number;
  actualDistance: number;
  variance: number;
  exceptionReason: string;
}

export interface PayerProgramServiceListingDTO {
  payerName: string;
  programName: string;
  serviceCode: string;
  serviceName: string;
}

export interface VisitListingDTO {
  payerId: string;
  accountName: string;
  accountId: string;
  providerId: string;
  clientMedicaidId: string;
  clientName: string;
  employeeName: string;
  employeeId: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  visitKey: string;
  status: string;
}
