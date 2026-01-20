"use client";

import { useApiQuery } from "./useApi";
import type { HouseDTO, PatientHouseStayDTO } from "@/types/house";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ApiError } from "@/types/api";

/**
 * Custom hook for fetching house detail information
 * Integrates with the backend /api/house/{id} endpoint
 *
 * @param houseId UUID of the house
 * @param options React Query options including initialData
 * @returns React Query result with house data
 */
export function useHouseDetail(
  houseId: string,
  options?: Omit<
    UseQueryOptions<HouseDTO, ApiError, HouseDTO, readonly unknown[]>,
    "queryKey" | "queryFn"
  >
) {
  const endpoint = `/house/${houseId}`;

  return useApiQuery<HouseDTO>(
    ["house-detail", houseId] as const,
    endpoint,
    {
      staleTime: 0, // Always refetch when invalidated (no stale time)
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      enabled: !!houseId, // Only fetch if houseId is provided
      ...options,
    }
  );
}

/**
 * Custom hook for fetching house stay history
 * Integrates with the backend /api/house/{id}/stays endpoint
 *
 * @param houseId UUID of the house
 * @param options React Query options including initialData
 * @returns React Query result with house stays data
 */
export function useHouseStays(
  houseId: string,
  options?: Omit<
    UseQueryOptions<
      PatientHouseStayDTO[],
      ApiError,
      PatientHouseStayDTO[],
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  const endpoint = `/house/${houseId}/stays`;
  return useApiQuery<PatientHouseStayDTO[]>(
    ["house-stays", houseId] as const,
    endpoint,
    {
      staleTime: 0, // Always refetch when invalidated (no stale time)
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      enabled: !!houseId, // Only fetch if houseId is provided
      ...options,
    }
  );
}

