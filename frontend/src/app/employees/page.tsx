import { Suspense } from "react";
import { headers } from "next/headers";
import EmployeesClient from "./EmployeesClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { PaginatedStaff } from "@/types/staff";
import type { OfficeDTO } from "@/types/office";
import type { RoleDTO } from "@/types/role";
import LoadingFallback from "@/components/common/LoadingFallback";
import ErrorFallback from "@/components/common/ErrorFallback";

interface SearchParams {
  page?: string;
  size?: string;
  sortBy?: string;
  sortDir?: string;
  search?: string;
  status?: string | string[];
  role?: string | string[];
}

interface EmployeesPageProps {
  searchParams: Promise<SearchParams>;
}

// Server Component - Fetches initial data with error handling
async function getInitialEmployees(
  searchParams: SearchParams
): Promise<{ data: PaginatedStaff | null; error?: string }> {
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

    // Add role parameters if present (can have multiple)
    if (searchParams.role) {
      const roles = Array.isArray(searchParams.role)
        ? searchParams.role
        : [searchParams.role];
      roles.forEach((role: string) =>
        queryParams.append("role", role)
      );
    }

    const endpoint = `/staff?${queryParams.toString()}`;

    const response: ApiResponse<PaginatedStaff> =
      await apiClient<PaginatedStaff>(endpoint);

    if (!response.success || !response.data) {
      return { data: null, error: response.message };
    }
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching initial employees:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch active offices for the create staff modal
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

// Fetch active roles for the create staff modal
async function getActiveRoles(): Promise<RoleDTO[]> {
  try {
    const response: ApiResponse<RoleDTO[]> = await apiClient<RoleDTO[]>("/role/active");

    if (!response.success || !response.data) {
      console.error("Failed to fetch roles:", response.message);
      return [];
    }

    console.log("Successfully fetched roles:", response.data.length);
    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

// Server Component (default)
export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  // Force dynamic rendering to access request headers (cookies)
  // This ensures the page can access the user's authentication cookies
  await headers();

  // Await searchParams (Next.js 15+ requirement)
  const resolvedSearchParams = await searchParams;

  // Fetch employees, offices, and roles in parallel
  const [employeesResult, offices, roles] = await Promise.all([
    getInitialEmployees(resolvedSearchParams),
    getActiveOffices(),
    getActiveRoles(),
  ]);

  // If backend is down or data fetch failed, show error UI instead of crashing
  if (!employeesResult.data) {
    return (
      <ErrorFallback
        title="Unable to Load Employees"
        message={employeesResult.error}
      />
    );
  }

  const initialData = employeesResult.data;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading employees..." />}>
          <EmployeesClient initialData={initialData} offices={offices} roles={roles} />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
