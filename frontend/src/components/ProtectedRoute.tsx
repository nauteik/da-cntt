"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
  fallback,
}: ProtectedRouteProps) {
  // FIX: Removed 'isLoading' and rely solely on 'isInitialized'
  const { isAuthenticated, user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after initialization is complete and we're sure user is not authenticated
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading spinner while checking authentication (only if not initialized yet)
  if (!isInitialized) {
    return (
      fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center bg-theme-primary">
          {/* FIX: Always render Spin during the loading state */}
          <Spin size="large" />
          <div className="mt-4 font-medium text-lg text-theme-primary">
            Đang kiểm tra quyền truy cập...
          </div>
        </div>
      )
    );
  }

  // Redirect to login if not authenticated. This check is slightly redundant due to the
  // useEffect, but it prevents rendering children for a split second before redirect.
  if (!isAuthenticated) {
    return null; // The useEffect will handle the redirect
  }

  // Check role-based access
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user.roles.includes(role)
    );

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-theme-primary">
          <div className="bg-theme-surface rounded-xl p-8 shadow-lg border border-theme max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Không có quyền truy cập
              </h2>
              <p className="text-theme-secondary mb-6">
                Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản
                trị viên nếu cần hỗ trợ.
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-theme-accent text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Quay về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
