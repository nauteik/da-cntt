"use client";

import { useApiQuery } from "./useApi";
import type { PatientFilterOptions } from "@/types/patientFilterOptions";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ApiError } from "@/types/api";

/**
 * Custom hook for fetching patient filter options
 * Fetches available programs and service types for filtering
 *
 * @param options React Query options
 * @returns React Query result with filter options
 */
export function usePatientFilterOptions(
  options?: Omit<
    UseQueryOptions<
      PatientFilterOptions,
      ApiError,
      PatientFilterOptions,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useApiQuery<PatientFilterOptions>(
    ["patientFilterOptions"] as const,
    "/patients/filter-options",
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes (filter options don't change often)
      gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
      ...options,
    }
  );
}
