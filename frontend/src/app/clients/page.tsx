import { Suspense } from "react";
import ClientsClient from "./ClientsClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { PaginatedPatients } from "@/types/patient";
import LoadingFallback from "@/components/common/LoadingFallback";
import ErrorFallback from "@/components/common/ErrorFallback";

interface SearchParams {
  page?: string;
  size?: string;
  sortBy?: string;
  sortDir?: string;
  search?: string;
  status?: string | string[];
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

    const endpoint = `/patients?${queryParams.toString()}`;

    const response: ApiResponse<PaginatedPatients> =
      await apiClient<PaginatedPatients>(endpoint, {
        revalidate: 60, // Cache for 60 seconds on server-side
      });

    if (!response.success || !response.data) {
      return { data: null, error: response.message };
    }
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching initial clients:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Server Component (default)
export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  // Await searchParams (Next.js 15+ requirement)
  const resolvedSearchParams = await searchParams;
  const result = await getInitialClients(resolvedSearchParams);

  // If backend is down or data fetch failed, show error UI instead of crashing
  if (!result.data) {
    return (
      <ErrorFallback title="Unable to Load Clients" message={result.error} />
    );
  }

  const initialData = result.data;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading clients..." />}>
          <ClientsClient initialData={initialData} />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
