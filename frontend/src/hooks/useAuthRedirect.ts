"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/auth";

/**
 * Hook to automatically redirect the user based on their authentication status.
 * It prevents redirection until the initial authentication state is resolved.
 *
 * @param redirectTo The path to redirect to if the user is authenticated (e.g., when on a public page like /login).
 * @param redirectFrom The path to redirect from if the user is not authenticated (e.g., when on a protected page).
 */
export function useAuthRedirect(
  redirectTo: string = "/",
  redirectFrom: string = "/login"
) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Do not perform any redirection until the auth state is initialized.
    if (!isInitialized) {
      return;
    }

    // If user is authenticated and is on the login/register page, redirect to dashboard.
    if (isAuthenticated && pathname === redirectFrom) {
      router.push(redirectTo);
    }

    // If user is not authenticated and is on a protected page, redirect to login.
    // (This part is better handled by a dedicated ProtectedRoute component,
    // but can be included here for simple cases).
    if (!isAuthenticated && pathname !== redirectFrom) {
      router.push(redirectFrom);
    }
  }, [isAuthenticated, isInitialized, pathname, router, redirectTo, redirectFrom]);
}

/**
 * Hook to check permissions based on user roles.
 * @param requiredRoles - Array of required roles.
 * @returns boolean indicating if the user has permission.
 */
export function usePermission(requiredRoles: string[] = []): boolean {
  const { user, isInitialized } = useAuth();

  if (!isInitialized || !user) {
    return false;
  }

  if (requiredRoles.length === 0) {
    return true; // No specific roles required, access granted.
  }

  // Check if the user has at least one of the required roles.
  return requiredRoles.some((role) => user.roles?.includes(role));
}

/**
 * Hook to get the current user information.
 * @returns The current user object or null.
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}
