"use client";

import { Card } from "antd";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
}

export default function ErrorFallback({ title, message }: ErrorFallbackProps) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <Card
            className="max-w-md w-full border-l-4 border-l-red-500"
            style={{ borderRadius: 0 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {title && (
                <h2 className="text-xl font-semibold text-theme-primary mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  {title}
                </h2>
              )}
              {message && (
                <p className="text-theme-secondary whitespace-nowrap overflow-hidden text-ellipsis">
                  {message}
                </p>
              )}
            </div>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
