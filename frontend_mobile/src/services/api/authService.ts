import { ApiResponse, LoginCredentials, User, LoginRequest, UserInfoResponse } from '../../types';
import { apiClient } from './apiClient';

interface BackendApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export class AuthService {
  /**
   * Authenticate user with username and password
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    try {
      // Prepare request body (backend expects email field)
      const loginRequest: LoginRequest = {
        email: credentials.email || credentials.username,
        password: credentials.password,
      };

      // Call backend login endpoint
      const response = await apiClient.post<BackendApiResponse<UserInfoResponse>>(
        '/auth/login',
        loginRequest
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'Login failed',
        };
      }

      // Extract user info from backend response
      const backendData = response.data;
      const userInfo = backendData.data;

      if (!userInfo) {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }

      // Map backend UserInfoResponse to frontend User type
      const user: User = {
        id: userInfo.userId,
        staffId: userInfo.staffId, // Staff ID for DSP role - use this for Schedule API
        name: userInfo.displayName,
        employeeId: userInfo.userId, // Use userId as employeeId for now
        email: userInfo.email,
        department: 'Patient Care', // Default value
        role: userInfo.roles[0] || 'DSP',
        phone: '', // Not provided by backend
        token: userInfo.token,
        officeId: userInfo.officeId,
      };

      // Set auth token for future requests
      apiClient.setAuthToken(user.token!);

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed. Please try again.',
      };
    }
  }

  /**
   * Logout user and clear session
   */
  static async logout(): Promise<ApiResponse<void>> {
    try {
      // Clear auth token
      apiClient.setAuthToken(null);
      
      // In production, call logout endpoint
      // return apiClient.post<void>('/auth/logout');
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Logout failed',
      };
    }
  }

  /**
   * Refresh auth token
   */
  static async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post<{ token: string }>('/auth/refresh');
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password-reset', { email });
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/password-reset/confirm', {
      token,
      newPassword,
    });
  }

  /**
   * Change user password
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return apiClient.patch<void>('/auth/password', {
      currentPassword,
      newPassword,
    });
  }
}

export default AuthService;