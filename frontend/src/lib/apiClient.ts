import type { ApiResponse } from "../types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  // Next.js cache options (for server-side fetching)
  cache?: RequestCache;
  revalidate?: number | false;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", headers = {}, body, cache, revalidate } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
  };

  // Add Next.js cache configuration for server-side fetching
  // Only apply caching to GET requests
  if (method === "GET") {
    if (cache) {
      config.cache = cache;
    } else if (revalidate !== undefined) {
      config.next = { revalidate };
    } else {
      // Default: cache for 60 seconds on server-side
      config.next = { revalidate: 60 };
    }
  } else {
    // For mutations, never cache
    config.cache = "no-store";
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle cases where the response is not ok but returns JSON (e.g., validation errors from Spring)
    if (!response.ok) {
      // Try to parse the error response from the backend
      const errorData = await response.json();
      return {
        success: false,
        status: response.status,
        ...errorData,
      };
    }

    // Handle successful responses
    const data: ApiResponse<T> = await response.json();
    console.log(data);
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
