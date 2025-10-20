"use client";

import { Alert } from "antd";

interface InlineErrorProps {
  title?: string;
  message?: string;
}

/**
 * Inline error component for use within existing layouts (e.g., tabs, sections)
 * Does NOT include AdminLayout or ProtectedRoute - use for nested content errors
 */
export default function InlineError({ title, message }: InlineErrorProps) {
  return (
    <div className="flex items-center justify-center p-6">
      <Alert
        message={title || "Error"}
        description={message || "An error occurred while loading this content"}
        type="error"
        showIcon
        className="max-w-2xl w-full"
      />
    </div>
  );
}

