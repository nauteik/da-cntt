"use client";

import { useApiQuery } from "./useApi";
import type { StaffHeaderDTO, StaffPersonalDTO } from "@/types/staff";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ApiError } from "@/types/api";

/**
 * Custom hook for fetching staff header information
 * Integrates with the backend /api/staff/{id}/header endpoint
 *
 * @param staffId UUID of the staff member
 * @param options React Query options including initialData
 * @returns React Query result with staff header data
 */
export function useStaffHeader(
  staffId: string,
  options?: Omit<
    UseQueryOptions<
      StaffHeaderDTO,
      ApiError,
      StaffHeaderDTO,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  const endpoint = `/staff/${staffId}/header`;

  return useApiQuery<StaffHeaderDTO>(
    ["staff-header", staffId] as const,
    endpoint,
    {
      staleTime: 0, // Always refetch when invalidated (no stale time)
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      enabled: !!staffId, // Only fetch if staffId is provided
      ...options,
    }
  );
}

/**
 * Custom hook for fetching staff personal information
 * Integrates with the backend /api/staff/{id}/personal endpoint
 *
 * @param staffId UUID of the staff member
 * @param options React Query options including initialData
 * @returns React Query result with staff personal data
 */
export function useStaffPersonal(
  staffId: string,
  options?: Omit<
    UseQueryOptions<
      StaffPersonalDTO,
      ApiError,
      StaffPersonalDTO,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  const endpoint = `/staff/${staffId}/personal`;

  return useApiQuery<StaffPersonalDTO>(
    ["staff-personal", staffId] as const,
    endpoint,
    {
      staleTime: 0, // Always refetch when invalidated (no stale time)
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      enabled: !!staffId, // Only fetch if staffId is provided
      ...options,
    }
  );
}
