import { useQuery } from "@tanstack/react-query";
import { dailyNoteApi } from "@/lib/api/dailyNoteApi";

/**
 * Hook to fetch daily notes for a specific patient
 */
export function usePatientDailyNotes(
  patientId: string,
  page: number = 0,
  size: number = 20
) {
  return useQuery({
    queryKey: ["patient", patientId, "dailyNotes", page, size],
    queryFn: () => dailyNoteApi.getDailyNotesByPatient(patientId, page, size),
    staleTime: 30000, // 30 seconds
    enabled: !!patientId,
  });
}

/**
 * Hook to fetch a single daily note by ID
 */
export function useDailyNote(dailyNoteId: string) {
  return useQuery({
    queryKey: ["dailyNote", dailyNoteId],
    queryFn: () => dailyNoteApi.getDailyNoteById(dailyNoteId),
    staleTime: 60000, // 1 minute
    enabled: !!dailyNoteId,
  });
}
