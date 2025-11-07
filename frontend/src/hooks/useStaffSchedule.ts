"use client";

import { useApiQuery } from "./useApi";
import type { UseQueryOptions } from "@tanstack/react-query";
import { ApiError } from "@/types/api";
import type { ScheduleEventDTO } from "@/types/schedule";

export interface PatientSelectDTO {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  medicaidId?: string;
  clientId?: string;
}

export function useStaffScheduleEventsPaginated(
  staffId: string,
  params: { 
    from: string; 
    to: string; 
    status?: string;
    patientId?: string;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  },
  options?: Omit<
    UseQueryOptions<import("@/types/api").PaginatedResponse<ScheduleEventDTO>, ApiError, import("@/types/api").PaginatedResponse<ScheduleEventDTO>, readonly unknown[]>,
    "queryKey" | "queryFn"
  >
) {
  const search = new URLSearchParams({ 
    from: params.from, 
    to: params.to,
    page: String(params.page ?? 0),
    size: String(params.size ?? 25),
  });
  if (params.status) search.set("status", params.status);
  if (params.patientId) search.set("patientId", params.patientId);
  if (params.search) search.set("search", params.search);
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  
  const endpoint = `/staff/${staffId}/schedule/events?${search.toString()}`;
  return useApiQuery<import("@/types/api").PaginatedResponse<ScheduleEventDTO>>(
    ["staff-schedule-events-paginated", staffId, params] as const, 
    endpoint, 
    {
      enabled: !!staffId && !!params?.from && !!params?.to,
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      ...options,
    }
  );
}

export function useRelatedPatientsForStaff(staffId: string) {
  const endpoint = `/staff/${staffId}/schedule/related-patients`;
  return useApiQuery<PatientSelectDTO[]>(
    ["staff-related-patients", staffId] as const,
    endpoint,
    {
      enabled: !!staffId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000,
    }
  );
}

