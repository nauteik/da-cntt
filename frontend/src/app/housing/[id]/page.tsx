import { Suspense } from "react";
import { Metadata } from "next";
import HouseDetailClient from "./HouseDetailClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { HouseDTO, PatientHouseStayDTO } from "@/types/house";
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
    const houseResponse: ApiResponse<HouseDTO> =
      await apiClient<HouseDTO>(`/house/${id}`);

    if (!houseResponse.success || !houseResponse.data) {
      return {
        title: "House Not Found | Blue Angels Care",
      };
    }

    return {
      title: `${houseResponse.data.name} | Blue Angels Care`,
      description: `House profile for ${houseResponse.data.name} - ${houseResponse.data.code}`,
    };
  } catch {
    return {
      title: "Error | Blue Angels Care",
    };
  }
}

// Fetch House Detail (Server Component)
async function getHouseDetail(
  houseId: string
): Promise<{ data: HouseDTO | null; error?: string }> {
  try {
    const response: ApiResponse<HouseDTO> =
      await apiClient<HouseDTO>(`/house/${houseId}`);

    if (!response.success || !response.data) {
      return { data: null, error: response.message || "House not found" };
    }

    return { data: response.data };
  } catch (error) {
    console.error("Error fetching house detail:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch House Stays (Server Component) - Optional, can be lazy loaded
async function getHouseStays(
  houseId: string
): Promise<{ data: PatientHouseStayDTO[] | null; error?: string }> {
  try {
    const response: ApiResponse<PatientHouseStayDTO[]> =
      await apiClient<PatientHouseStayDTO[]>(`/house/${houseId}/stays`);

    if (!response.success || !response.data) {
      return {
        data: null,
        error: response.message || "House stays not found",
      };
    }

    return { data: response.data };
  } catch (error) {
    console.error("Error fetching house stays:", error);
    // Don't fail the page if stays fail to load - it's optional
    return { data: [] };
  }
}

// House Detail Page (Server Component - default)
export default async function HouseDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch house and stays data in parallel
  const [houseResult, staysResult] = await Promise.all([
    getHouseDetail(id),
    getHouseStays(id),
  ]);

  if (!houseResult.data) {
    return (
      <ErrorFallback
        title="Unable to Load House"
        message={houseResult.error}
      />
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense
          fallback={<LoadingFallback message="Loading house details..." />}
        >
          <HouseDetailClient
            houseId={id}
            initialHouse={houseResult.data}
            initialStays={staysResult.data || undefined}
          />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}

