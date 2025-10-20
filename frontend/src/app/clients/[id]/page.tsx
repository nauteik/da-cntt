import { Suspense } from "react";
import { Metadata } from "next";
import PatientDetailClient from "./PatientDetailClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { PatientHeaderDTO, PatientPersonalDTO, PatientProgramDTO } from "@/types/patient";
import LoadingFallback from "@/components/common/LoadingFallback";
import ErrorFallback from "@/components/common/ErrorFallback";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const headerResponse: ApiResponse<PatientHeaderDTO> =
      await apiClient<PatientHeaderDTO>(`/patients/${id}/header`);

    if (!headerResponse.success || !headerResponse.data) {
      return {
        title: "Patient Not Found | Blue Angels Care",
      };
    }

    return {
      title: `${headerResponse.data.clientName} | Blue Angels Care`,
      description: `Patient profile for ${headerResponse.data.clientName} - ${headerResponse.data.medicaidId}`,
    };
  } catch {
    return {
      title: "Error | Blue Angels Care",
    };
  }
}

// Fetch Patient Header (Server Component)
async function getPatientHeader(
  patientId: string
): Promise<{ data: PatientHeaderDTO | null; error?: string }> {
  try {
    const response: ApiResponse<PatientHeaderDTO> =
      await apiClient<PatientHeaderDTO>(`/patients/${patientId}/header`);

    if (!response.success || !response.data) {
      return { data: null, error: response.message || "Patient not found" };
    }

    return { data: response.data };
  } catch (error) {
    console.error("Error fetching patient header:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch Patient Personal Details (Server Component)
async function getPatientPersonal(
  patientId: string
): Promise<{ data: PatientPersonalDTO | null; error?: string }> {
  try {
    const response: ApiResponse<PatientPersonalDTO> =
      await apiClient<PatientPersonalDTO>(`/patients/${patientId}/personal`);

    if (!response.success || !response.data) {
      return {
        data: null,
        error: response.message || "Patient personal data not found",
      };
    }

    return { data: response.data };
  } catch (error) {
    console.error("Error fetching patient personal data:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch Patient Program Details (Server Component)
async function getPatientProgram(
  patientId: string
): Promise<{ data: PatientProgramDTO | null; error?: string }> {
  try {
    const response: ApiResponse<PatientProgramDTO> =
      await apiClient<PatientProgramDTO>(`/patients/${patientId}/program`);

    if (!response.success || !response.data) {
      return {
        data: null,
        error: response.message || "Patient program data not found",
      };
    }

    return { data: response.data };
  } catch (error) {
    console.error("Error fetching patient program data:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Patient Detail Page (Server Component - default)
export default async function PatientDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch header, personal, and program data in parallel for better performance
  const [headerResult, personalResult, programResult] = await Promise.all([
    getPatientHeader(id),
    getPatientPersonal(id),
    getPatientProgram(id),
  ]);

  if (!headerResult.data) {
    return (
      <ErrorFallback
        title="Unable to Load Clients"
        message={headerResult.error}
      />
    );
  }
  // If personal data fetch failed, show error UI
  if (!personalResult.data) {
    return <ErrorFallback title={personalResult.error} />;
  }
  // Program data is optional - if it fails, we still show the page
  // The error will be displayed only in the Program tab

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense
          fallback={<LoadingFallback message="Loading patient details..." />}
        >
          <PatientDetailClient
            patientId={id}
            initialHeader={headerResult.data}
            initialPersonal={personalResult.data}
            initialProgram={programResult.data || undefined}
          />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
