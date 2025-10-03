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
  } = params;

  // Build query string
  const queryString = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir,
  }).toString();

  const endpoint = `/patients?${queryString}`;

  return useApiQuery<PaginatedPatients>(
    ["clients", page, size, sortBy, sortDir] as const,
    endpoint,
    {
      staleTime: 5000, // Data is fresh for 5 seconds
      ...options,
    }
  );
}
