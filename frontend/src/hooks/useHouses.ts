"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { houseApi } from "@/lib/api/house";
import type {
  HouseDTO,
  PaginatedHouses,
  HouseCreateRequest,
  HouseUpdateRequest,
  AssignPatientRequest,
  UnassignPatientRequest,
  PatientHouseStayDTO,
  HouseSearchParams,
} from "@/types/house";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import type { ApiError } from "@/types/api";

/**
 * Custom hook for fetching paginated houses list
 */
export function useHouses(
  params: HouseSearchParams = {},
  options?: Omit<
    UseQueryOptions<
      PaginatedHouses,
      ApiError,
      PaginatedHouses,
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
    officeId,
  } = params;

  return useQuery<PaginatedHouses, ApiError, PaginatedHouses, readonly unknown[]>({
    queryKey: ["houses", page, size, sortBy, sortDir, search, officeId] as const,
    queryFn: () => houseApi.getHouses(params),
    staleTime: 60 * 1000, // Data is fresh for 60 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    ...options,
  });
}

/**
 * Fetch house by ID
 */
export function useHouse(
  id: string | null,
  options?: Omit<
    UseQueryOptions<HouseDTO, ApiError, HouseDTO, readonly unknown[]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<HouseDTO, ApiError, HouseDTO, readonly unknown[]>({
    queryKey: ["house", id] as const,
    queryFn: () => houseApi.getHouseById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Create a new house
 */
export function useCreateHouse(
  options?: UseMutationOptions<HouseDTO, ApiError, HouseCreateRequest>
) {
  const queryClient = useQueryClient();
  
  return useMutation<HouseDTO, ApiError, HouseCreateRequest>({
    mutationFn: (request: HouseCreateRequest) => houseApi.createHouse(request),
    onSuccess: () => {
      // Invalidate houses list to refetch
      queryClient.invalidateQueries({ queryKey: ["houses"] });
    },
    ...options,
  });
}

/**
 * Update an existing house
 */
export function useUpdateHouse(
  options?: UseMutationOptions<HouseDTO, ApiError, { id: string; request: HouseUpdateRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation<HouseDTO, ApiError, { id: string; request: HouseUpdateRequest }>({
    mutationFn: ({ id, request }) => houseApi.updateHouse(id, request),
    onSuccess: (data) => {
      // Invalidate houses list and specific house
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      queryClient.invalidateQueries({ queryKey: ["house", data.id] });
    },
    ...options,
  });
}

/**
 * Delete a house (soft delete)
 */
export function useDeleteHouse(
  options?: UseMutationOptions<void, ApiError, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation<void, ApiError, string>({
    mutationFn: (id: string) => houseApi.deleteHouse(id),
    onSuccess: (_, id) => {
      // Invalidate houses list and specific house
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      queryClient.invalidateQueries({ queryKey: ["house", id] });
    },
    ...options,
  });
}

/**
 * Assign a patient to a house
 */
export function useAssignPatientToHouse(
  options?: UseMutationOptions<
    PatientHouseStayDTO,
    ApiError,
    { houseId: string; request: AssignPatientRequest }
  >
) {
  const queryClient = useQueryClient();
  
  return useMutation<
    PatientHouseStayDTO,
    ApiError,
    { houseId: string; request: AssignPatientRequest }
  >({
    mutationFn: ({ houseId, request }) =>
      houseApi.assignPatientToHouse(houseId, request),
    onSuccess: (data) => {
      // Invalidate houses list and specific house
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      queryClient.invalidateQueries({ queryKey: ["house", data.houseId] });
      queryClient.invalidateQueries({
        queryKey: ["patientStays", data.patientId],
      });
    },
    ...options,
  });
}

/**
 * Unassign a patient from a house
 */
export function useUnassignPatientFromHouse(
  options?: UseMutationOptions<
    PatientHouseStayDTO,
    ApiError,
    { stayId: string; request: UnassignPatientRequest }
  >
) {
  const queryClient = useQueryClient();
  
  return useMutation<
    PatientHouseStayDTO,
    ApiError,
    { stayId: string; request: UnassignPatientRequest }
  >({
    mutationFn: ({ stayId, request }) =>
      houseApi.unassignPatientFromHouse(stayId, request),
    onSuccess: (data) => {
      // Invalidate houses list and specific house
      queryClient.invalidateQueries({ queryKey: ["houses"] });
      queryClient.invalidateQueries({ queryKey: ["house", data.houseId] });
      queryClient.invalidateQueries({
        queryKey: ["patientStays", data.patientId],
      });
    },
    ...options,
  });
}

/**
 * Get all stays for a patient
 */
export function usePatientStays(
  patientId: string | null,
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
  return useQuery<
    PatientHouseStayDTO[],
    ApiError,
    PatientHouseStayDTO[],
    readonly unknown[]
  >({
    queryKey: ["patientStays", patientId] as const,
    queryFn: () => houseApi.getPatientStays(patientId!),
    enabled: !!patientId,
    staleTime: 60 * 1000,
    ...options,
  });
}




