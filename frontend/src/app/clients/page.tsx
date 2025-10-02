import { Suspense } from "react";
import ClientsClient from "./ClientsClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { PaginatedPatients } from "@/types/patient";
import { Card, Spin } from "antd";

interface SearchParams {
  page?: string;
  size?: string;
  sortBy?: string;
  sortDir?: string;
}

interface ClientsPageProps {
  searchParams: Promise<SearchParams>;
}

// Server Component - Fetches initial data with error handling
async function getInitialClients(
  searchParams: SearchParams
): Promise<{ data: PaginatedPatients | null; error?: string }> {
  try {
    const page = searchParams.page || "0";
    const size = searchParams.size || "25";
    const sortBy = searchParams.sortBy || "lastName";
    const sortDir = searchParams.sortDir || "asc";

    const endpoint = `/patients?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;

    const response: ApiResponse<PaginatedPatients> =
      await apiClient<PaginatedPatients>(endpoint);

    if (!response.success || !response.data) {
      console.error("Failed to fetch clients:", response.message);
      return { data: null, error: response.message };
    }

    return { data: response.data };
  } catch (error) {
    console.error("Error fetching initial clients:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Loading fallback
function ClientsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <Card className="p-8">
        <Spin size="large" />
        <p className="mt-4 text-theme-secondary">Loading clients...</p>
      </Card>
    </div>
  );
}

// Error fallback when backend is unavailable (Client Component for interactivity)
function ClientsError({ message }: { message?: string }) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <Card className="max-w-md w-full border-l-4 border-l-red-500">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-theme-primary mb-2">
                Unable to Load Clients
              </h2>
              <p className="text-theme-secondary">
                {message || "An error occurred while loading client data."}
              </p>
            </div>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

// Server Component (default)
export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  // Await searchParams (Next.js 15+ requirement)
  const resolvedSearchParams = await searchParams;
  const result = await getInitialClients(resolvedSearchParams);

  // If backend is down or data fetch failed, show error UI instead of crashing

  if (!result.data) {
    return <ClientsError message={result.error} />;
  }

  const initialData = result.data;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<ClientsLoading />}>
          <ClientsClient
            initialData={initialData}
            searchParams={resolvedSearchParams}
          />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
