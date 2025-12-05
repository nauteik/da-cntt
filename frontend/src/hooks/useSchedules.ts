"use client";

import { useApiQuery, useApiMutation } from "./useApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type {
  PaginatedScheduleEvents,
  ScheduleQueryParams,
  CreateSchedulePreviewRequestDTO,
  CreateSchedulePreviewResponseDTO,
  CreateScheduleBatchRequestDTO,
  ScheduleEventDTO,
  UpdateScheduleEventDTO,
} from "@/types/schedule";

/**
 * Hook to fetch paginated schedule events with filters.
 */
export function useSchedules(
  params: ScheduleQueryParams,
  options?: {
    initialData?: PaginatedScheduleEvents;
    enabled?: boolean;
  }
) {
  const queryParams = new URLSearchParams();
  queryParams.append("from", params.from);
  queryParams.append("to", params.to);
  queryParams.append("page", String(params.page || 0));
  queryParams.append("size", String(params.size || 25));

  if (params.patientId) queryParams.append("patientId", params.patientId);
  if (params.staffId) queryParams.append("staffId", params.staffId);
  if (params.status) queryParams.append("status", params.status);
  if (params.search) queryParams.append("search", params.search);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortDir) queryParams.append("sortDir", params.sortDir);

  const endpoint = `/schedules?${queryParams.toString()}`;

  return useApiQuery<PaginatedScheduleEvents>(
    ["schedules", params],
    endpoint,
    {
      initialData: options?.initialData,
      enabled: options?.enabled,
      staleTime: 30000, // Consider data fresh for 30 seconds
    }
  );
}

/**
 * Hook to create a schedule preview with conflict detection.
 */
export function useCreateSchedulePreview() {
  return useApiMutation<CreateSchedulePreviewResponseDTO, CreateSchedulePreviewRequestDTO>(
    "/schedules/preview",
    "POST"
  );
}

/**
 * Hook to create schedule events (after preview confirmation).
 */
export function useCreateScheduleEvents() {
  const queryClient = useQueryClient();

  return useApiMutation<ScheduleEventDTO[], CreateScheduleBatchRequestDTO>(
    "/schedules",
    "POST",
    {
      onSuccess: () => {
        // Invalidate all schedule queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ["schedules"] });
      },
    }
  );
}

/**
 * Hook to fetch a single schedule event by ID.
 */
export function useScheduleEvent(eventId: string, options?: { enabled?: boolean }) {
  return useApiQuery<ScheduleEventDTO>(
    ["schedule", eventId],
    `/schedules/${eventId}`,
    {
      enabled: options?.enabled !== false && !!eventId,
      staleTime: 30000,
    }
  );
}

/**
 * Hook to update a schedule event.
 * Returns a mutation function that takes { eventId, data }.
 */
export function useUpdateScheduleEvent() {
  const queryClient = useQueryClient();

  return useMutation<
    ScheduleEventDTO,
    Error,
    { eventId: string; data: UpdateScheduleEventDTO }
  >({
    mutationFn: async ({ eventId, data }) => {
      const response: ApiResponse<ScheduleEventDTO> = await apiClient<ScheduleEventDTO>(
        `/schedules/${eventId}`,
        {
          method: "PUT",
          body: data,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update schedule event");
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
}


