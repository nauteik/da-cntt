import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import EditScheduleClient from "./EditScheduleClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { ScheduleEventDTO } from "@/types/schedule";
import type { PatientSelectDTO, StaffSelectDTO } from "@/types/patient";
import LoadingFallback from "@/components/common/LoadingFallback";
import ErrorFallback from "@/components/common/ErrorFallback";

interface EditSchedulePageProps {
  params: Promise<{ id: string }>;
}

// Server Component - Fetches initial event data
async function getScheduleEvent(
  eventId: string
): Promise<{ data: ScheduleEventDTO | null; error?: string }> {
  try {
    const response: ApiResponse<ScheduleEventDTO> =
      await apiClient<ScheduleEventDTO>(`/schedules/${eventId}`);

    if (!response.success || !response.data) {
      return { data: null, error: response.message || "Schedule event not found" };
    }
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching schedule event:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch patient select options
async function getPatientSelectOptions(): Promise<PatientSelectDTO[]> {
  try {
    const response: ApiResponse<PatientSelectDTO[]> =
      await apiClient<PatientSelectDTO[]>("/patients/select");

    if (!response.success || !response.data) {
      console.error("Failed to fetch patients:", response.message);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

// Fetch staff select options
async function getStaffSelectOptions(): Promise<StaffSelectDTO[]> {
  try {
    const response: ApiResponse<StaffSelectDTO[]> =
      await apiClient<StaffSelectDTO[]>("/staff/select");

    if (!response.success || !response.data) {
      console.error("Failed to fetch staff:", response.message);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
}

// Server Component (default)
export default async function EditSchedulePage({ params }: EditSchedulePageProps) {
  // Force dynamic rendering to access request headers (cookies)
  await headers();

  // Await params (Next.js 15+ requirement)
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  // Fetch event data, patients, and staff in parallel
  const [eventResult, patients, staff] = await Promise.all([
    getScheduleEvent(eventId),
    getPatientSelectOptions(),
    getStaffSelectOptions(),
  ]);

  // If event not found, show 404
  if (!eventResult.data) {
    if (eventResult.error?.includes("not found")) {
      notFound();
    }
    return (
      <ErrorFallback
        title="Unable to Load Schedule Event"
        message={eventResult.error}
      />
    );
  }

  const eventData = eventResult.data;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading schedule event..." />}>
          <EditScheduleClient
            initialEvent={eventData}
            patients={patients}
            staff={staff}
          />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}

