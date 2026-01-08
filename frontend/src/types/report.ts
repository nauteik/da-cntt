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

export type ReportType = 'auth-vs-actual' | 'authorizations' | 'clients-without-auth' | 'expiring-auth';

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
  },
};

