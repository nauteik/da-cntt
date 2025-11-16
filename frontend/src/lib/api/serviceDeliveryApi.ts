/**
 * Service Delivery API Client
 */

import { apiClient } from "@/lib/apiClient";
import type { ServiceDeliveryDTO } from "@/types/serviceDelivery";

/**
 * Get service deliveries by staff ID
 */
export async function getServiceDeliveriesByStaff(
  staffId: string
): Promise<ServiceDeliveryDTO[]> {
  const response = await apiClient<ServiceDeliveryDTO[]>(
    `/service-delivery/staff/${staffId}`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch service deliveries");
  }
  return response.data;
}

/**
 * Get service delivery by ID
 */
export async function getServiceDeliveryById(
  id: string
): Promise<ServiceDeliveryDTO> {
  const response = await apiClient<ServiceDeliveryDTO>(
    `/service-delivery/${id}`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch service delivery");
  }
  return response.data;
}

/**
 * Get service deliveries by patient ID
 */
export async function getServiceDeliveriesByPatient(
  patientId: string
): Promise<ServiceDeliveryDTO[]> {
  const response = await apiClient<ServiceDeliveryDTO[]>(
    `/service-delivery/patient/${patientId}`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch service deliveries");
  }
  return response.data;
}

/**
 * Get service deliveries by status
 */
export async function getServiceDeliveriesByStatus(
  status: string
): Promise<ServiceDeliveryDTO[]> {
  const response = await apiClient<ServiceDeliveryDTO[]>(
    `/service-delivery/status/${status}`
  );
  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch service deliveries");
  }
  return response.data;
}
