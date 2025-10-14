import { Suspense } from "react";
import { Metadata } from "next";
import PatientDetailClient from "./PatientDetailClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { PatientHeaderDTO, PatientPersonalDTO } from "@/types/patient";
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
      await apiClient<PatientHeaderDTO>(`/patients/${id}/header`, {
        revalidate: 60,
      });

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
      await apiClient<PatientHeaderDTO>(`/patients/${patientId}/header`, {
        revalidate: 60, // Revalidate every 60 seconds
      });

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
      await apiClient<PatientPersonalDTO>(`/patients/${patientId}/personal`, {
        revalidate: 60, // Revalidate every 60 seconds
      });

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

// Patient Detail Page (Server Component - default)
export default async function PatientDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch both header and personal data in parallel for better performance
  const [headerResult, personalResult] = await Promise.all([
    getPatientHeader(id),
    getPatientPersonal(id),
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
          />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
