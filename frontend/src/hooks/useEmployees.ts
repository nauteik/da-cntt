"use client";

import { useApiQuery } from "./useApi";
import type { PaginatedStaff, StaffQueryParams } from "@/types/staff";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ApiError } from "@/types/api";

/**
 * Custom hook for fetching paginated staff/employees list
 * Integrates with the backend /api/staff endpoint
 *
 * @param params Query parameters for pagination and sorting
 * @param options React Query options including initialData
 * @returns React Query result with staff data
 */
export function useEmployees(
  params: StaffQueryParams = {},
  options?: Omit<
    UseQueryOptions<
      PaginatedStaff,
      ApiError,
      PaginatedStaff,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  const {
    page = 0,
    size = 25,
    sortBy = "",
    sortDir = "asc",
    search,
    status,
  } = params;

  // Build query string
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  // Only add sort params if sortBy is provided
  if (sortBy) {
    queryParams.append("sortBy", sortBy);
    queryParams.append("sortDir", sortDir);
  }

  // Add optional search parameter
  if (search) {
    queryParams.append("search", search);
  }

  // Add optional status filters (can have multiple)
  if (status && status.length > 0) {
    status.forEach((s: string) => queryParams.append("status", s));
  }

  const endpoint = `/staff?${queryParams.toString()}`;

  return useApiQuery<PaginatedStaff>(
    ["employees", page, size, sortBy, sortDir, search, status] as const,
    endpoint,
    {
      staleTime: 60 * 1000, // Data is fresh for 60 seconds (matches server cache)
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      ...options,
    }
  );
}
