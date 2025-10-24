import { Suspense } from "react";
import { headers } from "next/headers";
import ClientsClient from "./ClientsClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { OfficeDTO } from "@/types/office";
import type { PaginatedPatients } from "@/types/patient";
import type { PatientFilterOptions } from "@/types/patientFilterOptions";
import LoadingFallback from "@/components/common/LoadingFallback";
import ErrorFallback from "@/components/common/ErrorFallback";

interface SearchParams {
  page?: string;
  size?: string;
  sortBy?: string;
  sortDir?: string;
  search?: string;
  status?: string | string[];
  program?: string | string[];
  services?: string | string[];
}

interface ClientsPageProps {
  searchParams: Promise<SearchParams>;
}

// Server Component - Fetches initial data with error handling
async function getInitialClients(
  searchParams: SearchParams
): Promise<{ data: PaginatedPatients | null; error?: string }> {
  try {
    // URL uses 1-based pagination, backend uses 0-based
    const urlPage = searchParams.page || "1";
    const backendPage = String(Math.max(0, parseInt(urlPage, 10) - 1)); // Convert to 0-based
    const size = searchParams.size || "25";
    const sortBy = searchParams.sortBy || "";
    const sortDir = searchParams.sortDir || "asc";

    // Build query string with optional search and status parameters
    const queryParams = new URLSearchParams({
      page: backendPage, // Use 0-based page for backend
      size,
    });

    // Only add sort params if sortBy is provided
    if (sortBy) {
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortDir", sortDir);
    }

    // Add search parameter if present
    if (searchParams.search) {
      queryParams.append("search", searchParams.search);
    }

    // Add status parameters if present (can have multiple)
    if (searchParams.status) {
      const statuses = Array.isArray(searchParams.status)
        ? searchParams.status
        : [searchParams.status];
      statuses.forEach((status: string) =>
        queryParams.append("status", status)
      );
    }

    // Add program parameters if present (can have multiple)
    if (searchParams.program) {
      const programs = Array.isArray(searchParams.program)
        ? searchParams.program
        : [searchParams.program];
      programs.forEach((program: string) =>
        queryParams.append("program", program)
      );
    }

    // Add services parameters if present (can have multiple)
    if (searchParams.services) {
      const services = Array.isArray(searchParams.services)
        ? searchParams.services
        : [searchParams.services];
      services.forEach((service: string) =>
        queryParams.append("services", service)
      );
    }

    const endpoint = `/patients?${queryParams.toString()}`;

    const response: ApiResponse<PaginatedPatients> =
      await apiClient<PaginatedPatients>(endpoint);

    if (!response.success || !response.data) {
      return { data: null, error: response.message };
    }
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching initial clients:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch patient filter options
async function getPatientFilterOptions(): Promise<PatientFilterOptions> {
  try {
    const response: ApiResponse<PatientFilterOptions> = await apiClient<PatientFilterOptions>("/patients/filter-options");

    if (!response.success || !response.data) {
      console.error("Failed to fetch filter options:", response.message);
      return { programs: [], serviceTypes: [] };
    }

    console.log("Successfully fetched filter options:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return { programs: [], serviceTypes: [] };
  }
}

// Fetch active offices for the create client modal
async function getActiveOffices(): Promise<OfficeDTO[]> {
  try {
    // Use direct backend call since we removed BFF for office/active
    const response: ApiResponse<OfficeDTO[]> = await apiClient<OfficeDTO[]>("/office/active");

    if (!response.success || !response.data) {
      console.error("Failed to fetch offices:", response.message);
      return [];
    }

    console.log("Successfully fetched offices:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("Error fetching offices:", error);
    return [];
  }
}

// Server Component (default)
export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  // Force dynamic rendering to access request headers (cookies)
  // This ensures the page can access the user's authentication cookies
  await headers();

  // Await searchParams (Next.js 15+ requirement)
  const resolvedSearchParams = await searchParams;

  // Fetch clients, offices, and filter options in parallel
  const [clientsResult, offices, filterOptions] = await Promise.all([
    getInitialClients(resolvedSearchParams),
    getActiveOffices(),
    getPatientFilterOptions(),
  ]);

  // If backend is down or data fetch failed, show error UI instead of crashing
  if (!clientsResult.data) {
    return (
      <ErrorFallback
        title="Unable to Load Clients"
        message={clientsResult.error}
      />
    );
  }

  const initialData = clientsResult.data;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading clients..." />}>
          <ClientsClient initialData={initialData} offices={offices} filterOptions={filterOptions} />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
