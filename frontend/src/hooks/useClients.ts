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
    sortBy = "",
    sortDir = "asc",
    search,
    status,
    program,
    services,
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

  // Add optional program filters (can have multiple)
  if (program && program.length > 0) {
    program.forEach((p: string) => queryParams.append("program", p));
  }

  // Add optional services filters (can have multiple)
  if (services && services.length > 0) {
    services.forEach((s: string) => queryParams.append("services", s));
  }

  const endpoint = `/patients?${queryParams.toString()}`;

  return useApiQuery<PaginatedPatients>(
    ["clients", page, size, sortBy, sortDir, search, status, program, services] as const,
    endpoint,
    {
      staleTime: 60 * 1000, // Data is fresh for 60 seconds (matches server cache)
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      ...options,
    }
  );
}
