import { Suspense } from "react";
import { headers } from "next/headers";
import ClientsClient from "./ClientsClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { OfficeDTO } from "@/types/office";
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
        revalidate: 0, // Don't cache user-specific data
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

// Fetch active offices for the create client modal
async function getActiveOffices(): Promise<OfficeDTO[]> {
  try {
    // Use Next.js API route (BFF pattern) instead of calling backend directly
    // This allows Server Components to make authenticated requests
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/offices/active`, {
      cache: 'no-store', // Don't cache user-specific data
    });

    if (!response.ok) {
      console.error("Failed to fetch offices:", response.statusText);
      return [];
    }

    const apiResponse: ApiResponse<OfficeDTO[]> = await response.json();

    if (!apiResponse.success || !apiResponse.data) {
      console.error("Failed to fetch offices:", apiResponse.message);
      return [];
    }

    return apiResponse.data;
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

  // Fetch both clients and offices in parallel
  const [clientsResult, offices] = await Promise.all([
    getInitialClients(resolvedSearchParams),
    getActiveOffices(),
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
          <ClientsClient initialData={initialData} offices={offices} />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
