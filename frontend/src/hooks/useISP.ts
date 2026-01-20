"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getISP, createISP, updateISP, deleteISP } from "@/lib/api/ispApi";
import type { ISP, CreateISPDTO, UpdateISPDTO } from "@/types/isp";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ApiError } from "@/types/api";

/**
 * Custom hook for fetching ISP (Individual Service Plan) for a patient
 * 
 * @param patientId UUID of the patient
 * @param options React Query options including initialData
 * @returns React Query result with ISP data (or null if no ISP exists)
 */
export function useISP(
  patientId: string,
  options?: Omit<
    UseQueryOptions<ISP | null, ApiError, ISP | null, readonly unknown[]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<ISP | null, ApiError>({
    queryKey: ["isp", patientId] as const,
    queryFn: async () => {
      const response = await getISP(patientId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch ISP");
      }
      return response.data ?? null;
    },
    staleTime: 0, // Always refetch when invalidated
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    enabled: !!patientId, // Only fetch if patientId is provided
    ...options,
  });
}

/**
 * Custom hook for creating ISP
 * 
 * @returns Mutation for creating ISP
 */
export function useCreateISP() {
  const queryClient = useQueryClient();

  return useMutation<ISP, Error, { patientId: string; data: CreateISPDTO }>({
    mutationFn: async ({ patientId, data }) => {
      const response = await createISP(patientId, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to create ISP");
      }
      return response.data!;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch ISP data for the patient
      queryClient.invalidateQueries({ queryKey: ["isp", variables.patientId] });
    },
  });
}

/**
 * Custom hook for updating ISP
 * 
 * @returns Mutation for updating ISP
 */
export function useUpdateISP() {
  const queryClient = useQueryClient();

  return useMutation<ISP, Error, { ispId: string; data: UpdateISPDTO }>({
    mutationFn: async ({ ispId, data }) => {
      const response = await updateISP(ispId, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to update ISP");
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Invalidate and refetch ISP data for the patient
      queryClient.invalidateQueries({ queryKey: ["isp", data.patientId] });
    },
  });
}

/**
 * Custom hook for deleting ISP
 * 
 * @returns Mutation for deleting ISP
 */
export function useDeleteISP() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { ispId: string; patientId: string }>({
    mutationFn: async ({ ispId }) => {
      const response = await deleteISP(ispId);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete ISP");
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch ISP data for the patient
      queryClient.invalidateQueries({ queryKey: ["isp", variables.patientId] });
    },
  });
}
