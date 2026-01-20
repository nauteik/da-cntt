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
 * Upload ISP file (PDF) to Cloudinary with progress tracking
 * Uses the existing file upload endpoint
 */
export async function uploadISPFile(
  file: File,
  officeId?: string,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<FileObject>> {
  const formData = new FormData();
  formData.append("file", file);
  if (officeId) {
    formData.append("officeId", officeId);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress(percentComplete);
      }
    });

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result: ApiResponse<FileObject> = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error("Failed to parse response"));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || "Failed to upload file"));
        } catch {
          reject(new Error("Failed to upload file"));
        }
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      reject(new Error("Network error during file upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("File upload was cancelled"));
    });

    // Open and send request
    xhr.open("POST", `${BACKEND_URL}/files/upload`);
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}
