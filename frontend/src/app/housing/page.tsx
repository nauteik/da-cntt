import { Suspense } from "react";
import { headers } from "next/headers";
import HousingClient from "./HousingClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { OfficeDTO } from "@/types/office";
import type { PaginatedHouses } from "@/types/house";
import LoadingFallback from "@/components/common/LoadingFallback";
import ErrorFallback from "@/components/common/ErrorFallback";

interface SearchParams {
  page?: string;
  size?: string;
  sortBy?: string;
  sortDir?: string;
  search?: string;
  office?: string;
}

interface HousingPageProps {
  searchParams: Promise<SearchParams>;
}

// Server Component - Fetches initial data with error handling
async function getInitialHouses(
  searchParams: SearchParams
): Promise<{ data: PaginatedHouses | null; error?: string }> {
  try {
    // URL uses 1-based pagination, backend uses 0-based
    const urlPage = searchParams.page || "1";
    const backendPage = String(Math.max(0, parseInt(urlPage, 10) - 1)); // Convert to 0-based
    const size = searchParams.size || "25";
    const sortBy = searchParams.sortBy || "";
    const sortDir = searchParams.sortDir || "asc";

    // Build query string
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

    // Add office filter if present
    if (searchParams.office) {
      queryParams.append("officeId", searchParams.office);
    }

    const endpoint = `/house?${queryParams.toString()}`;

    const response: ApiResponse<PaginatedHouses> =
      await apiClient<PaginatedHouses>(endpoint);

    if (!response.success || !response.data) {
      return { data: null, error: response.message };
    }
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching initial houses:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch active offices for the filter
async function getActiveOffices(): Promise<OfficeDTO[]> {
  try {
    const response: ApiResponse<OfficeDTO[]> = await apiClient<OfficeDTO[]>("/office/active");

    if (!response.success || !response.data) {
      console.error("Failed to fetch offices:", response.message);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching offices:", error);
    return [];
  }
}

// Server Component (default)
export default async function HousingPage({ searchParams }: HousingPageProps) {
  // Force dynamic rendering to access request headers (cookies)
  await headers();

  // Await searchParams (Next.js 15+ requirement)
  const resolvedSearchParams = await searchParams;

  // Fetch houses and offices in parallel
  const [housesResult, offices] = await Promise.all([
    getInitialHouses(resolvedSearchParams),
    getActiveOffices(),
  ]);

  // If backend is down or data fetch failed, show error UI instead of crashing
  if (!housesResult.data) {
    return (
      <ErrorFallback
        title="Unable to Load Houses"
        message={housesResult.error}
      />
    );
  }

  const initialData = housesResult.data;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading houses..." />}>
          <HousingClient initialData={initialData} offices={offices} />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}




