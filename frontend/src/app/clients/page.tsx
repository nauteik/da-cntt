import { Suspense } from "react";
import { headers, cookies } from "next/headers";
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
    // TEMPORARY: Use direct backend call instead of BFF to test if cookie works
    // This bypasses the BFF layer to test if the issue is with Next.js cookies()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      console.error("Backend URL not configured");
      return [];
    }

   // Correctly get the cookie store. cookies() is a function call.
   const cookieStore = await cookies(); 
    
   // Now you can call .get() on the returned store object
   const accessTokenCookie = cookieStore.get('accessToken');

    // Check if the cookie exists
    if (!accessTokenCookie) {
      console.warn("Authentication cookie not found in server-side request.");
      return [];
    }

    console.log("Direct backend call to:", `${backendUrl}/api/office/active`);
    console.log(accessTokenCookie.value);
    const response = await fetch(`${backendUrl}/api/office/active`, {
      method: 'GET',
      credentials: 'include', // This should send cookies
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `accessToken=${accessTokenCookie.value}`
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error("Failed to fetch offices:", response.status, response.statusText);
      return [];
    }

    const apiResponse: ApiResponse<OfficeDTO[]> = await response.json();

    if (!apiResponse.success || !apiResponse.data) {
      console.error("Failed to fetch offices:", apiResponse.message);
      return [];
    }

    console.log("Successfully fetched offices:", apiResponse.data.length);
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
