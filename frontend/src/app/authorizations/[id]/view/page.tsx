import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ViewAuthorizationClient from "./ViewAuthorizationClient";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingFallback from "@/components/common/LoadingFallback";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { AuthorizationDetailDTO, PatientServiceDTO } from "@/types/authorization";
import type { PatientProgramDTO, ServiceDetailDTO } from "@/types/patient";

interface ViewAuthorizationPageProps {
  params: Promise<{ id: string }>;
}

// Fetch authorization details
async function getAuthorizationDetail(
  authorizationId: string
): Promise<{ data: AuthorizationDetailDTO | null; error?: string }> {
  try {
    const endpoint = `/authorizations/${authorizationId}`;
    const response: ApiResponse<AuthorizationDetailDTO> = await apiClient<AuthorizationDetailDTO>(endpoint);

    if (!response.success || !response.data) {
      return { data: null, error: response.message || "Failed to fetch authorization details" };
    }

    return { data: response.data };
  } catch (error) {
    console.error("Error fetching authorization details:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Fetch patient services for the Service Limitations section
async function getPatientServices(
  patientId: string
): Promise<{ data: PatientServiceDTO[] | null; error?: string }> {
  try {
    const endpoint = `/patients/${patientId}/program`;
    const response: ApiResponse<PatientProgramDTO> = await apiClient<PatientProgramDTO>(endpoint);

    if (!response.success || !response.data) {
      return { data: null, error: response.message || "Failed to fetch patient services" };
    }

    // Extract services from the program data and map to PatientServiceDTO
    const services: ServiceDetailDTO[] = response.data.services || [];
    const mappedServices: PatientServiceDTO[] = services
      .filter((service) => service.patientServiceId && service.serviceCode && service.serviceName)
      .map((service) => ({
        id: service.patientServiceId!,
        serviceCode: service.serviceCode!,
        serviceName: service.serviceName!,
        startDate: service.startDate || "",
        endDate: service.endDate,
        totalUnits: undefined, // Not available in ServiceDetailDTO
      }));
    return { data: mappedServices };
  } catch (error) {
    console.error("Error fetching patient services:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}

// Server Component
export default async function ViewAuthorizationPage({ params }: ViewAuthorizationPageProps) {
  // Force dynamic rendering to access request headers (cookies)
  await headers();

  // Await params (Next.js 15+ requirement)
  const resolvedParams = await params;
  const authorizationId = resolvedParams.id;

  // Fetch authorization details
  const authorizationResult = await getAuthorizationDetail(authorizationId);

  // If authorization not found, show 404
  if (!authorizationResult.data) {
    notFound();
  }

  const authorization = authorizationResult.data;

  // Fetch patient services using patientId from authorization
  const servicesResult = await getPatientServices(authorization.patientId);
  const patientServices = servicesResult.data || [];

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Suspense fallback={<LoadingFallback message="Loading authorization details..." />}>
          <ViewAuthorizationClient
            authorization={authorization}
            patientServices={patientServices}
          />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}



