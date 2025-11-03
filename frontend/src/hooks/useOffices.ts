"use client";

import { useApiQuery, useApiMutation } from "./useApi";
import type {
  OfficeDTO,
  OfficeDetailResponse,
  OfficeStaffDTO,
  OfficePatientDTO,
  OfficeCreateRequest,
  OfficeUpdateRequest,
} from "@/types/office";
import type { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import type { ApiError, ApiResponse } from "@/types/api";

/**
 * Fetch all offices (including inactive)
 */
export function useOffices(
  options?: Omit<
    UseQueryOptions<OfficeDTO[], ApiError, OfficeDTO[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >
) {
  return useApiQuery<OfficeDTO[]>(
    ["offices"] as const,
    "/office",
    {
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      ...options,
    }
  );
}

/**
 * Fetch active offices only
 */
export function useActiveOffices(
  options?: Omit<
    UseQueryOptions<OfficeDTO[], ApiError, OfficeDTO[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >
) {
  return useApiQuery<OfficeDTO[]>(
    ["offices", "active"] as const,
    "/office/active",
    {
      staleTime: 5 * 60 * 1000,
      ...options,
    }
  );
}

/**
 * Fetch office by ID with full details
 */
export function useOfficeDetail(
  id: string | null,
  options?: Omit<
    UseQueryOptions<
      OfficeDetailResponse,
      ApiError,
      OfficeDetailResponse,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useApiQuery<OfficeDetailResponse>(
    ["office", id] as const,
    `/office/${id}`,
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
      ...options,
    }
  );
}

/**
 * Fetch office by code
 */
export function useOfficeByCode(
  code: string | null,
  options?: Omit<
    UseQueryOptions<
      OfficeDetailResponse,
      ApiError,
      OfficeDetailResponse,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useApiQuery<OfficeDetailResponse>(
    ["office", "code", code] as const,
    `/office/code/${code}`,
    {
      enabled: !!code,
      staleTime: 2 * 60 * 1000,
      ...options,
    }
  );
}

/**
 * Fetch staff members of an office
 */
export function useOfficeStaff(
  officeId: string | null,
  activeOnly: boolean = false,
  options?: Omit<
    UseQueryOptions<
      OfficeStaffDTO[],
      ApiError,
      OfficeStaffDTO[],
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useApiQuery<OfficeStaffDTO[]>(
    ["office", officeId, "staff", activeOnly] as const,
    `/office/${officeId}/staff?activeOnly=${activeOnly}`,
    {
      enabled: !!officeId,
      staleTime: 60 * 1000,
      ...options,
    }
  );
}

/**
 * Fetch patients of an office
 */
export function useOfficePatients(
  officeId: string | null,
  activeOnly: boolean = false,
  options?: Omit<
    UseQueryOptions<
      OfficePatientDTO[],
      ApiError,
      OfficePatientDTO[],
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useApiQuery<OfficePatientDTO[]>(
    ["office", officeId, "patients", activeOnly] as const,
    `/office/${officeId}/patients?activeOnly=${activeOnly}`,
    {
      enabled: !!officeId,
      staleTime: 60 * 1000,
      ...options,
    }
  );
}

/**
 * Create a new office
 */
export function useCreateOffice(
  options?: UseMutationOptions<OfficeDetailResponse, ApiError, OfficeCreateRequest>
) {
  return useApiMutation<OfficeDetailResponse, OfficeCreateRequest>(
    "/office",
    "POST",
    options
  );
}

/**
 * Update an existing office
 */
export function useUpdateOffice(
  officeId: string,
  options?: UseMutationOptions<OfficeDetailResponse, ApiError, OfficeUpdateRequest>
) {
  return useApiMutation<OfficeDetailResponse, OfficeUpdateRequest>(
    `/office/${officeId}`,
    "PUT",
    options
  );
}

/**
 * Delete an office (soft delete)
 */
export function useDeleteOffice(
  officeId: string,
  options?: UseMutationOptions<void, ApiError, void>
) {
  return useApiMutation<void, void>(
    `/office/${officeId}`,
    "DELETE",
    options
  );
}

/**
 * Activate an office
 */
export function useActivateOffice(
  officeId: string,
  options?: UseMutationOptions<void, ApiError, void>
) {
  return useApiMutation<void, void>(
    `/office/${officeId}/activate`,
    "PUT",
    options
  );
}

/**
 * Deactivate an office
 */
export function useDeactivateOffice(
  officeId: string,
  options?: UseMutationOptions<void, ApiError, void>
) {
  return useApiMutation<void, void>(
    `/office/${officeId}/deactivate`,
    "PUT",
    options
  );
}
