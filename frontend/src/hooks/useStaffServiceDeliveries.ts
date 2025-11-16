/**
 * React Query hook for staff service deliveries
 */

import { useQuery } from "@tanstack/react-query";
import { getServiceDeliveriesByStaff } from "@/lib/api/serviceDeliveryApi";
import type { ServiceDeliveryDTO } from "@/types/serviceDelivery";

/**
 * Hook to fetch service deliveries for a specific staff member
 */
export function useStaffServiceDeliveries(staffId: string) {
  return useQuery<ServiceDeliveryDTO[], Error>({
    queryKey: ["serviceDeliveries", "staff", staffId],
    queryFn: () => getServiceDeliveriesByStaff(staffId),
    staleTime: 30000, // Cache for 30 seconds
    enabled: !!staffId, // Only fetch if staffId is provided
  });
}
