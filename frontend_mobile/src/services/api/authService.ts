import { ApiResponse, LoginCredentials, User } from '../../types';
import { apiClient } from './apiClient';

export class AuthService {
  /**
   * Authenticate user with username and password
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    try {
      // For demo purposes, simulate API call
      // In production, this would make a real API call
      if (credentials.username && credentials.password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock successful response
        const mockUser: User = {
          id: '1',
          name: 'Sarah Johnson',
          employeeId: 'EMP001',
          email: 'sarah.johnson@blueangelscare.com',
          department: 'Patient Care',
          role: 'Care Coordinator',
          phone: '+1 (555) 123-4567',
          token: 'mock-jwt-token-123456',
        };

        // Set auth token for future requests
        apiClient.setAuthToken(mockUser.token!);

        return {
          success: true,
          data: mockUser,
        };
      } else {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }

    // Production implementation would be:
    // return apiClient.post<User>('/auth/login', credentials);
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