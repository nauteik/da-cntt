export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string; // Added this property
  roles: string[];
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * This interface now matches the flat structure returned by the backend API.
 */
export interface LoginResponse {
  token: string;
  tokenType: string;
  refreshToken?: string;
  userId: string;
  username: string;
  displayName: string;
  email: string;
  roles: string[];
  expiresAt: string;
  mfaEnabled: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Keep track of initial auth check
}
