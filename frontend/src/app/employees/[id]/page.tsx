import { Suspense } from "react";
import { Metadata } from "next";
import StaffDetailClient from "./StaffDetailClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { StaffHeaderDTO, StaffPersonalDTO } from "@/types/staff";
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
    const headerResponse: ApiResponse<StaffHeaderDTO> =
      await apiClient<StaffHeaderDTO>(`/staff/${id}/header`);

    if (!headerResponse.success || !headerResponse.data) {
      return {
        title: "Staff Not Found | Blue Angels Care",
      };
    }

    return {
      title: `${headerResponse.data.staffName} | Blue Angels Care`,
      description: `Staff profile for ${headerResponse.data.staffName} - ${headerResponse.data.employeeId}`,
    };
  } catch {
    return {
      title: "Error | Blue Angels Care",
    };
  }
}

// Fetch Staff Header (Server Component)
async function getStaffHeader(
  staffId: string
): Promise<{ data: StaffHeaderDTO | null; error?: string }> {
  try {
    const response: ApiResponse<StaffHeaderDTO> =
      await apiClient<StaffHeaderDTO>(`/staff/${staffId}/header`);

    if (!response.success || !response.data) {
      return { data: null, error: response.message || "Staff not found" };
    }

    return { data: response.data };
  } catch (error) {
    console.error("Error fetching staff header:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch Staff Personal (Server Component)
async function getStaffPersonal(
  staffId: string
): Promise<{ data: StaffPersonalDTO | null; error?: string }> {
  try {
    const response: ApiResponse<StaffPersonalDTO> =
      await apiClient<StaffPersonalDTO>(`/staff/${staffId}/personal`);

    if (!response.success || !response.data) {
      return { data: null, error: response.message || "Staff personal not found" };
    }

    return { data: response.data };
  } catch (error) {
    console.error("Error fetching staff personal:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Staff Detail Page (Server Component - default)
export default async function StaffDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch header and personal data in parallel
  const [headerResult, personalResult] = await Promise.all([
    getStaffHeader(id),
    getStaffPersonal(id),
  ]);

  if (!headerResult.data) {
    return (
      <ErrorFallback
        title="Unable to Load Staff"
        message={headerResult.error}
      />
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense
          fallback={<LoadingFallback message="Loading staff details..." />}
        >
          <StaffDetailClient
            staffId={id}
            initialHeader={headerResult.data}
            initialPersonal={personalResult.data || undefined}
          />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
