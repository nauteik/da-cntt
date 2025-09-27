import type { ApiResponse } from "../types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", headers = {}, body } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
  };

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
    return data;
  } catch (error) {
    // Handle network errors (like "Failed to fetch")
    console.error("Error: ", error);
    return {
      success: false,
      message: "Không thể kết nối đến máy chủ",
      status: 503, // Service Unavailable
      errorType: "SYSTEM_ERROR",
      timestamp: new Date().toISOString(),
    };
  }
}
