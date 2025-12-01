import { Suspense } from "react";
import { headers } from "next/headers";
import ScheduleClient from "./ScheduleClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { PaginatedScheduleEvents } from "@/types/schedule";
import type { PatientSelectDTO, StaffSelectDTO } from "@/types/patient";
import LoadingFallback from "@/components/common/LoadingFallback";
import ErrorFallback from "@/components/common/ErrorFallback";

interface SearchParams {
  page?: string;
  size?: string;
  from?: string;
  to?: string;
  patientId?: string;
  staffId?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}

interface SchedulePageProps {
  searchParams: Promise<SearchParams>;
}

// Server Component - Fetches initial data with error handling
async function getInitialScheduleEvents(
  searchParams: SearchParams
): Promise<{ data: PaginatedScheduleEvents | null; error?: string }> {
  try {
    // Calculate default date range: 7 days from today
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    const from = searchParams.from || today.toISOString().split("T")[0];
    const to = searchParams.to || oneWeekLater.toISOString().split("T")[0];

    // URL uses 1-based pagination, backend uses 0-based
    const urlPage = searchParams.page || "1";
    const backendPage = String(Math.max(0, parseInt(urlPage, 10) - 1));
    const size = searchParams.size || "25";
    const sortBy = searchParams.sortBy || "";
    const sortDir = searchParams.sortDir || "asc";

    // Build query string
    const queryParams = new URLSearchParams({
      from,
      to,
      page: backendPage,
      size,
    });

    if (sortBy) {
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortDir", sortDir);
    }

    if (searchParams.patientId) {
      queryParams.append("patientId", searchParams.patientId);
    }

    if (searchParams.staffId) {
      queryParams.append("staffId", searchParams.staffId);
    }

    if (searchParams.status) {
      queryParams.append("status", searchParams.status);
    }

    if (searchParams.search) {
      queryParams.append("search", searchParams.search);
    }

    const endpoint = `/schedules?${queryParams.toString()}`;

    const response: ApiResponse<PaginatedScheduleEvents> =
      await apiClient<PaginatedScheduleEvents>(endpoint);

    if (!response.success || !response.data) {
      return { data: null, error: response.message };
    }
    return { data: response.data };
  } catch (error) {
    console.error("Error fetching initial schedule events:", error);
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
export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  // Force dynamic rendering to access request headers (cookies)
  await headers();

  // Await searchParams (Next.js 15+ requirement)
  const resolvedSearchParams = await searchParams;

  // Fetch schedule events, patients, and staff in parallel
  const [scheduleResult, patients, staff] = await Promise.all([
    getInitialScheduleEvents(resolvedSearchParams),
    getPatientSelectOptions(),
    getStaffSelectOptions(),
  ]);

  // If backend is down or data fetch failed, show error UI
  if (!scheduleResult.data) {
    return (
      <ErrorFallback
        title="Unable to Load Schedule"
        message={scheduleResult.error}
      />
    );
  }

  const initialData = scheduleResult.data;

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading schedule..." />}>
          <ScheduleClient
            initialData={initialData}
            patients={patients}
            staff={staff}
          />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}

