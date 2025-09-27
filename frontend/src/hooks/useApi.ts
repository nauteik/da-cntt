"use client";

import {
  useQuery,
  useMutation,
  QueryKey,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { ApiError, type ApiResponse } from "../types/api";

/**
 * Custom Error class for API responses.
 * This allows us to throw an object that is an instance of Error,
 * preserving the stack trace and carrying extra information from the API response.
 * This acts as an adapter between the backend's single response structure and
 * React Query's dual data/error model.
 */

/**
 * A generic hook for fetching data (GET requests).
 * It unwraps the API response and returns the `data` payload directly.
 * On failure (response.success is false), it throws an `ApiError` which is
 * then caught by React Query and placed in the `error` state.
 *
 * @param queryKey The key for the query, used for caching.
 * @param endpoint The API endpoint to fetch from (e.g., '/users/1').
 * @param options Standard React Query options.
 */
export function useApiQuery<TData>(
  queryKey: QueryKey,
  endpoint: string,
  options?: Omit<
    UseQueryOptions<TData, ApiError, TData, QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<TData, ApiError, TData, QueryKey>({
    queryKey,
    queryFn: async () => {
      const response: ApiResponse<TData> = await apiClient<TData>(endpoint);
      if (!response.success || response.data === undefined) {
        // Translate the backend's "error envelope" into a real Error
        throw new ApiError(response);
      }
      // Return only the data payload on success
      return response.data;
    },
    ...options,
  });
}

/**
 * A generic hook for performing mutations (POST, PUT, PATCH, DELETE).
 * It unwraps the successful response to return the `data` payload.
 * On failure, it throws an `ApiError`.
 *
 * @param endpoint The API endpoint to mutate.
 * @param method The HTTP method to use.
 * @param options Standard React Query mutation options.
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn">
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response: ApiResponse<TData> = await apiClient<TData>(endpoint, {
        method,
        body: variables,
      });
      if (!response.success) {
        // Translate the backend's "error envelope" into a real Error
        throw new ApiError(response);
      }
      // For mutations like DELETE, data might be null/undefined but still successful.
      // We return the data payload if it exists, otherwise the whole successful response.
      return response.data ?? (response as unknown as TData);
    },
    ...options,
  });
}
