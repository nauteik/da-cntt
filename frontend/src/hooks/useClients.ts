"use client";

import { useApiQuery } from "./useApi";
import type { PaginatedPatients, PatientQueryParams } from "@/types/patient";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ApiError } from "@/types/api";

/**
 * Custom hook for fetching paginated patients/clients list
 * Integrates with the backend /api/patients endpoint
 *
 * @param params Query parameters for pagination and sorting
 * @param options React Query options including initialData
 * @returns React Query result with patient data
 */
export function useClients(
  params: PatientQueryParams = {},
  options?: Omit<
    UseQueryOptions<
      PaginatedPatients,
      ApiError,
      PaginatedPatients,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  const {
    page = 0,
    size = 25,
    sortBy = "clientName",
    sortDir = "asc",
    search,
    status,
  } = params;

  // Build query string
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir,
  });

  // Add optional search parameter
  if (search) {
    queryParams.append("search", search);
  }

  // Add optional status filters (can have multiple)
  if (status && status.length > 0) {
    status.forEach((s: string) => queryParams.append("status", s));
  }

  const endpoint = `/patients?${queryParams.toString()}`;

  return useApiQuery<PaginatedPatients>(
    ["clients", page, size, sortBy, sortDir, search, status] as const,
    endpoint,
    {
      staleTime: 5000, // Data is fresh for 5 seconds
      ...options,
    }
  );
}
