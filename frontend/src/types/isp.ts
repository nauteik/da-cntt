/**
 * ISP (Individual Service Plan) related types
 */

export interface ISP {
  id: string;
  patientId: string;
  versionNo: number;
  effectiveAt: string; // ISO date string
  expiresAt?: string; // ISO date string
  totalUnit?: number;
  file?: {
    id: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    storageUri: string; // Cloudinary URL
  };
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateISPDTO {
  versionNo: number;
  effectiveAt: string; // ISO date string
  expiresAt?: string; // ISO date string
  totalUnit?: number;
  fileId?: string; // FileObject ID from upload
}

export interface UpdateISPDTO {
  versionNo?: number;
  effectiveAt?: string; // ISO date string
  expiresAt?: string; // ISO date string
  totalUnit?: number;
  fileId?: string; // FileObject ID from upload
}
