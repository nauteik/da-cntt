import type { ApiResponse } from "../types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/api";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  // Server-side only options
  cache?: RequestCache;
  revalidate?: number | false;
}

/**
 * Helper to get cookies from Next.js headers (server-side only)
 */
async function getServerCookies(): Promise<string | null> {
  try {
    // Dynamic import to avoid bundling in client
    const { headers } = await import("next/headers");
    const headersList = await headers();
    return headersList.get("cookie");
  } catch {
    return null;
  }
}

/**
 * Unified API client for both Server and Client Components
 * - On the server: forwards cookies and supports Next.js cache options
 * - On the client: uses credentials: 'include' to send cookies
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    headers: customHeaders = {},
    body,
    cache,
    revalidate,
  } = options;

  const isServer = typeof window === "undefined";

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
  };

  // Server-side: forward cookies and apply Next.js cache options
  if (isServer) {
    const cookieHeader = await getServerCookies();
    if (cookieHeader) {
      config.headers = {
        ...config.headers,
        cookie: cookieHeader,
      };
    }

    // Apply caching for GET requests
    if (method === "GET") {
      if (cache) {
        config.cache = cache;
      } else if (revalidate !== undefined) {
        config.next = { revalidate };
      } else {
        config.cache = "no-store"; // Default: don't cache (user-specific data)
      }
    } else {
      config.cache = "no-store"; // Never cache mutations
    }
  } else {
    // Client-side: include credentials for cookies
    config.credentials = "include";
    config.cache = "no-store"; // Let React Query handle client caching
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle cases where the response is not ok but returns JSON (e.g., validation errors from Spring)
    if (!response.ok) {
      // Handle 403 Forbidden specifically
      if (response.status === 403) {
        return {
          success: false,
          status: 403,
          message: "You do not have permission to perform this action.",
          errorType: "PERMISSION_ERROR",
          timestamp: new Date().toISOString(),
        };
      }

      // Try to parse the error response from the backend for other errors
      try {
        const errorData = await response.json();
        console.log(errorData);
        return {
          success: false,
          status: response.status,
          ...errorData,
        };
      } catch {
        // If parsing fails, return a generic error message
        return {
          success: false,
          status: response.status,
          message: `Request failed with status ${response.status}`,
          errorType: "SYSTEM_ERROR",
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Handle successful responses
    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    // Handle network errors (like "Failed to fetch")
    console.error("Error: ", error);
    return {
      success: false,
      message: "Failed to connect to server, please try again.",
      status: 503, // Service Unavailable
      errorType: "SYSTEM_ERROR",
      timestamp: new Date().toISOString(),
    };
  }
}
