/**
 * ISP (Individual Service Plan) API service
 */

import { apiClient } from "../apiClient";
import type { ApiResponse } from "@/types/api";
import type { ISP, CreateISPDTO, UpdateISPDTO } from "@/types/isp";

// FileObject type matching backend FileObject entity
interface FileObject {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storageUri: string;
  sha256?: string;
  createdAt: string;
  updatedAt: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL + "/api";

/**
 * Get ISP for a patient
 */
export async function getISP(patientId: string): Promise<ApiResponse<ISP | null>> {
  return apiClient<ISP | null>(`/patients/${patientId}/isp`);
}

/**
 * Create a new ISP for a patient
 */
export async function createISP(
  patientId: string,
  data: CreateISPDTO
): Promise<ApiResponse<ISP>> {
  return apiClient<ISP>(`/patients/${patientId}/isp`, {
    method: "POST",
    body: data,
  });
}

/**
 * Update an existing ISP
 */
export async function updateISP(
  ispId: string,
  data: UpdateISPDTO
): Promise<ApiResponse<ISP>> {
  return apiClient<ISP>(`/isp/${ispId}`, {
    method: "PUT",
    body: data,
  });
}

/**
 * Delete an ISP
 */
export async function deleteISP(ispId: string): Promise<ApiResponse<void>> {
  return apiClient<void>(`/isp/${ispId}`, {
    method: "DELETE",
  });
}

/**
 * Upload ISP file (PDF) to Cloudinary
 * Uses the existing file upload endpoint
 */
export async function uploadISPFile(
  file: File,
  officeId?: string
): Promise<ApiResponse<FileObject>> {
  const formData = new FormData();
  formData.append("file", file);
  if (officeId) {
    formData.append("officeId", officeId);
  }

  const response = await fetch(`${BACKEND_URL}/files/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Failed to upload file",
    }));
    throw new Error(errorData.message || "Failed to upload file");
  }

  const result: ApiResponse<FileObject> = await response.json();
  return result;
}
