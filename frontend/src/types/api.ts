export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
  path?: string;
  status: number;
  errorType?: // Show to user - safe to display
  | "VALIDATION_ERROR" // "Email is required"
    | "BUSINESS_ERROR" // "Cannot delete user with active orders"
    | "NOT_FOUND" // "User not found"
    | "CONFLICT" // "Email already exists"
    | "AUTHENTICATION_ERROR" // "Invalid credentials"
    | "PERMISSION_ERROR" // "You do not have permission to perform this action";

    // Generic message - don't show details (raw error) to user
    | "SYSTEM_ERROR"; //show "Something went wrong, please try again"
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly errorType?: ApiResponse<unknown>["errorType"];
  public readonly errors?: string[];

  constructor(response: ApiResponse<unknown>) {
    // Ensure a message is always present
    super(response.message || "An unknown API error occurred");
    this.name = "ApiError";
    this.status = response.status;
    this.errorType = response.errorType;
    this.errors = response.errors;
  }
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Current page number (0-indexed)
  first: boolean;
  last: boolean;
  empty: boolean;
}