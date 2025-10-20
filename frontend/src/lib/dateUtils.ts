/**
 * Shared date formatting utilities
 */

/**
 * Format date for display in MM/DD/YYYY format
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date string or "—" if no date
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

/**
 * Format date for display in long format (Month DD, YYYY)
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date string or "—" if no date
 */
export const formatDateLong = (dateString: string | null | undefined): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date for input field (YYYY-MM-DD)
 * @param dateString - ISO date string or null/undefined
 * @returns Formatted date string for input or empty string
 */
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

