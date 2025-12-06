"use client";

import { useApiQuery } from "./useApi";
import type { PaginatedAuthorizations, AuthorizationSearchRequest } from "@/types/authorization";
import type { UseQueryOptions } from "@tanstack/react-query";
import type { ApiError } from "@/types/api";

/**
 * Custom hook for fetching paginated authorizations list
 * Integrates with the backend /api/authorizations/search endpoint
 *
 * @param params Query parameters for search, pagination and sorting
 * @param options React Query options including initialData
 * @returns React Query result with authorization data
 */
export function useAuthorizations(
  params: AuthorizationSearchRequest = {},
  options?: Omit<
    UseQueryOptions<
      PaginatedAuthorizations,
      ApiError,
      PaginatedAuthorizations,
      readonly unknown[]
    >,
    "queryKey" | "queryFn"
  >
) {
  const {
    page = 0,
    size = 25,
    sortBy = "",
    sortDir = "asc",
    startDate,
    endDate,
    payerId,
    supervisorId,
    programId,
    serviceTypeId,
    authorizationNo,
    clientId,
    clientFirstName,
    clientLastName,
    status,
  } = params;

  // Build query string
  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  // Only add sort params if sortBy is provided
  if (sortBy) {
    queryParams.append("sortBy", sortBy);
    queryParams.append("sortDir", sortDir);
  }

  // Add optional date filters
  if (startDate) {
    queryParams.append("startDate", startDate);
  }
  if (endDate) {
    queryParams.append("endDate", endDate);
  }

  // Add optional UUID filters
  if (payerId) {
    queryParams.append("payerId", payerId);
  }
  if (supervisorId) {
    queryParams.append("supervisorId", supervisorId);
  }
  if (programId) {
    queryParams.append("programId", programId);
  }
  if (serviceTypeId) {
    queryParams.append("serviceTypeId", serviceTypeId);
  }

  // Add optional text search filters
  if (authorizationNo) {
    queryParams.append("authorizationNo", authorizationNo);
  }
  if (clientId) {
    queryParams.append("clientId", clientId);
  }
  if (clientFirstName) {
    queryParams.append("clientFirstName", clientFirstName);
  }
  if (clientLastName) {
    queryParams.append("clientLastName", clientLastName);
  }

  // Add optional status filter
  if (status) {
    queryParams.append("status", status);
  }

  const endpoint = `/authorizations/search?${queryParams.toString()}`;

  return useApiQuery<PaginatedAuthorizations>(
    [
      "authorizations",
      page,
      size,
      sortBy,
      sortDir,
      startDate,
      endDate,
      payerId,
      supervisorId,
      programId,
      serviceTypeId,
      authorizationNo,
      clientId,
      clientFirstName,
      clientLastName,
      status,
    ] as const,
    endpoint,
    {
      staleTime: 60 * 1000, // Data is fresh for 60 seconds
      gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
      ...options,
    }
  );
}

