"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User, LoginCredentials, AuthState, LoginResponse } from "@/types/auth";
import { useApiMutation } from "@/hooks/useApi";
import { ApiError } from "@/types/api";
import { UseMutationResult } from "@tanstack/react-query";

// The context will now provide the login mutation result directly
interface AuthContextType extends Omit<AuthState, "isInitialized"> {
  login: UseMutationResult<LoginResponse, ApiError, LoginCredentials>;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth reducer is now much simpler
type AuthAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_INITIALIZED"; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case "SET_INITIALIZED":
      return {
        ...state,
        isInitialized: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false, // Start as not initialized
};

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "bac_access_token",
  REFRESH_TOKEN: "bac_refresh_token",
  USER: "bac_user",
  REMEMBER_CREDENTIALS: "bac_remember_credentials",
} as const;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Initialize auth state from storage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (userStr && accessToken && isTokenValid(accessToken)) {
        // THIS IS THE FIX: Dispatch SET_USER when initializing from storage
        dispatch({ type: "SET_USER", payload: JSON.parse(userStr) });
      } else {
        // If token is invalid or not found, ensure state is cleared
        clearAuthStorage();
        dispatch({ type: "SET_USER", payload: null });
      }
    } catch (error) {
      console.error("Failed to initialize auth from storage:", error);
      clearAuthStorage();
      dispatch({ type: "SET_USER", payload: null });
    } finally {
      // This should always run to signal that initialization is complete
      dispatch({ type: "SET_INITIALIZED", payload: true });
    }
  }, []);

  const loginMutation = useApiMutation<LoginResponse, LoginCredentials>(
    "/auth/login", // Replace with your actual login endpoint
    "POST",
    {
      onSuccess: (data, variables) => {
        // On successful API call, store data and update global state
        console.log("Login success data:", data);

        // This mapping is now type-safe because the types in auth.ts are correct.
        const user: User = {
          id: data.userId,
          username: data.username,
          email: data.email,
          displayName: data.displayName,
          roles: data.roles,
        };

        // Use the correct property names from the response object
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.token);
        // Handle missing refresh token gracefully
        if (data.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
        }
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

        if (variables.rememberMe) {
          localStorage.setItem(
            STORAGE_KEYS.REMEMBER_CREDENTIALS,
            JSON.stringify({
              username: variables.username,
              rememberMe: true,
            })
          );
        } else {
          localStorage.removeItem(STORAGE_KEYS.REMEMBER_CREDENTIALS);
        }

        dispatch({ type: "SET_USER", payload: user });
        router.push("/"); // Redirect on success
      },
      onError: (error) => {
        // Log error, the component will handle displaying it
        console.error("Login failed:", error.message);
      },
    }
  );

  const logout = (): void => {
    clearAuthStorage();
    dispatch({ type: "SET_USER", payload: null });
    // Optional: redirect to login page after logout
    router.push("/login");
  };

  const clearAuthStorage = (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    login: loginMutation,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper functions
const isTokenValid = (token: string): boolean => {
  try {
    // Basic JWT token validation (check expiration)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Get remembered credentials
export const getRememberedCredentials = () => {
  // Safe guard against server-side rendering
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REMEMBER_CREDENTIALS);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};
