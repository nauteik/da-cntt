import { apiClient } from "../apiClient";

/**
 * Dashboard API client
 */

// ==================== TypeScript Interfaces ====================

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  totalStaff: number;
  activeStaff: number;
  totalScheduleEvents: number;
  plannedEvents: number;
  confirmedEvents: number;
  inProgressEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  totalServiceDeliveries: number;
  notStartedDeliveries: number;
  inProgressDeliveries: number;
  completedDeliveries: number;
  incompleteDeliveries: number;
  cancelledDeliveries: number;
}

export interface ScheduleEventStats {
  date: string;
  planned: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  total: number;
}

export interface RecentActivity {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'SCHEDULE_CREATED' | 'SCHEDULE_UPDATED';
  time: string;
  description: string;
  staffName?: string;
  patientName?: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface RecentActivitiesPage {
  content: RecentActivity[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Alert {
  id: string;
  type: 'AUTHORIZATION_EXPIRING' | 'CERTIFICATION_EXPIRING' | 'INCOMPLETE_SHIFT';
  severity: 'high' | 'medium' | 'low';
  message: string;
  entity: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  patientName?: string;
  authorizationNo?: string;
  serviceType?: string;
}

// ==================== API Functions ====================

export const dashboardApi = {
  /**
   * Get overall dashboard statistics
   */
  async getStats(fromDate: string, toDate: string, officeId?: string): Promise<DashboardStats> {
    const params = new URLSearchParams({
      fromDate,
      toDate,
    });
    if (officeId) {
      params.append('officeId', officeId);
    }

    const response = await apiClient<DashboardStats>(
      `/dashboard/stats?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch dashboard statistics");
    }
    
    return response.data;
  },

  /**
   * Get schedule event statistics grouped by date
   */
  async getScheduleEventStats(
    fromDate: string,
    toDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<ScheduleEventStats[]> {
    const params = new URLSearchParams({
      fromDate,
      toDate,
      groupBy,
    });

    const response = await apiClient<ScheduleEventStats[]>(
      `/dashboard/schedule-stats?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch schedule event statistics");
    }
    
    return response.data;
  },

  /**
   * Get recent activities (check-ins, check-outs, schedule events)
   */
  async getRecentActivities(
    hoursAgo: number = 24,
    page: number = 0,
    size: number = 10
  ): Promise<RecentActivitiesPage> {
    const params = new URLSearchParams({
      hoursAgo: hoursAgo.toString(),
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient<RecentActivitiesPage>(
      `/dashboard/recent-activities?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch recent activities");
    }
    
    return response.data;
  },

  /**
   * Get dashboard alerts (expiring authorizations, incomplete shifts, etc.)
   */
  async getAlerts(officeId?: string): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (officeId) {
      params.append('officeId', officeId);
    }

    const url = params.toString() 
      ? `/dashboard/alerts?${params.toString()}`
      : `/dashboard/alerts`;

    const response = await apiClient<Alert[]>(url);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || "Failed to fetch alerts");
    }
    
    return response.data;
  },
};

// Export individual functions for convenience
export const getDashboardStats = dashboardApi.getStats;
export const getScheduleEventStats = dashboardApi.getScheduleEventStats;
export const getRecentActivities = dashboardApi.getRecentActivities;
export const getAlerts = dashboardApi.getAlerts;
