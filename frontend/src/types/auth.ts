export interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  officeId?: string; // Multi-office support (UUID as string)
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * UserInfo response from backend (no token - it's in HttpOnly cookie)
 */
export interface UserInfoResponse {
  userId: string;
  displayName: string;
  email: string;
  roles: string[];
  expiresAt: string;
  mfaEnabled: boolean;
  officeId?: string; // Multi-office support (UUID as string)
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Keep track of initial auth check
}
