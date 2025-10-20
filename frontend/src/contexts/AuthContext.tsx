"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useTransition,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  User,
  LoginCredentials,
  AuthState,
  UserInfoResponse,
} from "@/types/auth";
import { useApiMutation } from "@/hooks/useApi";
import { ApiError } from "@/types/api";
import { UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

// The context will now provide the login mutation result directly
interface AuthContextType extends Omit<AuthState, "isInitialized"> {
  login: UseMutationResult<UserInfoResponse, ApiError, LoginCredentials>;
  logout: () => Promise<void>;
  isInitialized: boolean;
  isNavigating: boolean; // Track navigation transition state
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

// Storage keys (only for remembering credentials, not for tokens)
const STORAGE_KEYS = {
  REMEMBER_CREDENTIALS: "bac_remember_credentials",
} as const;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, startTransition] = useTransition();

  // Initialize auth state by fetching user info from backend (cookie-based auth)
  useEffect(() => {
    const initializeAuth = async () => {
      // If auth is already initialized and user is not authenticated, do nothing.
      // This prevents re-fetching when redirecting to the login page.
      if (state.isInitialized && !state.isAuthenticated) {
        return;
      }

      // Skip session check on login page to avoid 401 errors in console
      if (pathname === "/login") {
        dispatch({ type: "SET_INITIALIZED", payload: true });
        return;
      }

      try {
        // Try to fetch user info - the cookie will be sent automatically
        // Use direct backend call since we removed BFF for user/me
        const response = await apiClient<UserInfoResponse>("/user/me");

        if (response.success && response.data) {
          const userInfo = response.data;
          const user: User = {
            id: userInfo.userId,
            email: userInfo.email,
            displayName: userInfo.displayName,
            roles: userInfo.roles,
            officeId: userInfo.officeId,
          };
          dispatch({ type: "SET_USER", payload: user });
        } else {
          // No valid session
          dispatch({ type: "SET_USER", payload: null });
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        dispatch({ type: "SET_USER", payload: null });
      } finally {
        // Signal that initialization is complete
        dispatch({ type: "SET_INITIALIZED", payload: true });
      }
    };

    initializeAuth();
  }, [pathname, state.isInitialized, state.isAuthenticated]);

  const loginMutation = useApiMutation<UserInfoResponse, LoginCredentials>(
    "api/auth/login", // Use BFF endpoint for login (without /api prefix)
    "POST",
    {
      onSuccess: (data, variables) => {
        // On successful API call, store data and update global state
        console.log("Login success data:", data);

        // Map response to User type
        const user: User = {
          id: data.userId,
          email: data.email,
          displayName: data.displayName,
          roles: data.roles,
          officeId: data.officeId,
        };

        // Handle "remember me" - only store email, not tokens
        if (variables.rememberMe) {
          localStorage.setItem(
            STORAGE_KEYS.REMEMBER_CREDENTIALS,
            JSON.stringify({
              email: variables.email,
              rememberMe: true,
            })
          );
        } else {
          localStorage.removeItem(STORAGE_KEYS.REMEMBER_CREDENTIALS);
        }

        dispatch({ type: "SET_USER", payload: user });

        // Use startTransition for smoother navigation
        startTransition(() => {
          router.push("/"); // Redirect on success
        });
      },
      onError: (error) => {
        // Log error, the component will handle displaying it
        console.error("Login failed:", error.message);
      },
    }
  );

  const logout = async (): Promise<void> => {
    try {
      // Call Next.js BFF logout route to properly clear HttpOnly cookie
      // This is the only way to delete HttpOnly cookies from the browser
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
      
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      console.log('Logout successful, cookie cleared');
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear user data from state
      dispatch({ type: "SET_USER", payload: null });
      
      // Reset initialization state to force re-check on next access
      dispatch({ type: "SET_INITIALIZED", payload: false });
      
      // Use hard redirect to ensure all state is cleared
      // This prevents any cached authentication state
      window.location.href = "/login";
    }
  };

  const value: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isInitialized: state.isInitialized,
    login: loginMutation,
    logout,
    isNavigating, // Expose navigation transition state
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
