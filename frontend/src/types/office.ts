// Office DTO
export interface OfficeDTO {
  id: string; // UUID
  code: string;
  name: string;
  county: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  isActive: boolean;
}
