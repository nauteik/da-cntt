import { apiClient } from "../apiClient";
import type {
  HouseDTO,
  PaginatedHouses,
  HouseCreateRequest,
  HouseUpdateRequest,
  AssignPatientRequest,
  UnassignPatientRequest,
  PatientHouseStayDTO,
  HouseSearchParams,
} from "@/types/house";

/**
 * House API client
 */
export const houseApi = {
  /**
   * Get all houses with pagination, filtering, and search
   */
  async getHouses(params: HouseSearchParams = {}): Promise<PaginatedHouses> {
    const {
      page = 0,
      size = 25,
      sortBy,
      sortDir = "asc",
      officeId,
      search,
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("size", size.toString());
    if (sortBy) {
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortDir", sortDir);
    }
    if (officeId) {
      queryParams.append("officeId", officeId);
    }
    if (search) {
      queryParams.append("search", search);
    }

    const response = await apiClient<PaginatedHouses>(
      `/house?${queryParams.toString()}`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch houses");
    }
    return response.data;
  },

  /**
   * Get house by ID
   */
  async getHouseById(id: string): Promise<HouseDTO> {
    const response = await apiClient<HouseDTO>(`/house/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch house");
    }
    return response.data;
  },

  /**
   * Create a new house
   */
  async createHouse(request: HouseCreateRequest): Promise<HouseDTO> {
    const response = await apiClient<HouseDTO>("/house", {
      method: "POST",
      body: request,
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to create house");
    }
    return response.data;
  },

  /**
   * Update an existing house
   */
  async updateHouse(
    id: string,
    request: HouseUpdateRequest
  ): Promise<HouseDTO> {
    const response = await apiClient<HouseDTO>(`/house/${id}`, {
      method: "PUT",
      body: request,
    });
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to update house");
    }
    return response.data;
  },

  /**
   * Delete a house (soft delete)
   */
  async deleteHouse(id: string): Promise<void> {
    const response = await apiClient<void>(`/house/${id}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.message || "Failed to delete house");
    }
  },

  /**
   * Assign a patient to a house
   */
  async assignPatientToHouse(
    houseId: string,
    request: AssignPatientRequest
  ): Promise<PatientHouseStayDTO> {
    const response = await apiClient<PatientHouseStayDTO>(
      `/house/${houseId}/assign-patient`,
      {
        method: "POST",
        body: request,
      }
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to assign patient to house");
    }
    return response.data;
  },

  /**
   * Unassign a patient from a house
   */
  async unassignPatientFromHouse(
    stayId: string,
    request: UnassignPatientRequest
  ): Promise<PatientHouseStayDTO> {
    const response = await apiClient<PatientHouseStayDTO>(
      `/house/stay/${stayId}/unassign`,
      {
        method: "PUT",
        body: request,
      }
    );
    if (!response.success || !response.data) {
      throw new Error(
        response.message || "Failed to unassign patient from house"
      );
    }
    return response.data;
  },

  /**
   * Get all stays for a patient
   */
  async getPatientStays(patientId: string): Promise<PatientHouseStayDTO[]> {
    const response = await apiClient<PatientHouseStayDTO[]>(
      `/house/patient/${patientId}/stays`
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch patient stays");
    }
    return response.data;
  },

  /**
   * Get current patient staying in a house
   */
  async getHouseCurrentPatient(
    houseId: string
  ): Promise<PatientHouseStayDTO | null> {
    const response = await apiClient<PatientHouseStayDTO>(
      `/house/${houseId}/current-patient`
    );
    if (!response.success) {
      throw new Error(
        response.message || "Failed to fetch current patient for house"
      );
    }
    return response.data || null;
  },
};




