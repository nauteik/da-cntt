"use client";

import { useApiQuery, useApiMutation } from "./useApi";
import { useMutation } from "@tanstack/react-query";
import type { UseQueryOptions } from "@tanstack/react-query";
import { ApiError } from "@/types/api";
import type { TemplateEventDTO, ScheduleEventDTO, ScheduleTemplateDTO, ScheduleTemplateWeeksDTO, CreateScheduleTemplateDTO } from "@/types/schedule";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";

export function usePatientTemplateWithWeeks(
  patientId: string,
  options?: Omit<
    UseQueryOptions<ScheduleTemplateWeeksDTO | null, ApiError, ScheduleTemplateWeeksDTO | null, readonly unknown[]>,
    "queryKey" | "queryFn"
  >
) {
  const endpoint = `/patients/${patientId}/schedule/template`;
  return useApiQuery<ScheduleTemplateWeeksDTO | null>(["patient-template-with-weeks", patientId] as const, endpoint, {
    enabled: !!patientId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePatientScheduleEvents(
  patientId: string,
  params: { from: string; to: string; status?: string },
  options?: Omit<
    UseQueryOptions<ScheduleEventDTO[], ApiError, ScheduleEventDTO[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >
) {
  const search = new URLSearchParams({ from: params.from, to: params.to });
  if (params.status) search.set("status", params.status);
  const endpoint = `/patients/${patientId}/schedule/events?${search.toString()}`;
  return useApiQuery<ScheduleEventDTO[]>(["patient-schedule-events", patientId, params] as const, endpoint, {
    enabled: !!patientId && !!params?.from && !!params?.to,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePatientScheduleEventsPaginated(
  patientId: string,
  params: { 
    from: string; 
    to: string; 
    status?: string;
    staffId?: string;
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
  if (params.staffId) search.set("staffId", params.staffId);
  if (params.search) search.set("search", params.search);
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  
  const endpoint = `/patients/${patientId}/schedule/events/paginated?${search.toString()}`;
  return useApiQuery<import("@/types/api").PaginatedResponse<ScheduleEventDTO>>(
    ["patient-schedule-events-paginated", patientId, params] as const, 
    endpoint, 
    {
      enabled: !!patientId && !!params?.from && !!params?.to,
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      ...options,
    }
  );
}

export function useCreateTemplateEvent(patientId: string) {
  return useApiMutation<TemplateEventDTO[]>(`/patients/${patientId}/schedule/template/events`, "POST");
}

export function useDeleteTemplateEvent(patientId: string, eventId: string) {
  return useApiMutation<TemplateEventDTO[]>(`/patients/${patientId}/schedule/template/events/${eventId}`, "DELETE");
}

export function useCreateTemplate(patientId: string) {
  return useApiMutation<ScheduleTemplateDTO, CreateScheduleTemplateDTO>(`/patients/${patientId}/schedule/template`, "POST");
}

export function useAddWeek(patientId: string) {
  return useMutation<ScheduleTemplateDTO, ApiError, { weekIndex: number }>({
    mutationFn: async ({ weekIndex }) => {
      const endpoint = `/patients/${patientId}/schedule/template/weeks?weekIndex=${weekIndex}`;
      const response: ApiResponse<ScheduleTemplateDTO> = await apiClient<ScheduleTemplateDTO>(endpoint, {
        method: "POST",
      });
      if (!response.success) {
        throw new ApiError(response);
      }
      return response.data!;
    },
  });
}

export function useDeleteWeek(patientId: string) {
  return useMutation<void, ApiError, { weekIndex: number }>({
    mutationFn: async ({ weekIndex }) => {
      const endpoint = `/patients/${patientId}/schedule/template/weeks/${weekIndex}`;
      const response: ApiResponse<void> = await apiClient<void>(endpoint, {
        method: "DELETE",
      });
      if (!response.success) {
        throw new ApiError(response);
      }
    },
  });
}

export function useDeleteTemplate(patientId: string) {
  return useMutation<void, ApiError, void>({
    mutationFn: async () => {
      const endpoint = `/patients/${patientId}/schedule/template`;
      const response: ApiResponse<void> = await apiClient<void>(endpoint, {
        method: "DELETE",
      });
      if (!response.success) {
        throw new ApiError(response);
      }
    },
  });
}

export function useGenerateSchedule(patientId: string) {
  return useMutation<number, ApiError, { endDate: string }>({
    mutationFn: async ({ endDate }) => {
      const endpoint = `/patients/${patientId}/schedule/generate`;
      const response: ApiResponse<number> = await apiClient<number>(endpoint, {
        method: "POST",
        body: { endDate },
      });
      if (!response.success) {
        throw new ApiError(response);
      }
      return response.data ?? 0;
    },
  });
}

export function useRelatedStaffForPatient(patientId: string) {
  const endpoint = `/patients/${patientId}/schedule/related-staff`;
  return useApiQuery<import("@/types/staff").StaffSelectDTO[]>(
    ["patient-related-staff", patientId] as const,
    endpoint,
    {
      enabled: !!patientId,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000,
    }
  );
}


