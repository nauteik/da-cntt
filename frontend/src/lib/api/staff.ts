import { apiClient } from "../apiClient";

/**
 * Change Password Request DTO
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Reset Password Response DTO
 */
export interface ResetPasswordResponse {
  newPassword: string;
  message: string;
}

/**
 * Staff API client for password management
 */
export const staffApi = {
  /**
   * Change password for the authenticated user
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await apiClient<void>("/staff/change-password", {
      method: "PATCH",
      body: data,
    });

    if (!response.success) {
      throw new Error(response.message || "Failed to change password");
    }
  },

  /**
   * Reset password for a staff member (admin only)
   */
  async resetPassword(staffId: string): Promise<ResetPasswordResponse> {
    const response = await apiClient<ResetPasswordResponse>(
      `/staff/${staffId}/reset-password`,
      {
        method: "POST",
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to reset password");
    }

    return response.data;
  },
};
