import { Suspense } from "react";
import { headers } from "next/headers";
import AuthorizationsClient from "@/app/authorizations/AuthorizationsClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { PaginatedAuthorizations } from "@/types/authorization";
import type { PayerSelectDTO, ProgramSelectDTO, ServiceTypeSelectDTO } from "@/types/patient";
import type { StaffSelectDTO } from "@/types/staff";
import LoadingFallback from "@/components/common/LoadingFallback";
import ErrorFallback from "@/components/common/ErrorFallback";

interface SearchParams {
  page?: string;
  size?: string;
  sortBy?: string;
  sortDir?: string;
  startDate?: string;
  endDate?: string;
  payerId?: string;
  supervisorId?: string;
  programId?: string;
  serviceTypeId?: string;
  authorizationNo?: string;
  clientId?: string;
  clientFirstName?: string;
  clientLastName?: string;
  status?: string;
  include?: string;
}

interface AuthorizationsPageProps {
  searchParams: Promise<SearchParams>;
}

// Server Component - Fetches initial data with error handling
async function getInitialAuthorizations(
  searchParams: SearchParams
): Promise<{ data: PaginatedAuthorizations | null; error?: string }> {
  try {
    // URL uses 1-based pagination, backend uses 0-based
    const urlPage = searchParams.page || "1";
    const backendPage = String(Math.max(0, parseInt(urlPage, 10) - 1)); // Convert to 0-based
    const size = searchParams.size || "25";
    const sortBy = searchParams.sortBy || "";
    const sortDir = searchParams.sortDir || "asc";

    // Build query string with optional parameters
    const queryParams = new URLSearchParams({
      page: backendPage, // Use 0-based page for backend
      size,
    });

    // Only add sort params if sortBy is provided
    if (sortBy) {
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortDir", sortDir);
    }

    // Add optional date filters
    if (searchParams.startDate) {
      queryParams.append("startDate", searchParams.startDate);
    }
    if (searchParams.endDate) {
      queryParams.append("endDate", searchParams.endDate);
    }

    // Add optional UUID filters
    if (searchParams.payerId) {
      queryParams.append("payerId", searchParams.payerId);
    }
    if (searchParams.supervisorId) {
      queryParams.append("supervisorId", searchParams.supervisorId);
    }
    if (searchParams.programId) {
      queryParams.append("programId", searchParams.programId);
    }
    if (searchParams.serviceTypeId) {
      queryParams.append("serviceTypeId", searchParams.serviceTypeId);
    }

    // Add optional text search filters
    if (searchParams.authorizationNo) {
      queryParams.append("authorizationNo", searchParams.authorizationNo);
    }
    if (searchParams.clientId) {
      queryParams.append("clientId", searchParams.clientId);
    }
    if (searchParams.clientFirstName) {
      queryParams.append("clientFirstName", searchParams.clientFirstName);
    }
    if (searchParams.clientLastName) {
      queryParams.append("clientLastName", searchParams.clientLastName);
    }

    // Add optional status filter
    if (searchParams.status) {
      queryParams.append("status", searchParams.status);
    }

    // Check if we have any search parameters
    const hasSearchParams = Boolean(
      searchParams.startDate || searchParams.endDate || searchParams.payerId ||
      searchParams.supervisorId || searchParams.programId || searchParams.serviceTypeId ||
      searchParams.authorizationNo || searchParams.clientId || searchParams.clientFirstName ||
      searchParams.clientLastName || searchParams.status
    );

    // If no search params, return empty data
    if (!hasSearchParams) {
      return {
        data: {
          content: [],
          page: {
            size: parseInt(size, 10),
            number: 0,
            totalElements: 0,
            totalPages: 0,
          },
        },
      };
    }

    const endpoint = `/authorizations/search?${queryParams.toString()}`;

    const response: ApiResponse<{
      content: unknown[];
      page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
      };
    }> = await apiClient(endpoint);

    if (!response.success || !response.data) {
      return { data: null, error: response.message };
    }

    // Transform backend response to match PaginatedAuthorizations format
    const paginatedData: PaginatedAuthorizations = {
      content: response.data.content as PaginatedAuthorizations["content"],
      page: {
        size: response.data.page.size,
        number: response.data.page.number,
        totalElements: response.data.page.totalElements,
        totalPages: response.data.page.totalPages,
      },
    };

    return { data: paginatedData };
  } catch (error) {
    console.error("Error fetching initial authorizations:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch dropdown options
async function getPayers(): Promise<PayerSelectDTO[]> {
  try {
    const response: ApiResponse<PayerSelectDTO[]> = await apiClient<PayerSelectDTO[]>("/payer/select");

    if (!response.success || !response.data) {
      console.error("Failed to fetch payers:", response.message);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching payers:", error);
    return [];
  }
}

async function getSupervisors(): Promise<StaffSelectDTO[]> {
  try {
    const response: ApiResponse<StaffSelectDTO[]> = await apiClient<StaffSelectDTO[]>("/staff/select");

    if (!response.success || !response.data) {
      console.error("Failed to fetch supervisors:", response.message);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    return [];
  }
}

async function getPrograms(): Promise<ProgramSelectDTO[]> {
  try {
    const response: ApiResponse<ProgramSelectDTO[]> = await apiClient<ProgramSelectDTO[]>("/program/select");

    if (!response.success || !response.data) {
      console.error("Failed to fetch programs:", response.message);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
}

async function getServices(): Promise<ServiceTypeSelectDTO[]> {
  try {
    const response: ApiResponse<ServiceTypeSelectDTO[]> = await apiClient<ServiceTypeSelectDTO[]>("/services/select");

    if (!response.success || !response.data) {
      console.error("Failed to fetch services:", response.message);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

// Server Component (default)
export default async function AuthorizationsPage({ searchParams }: AuthorizationsPageProps) {
  // Force dynamic rendering to access request headers (cookies)
  await headers();

  // Await searchParams (Next.js 15+ requirement)
  const resolvedSearchParams = await searchParams;

  // Fetch dropdown options and initial data in parallel
  const [authorizationsResult, payers, supervisors, programs, services] = await Promise.all([
    getInitialAuthorizations(resolvedSearchParams),
    getPayers(),
    getSupervisors(),
    getPrograms(),
    getServices(),
  ]);

  // If backend is down or data fetch failed, show error UI instead of crashing
  // But only if we actually tried to fetch data (has search params)
  const hasSearchParams = Boolean(
    resolvedSearchParams.startDate || resolvedSearchParams.endDate || resolvedSearchParams.payerId ||
    resolvedSearchParams.supervisorId || resolvedSearchParams.programId || resolvedSearchParams.serviceTypeId ||
    resolvedSearchParams.authorizationNo || resolvedSearchParams.clientId || resolvedSearchParams.clientFirstName ||
    resolvedSearchParams.clientLastName || resolvedSearchParams.status
  );

  if (hasSearchParams && !authorizationsResult.data) {
    return (
      <ErrorFallback
        title="Unable to Load Authorizations"
        message={authorizationsResult.error}
      />
    );
  }

  const initialData = authorizationsResult.data || {
    content: [],
    page: {
      size: 25,
      number: 0,
      totalElements: 0,
      totalPages: 0,
    },
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading authorizations..." />}>
          <AuthorizationsClient
            initialData={initialData}
            payers={payers}
            supervisors={supervisors}
            programs={programs}
            services={services}
          />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}

