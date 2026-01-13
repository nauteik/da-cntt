"use client";

import { useApiQuery } from "./useApi";
import type { PatientHeaderDTO, PatientPersonalDTO, PatientProgramDTO } from "@/types/patient";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ApiError } from "@/types/api";

/**
 * Custom hook for fetching patient header information
 * Integrates with the backend /api/patients/{id}/header endpoint
 *
 * @param patientId UUID of the patient
 * @param options React Query options including initialData
 * @returns React Query result with patient header data
 */
export function usePatientHeader(
  patientId: string,
  options?: Omit<
    UseQueryOptions<
      PatientHeaderDTO,
      ApiError,
      PatientHeaderDTO,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  const endpoint = `/patients/${patientId}/header`;

  return useApiQuery<PatientHeaderDTO>(
    ["patient-header", patientId] as const,
    endpoint,
    {
      staleTime: 60 * 1000, // Trust SSR data for 1 minute, don't refetch immediately
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      enabled: !!patientId, // Only fetch if patientId is provided
      ...options,
    }
  );
}

/**
 * Custom hook for fetching patient personal information
 * Integrates with the backend /api/patients/{id}/personal endpoint
 *
 * @param patientId UUID of the patient
 * @param options React Query options including initialData
 * @returns React Query result with patient personal data
 */
export function usePatientPersonal(
  patientId: string,
  options?: Omit<
    UseQueryOptions<
      PatientPersonalDTO,
      ApiError,
      PatientPersonalDTO,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  const endpoint = `/patients/${patientId}/personal`;
  return useApiQuery<PatientPersonalDTO>(
    ["patient-personal", patientId] as const,
    endpoint,
    {
      staleTime: 60 * 1000, // Trust SSR data for 1 minute, don't refetch immediately
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      enabled: !!patientId, // Only fetch if patientId is provided
      ...options,
    }
  );
}

/**
 * Custom hook for fetching patient program information
 * Integrates with the backend /api/patients/{id}/program endpoint
 *
 * @param patientId UUID of the patient
 * @param options React Query options including initialData
 * @returns React Query result with patient program data
 */
export function usePatientProgram(
  patientId: string,
  options?: Omit<
    UseQueryOptions<
      PatientProgramDTO,
      ApiError,
      PatientProgramDTO,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  const endpoint = `/patients/${patientId}/program`;
  return useApiQuery<PatientProgramDTO>(
    ["patient-program", patientId] as const,
    endpoint,
    {
      staleTime: 60 * 1000, // Trust SSR data for 1 minute, don't refetch immediately
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      enabled: !!patientId, // Only fetch if patientId is provided
      ...options,
    }
  );
}
