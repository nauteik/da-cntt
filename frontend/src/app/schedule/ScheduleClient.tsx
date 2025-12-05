"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Input,
  Button,
  Space,
  Select,
  DatePicker,
  Tag,
  Switch,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { useSchedules } from "@/hooks/useSchedules";
import { useScheduleExport } from "@/hooks/useScheduleExport";
import type {
  PaginatedScheduleEvents,
} from "@/types/schedule";
import type { PatientSelectDTO, StaffSelectDTO } from "@/types/patient";
import { message } from "antd";
import layoutStyles from "@/styles/table-layout.module.css";
import buttonStyles from "@/styles/buttons.module.css";
import CreateScheduleForm from "@/components/schedule/CreateScheduleForm";
import ScheduleEventsTable from "@/components/patients/schedule/ScheduleEventsTable";
import WeeklyCalendar from "@/components/schedule/WeeklyCalendar";
import MonthlyCalendar from "@/components/schedule/MonthlyCalendar";
import CalendarViewFilterModal from "@/components/schedule/CalendarViewFilterModal";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface ScheduleClientProps {
  initialData: PaginatedScheduleEvents;
  patients: PatientSelectDTO[];
  staff: StaffSelectDTO[];
}

export default function ScheduleClient({
  initialData,
  patients,
  staff,
}: ScheduleClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive state from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("size") || "25", 10);
  const sortBy = searchParams.get("sortBy") || "";
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") || "asc";
  const searchText = searchParams.get("search") || "";
  const patientFilter = searchParams.get("patientId") || "";
  const staffFilter = searchParams.get("staffId") || "";
  const statusFilter = searchParams.get("status") || "";

  // View state from URL
  const view = (searchParams.get("view") as "table" | "weekly" | "monthly") || "table";
  
  // Calendar filter state from URL
  const calendarFilterBy = searchParams.get("calendarFilterBy") as "client" | "employee" | null;
  const calendarClientId = searchParams.get("calendarClientId") || undefined;
  const calendarEmployeeId = searchParams.get("calendarEmployeeId") || undefined;
  const calendarWeekStart = searchParams.get("calendarWeekStart");
  const calendarMonth = searchParams.get("calendarMonth");
  
  // Date range
  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);
  const defaultFrom = searchParams.get("from") || today.toISOString().split("T")[0];
  const defaultTo = searchParams.get("to") || oneWeekLater.toISOString().split("T")[0];

  // Local state
  const [searchInput, setSearchInput] = useState(searchText);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pendingView, setPendingView] = useState<"weekly" | "monthly" | null>(null); // View pending to apply after filter selection
  
  // Export hook
  const { exportPdf, isExporting } = useScheduleExport();
  
  // Calendar date state
  const weekStart = useMemo(() => {
    if (calendarWeekStart) {
      const date = dayjs(calendarWeekStart);
      // Ensure it's Monday (start of week in dayjs is Sunday, so add 1 day)
      return date.day() === 0 ? date.add(1, "day") : date.startOf("week").add(1, "day");
    }
    // Default to current week (Monday)
    const today = dayjs();
    return today.day() === 0 ? today.add(1, "day") : today.startOf("week").add(1, "day");
  }, [calendarWeekStart]);
  
  const month = useMemo(() => {
    if (calendarMonth) {
      return dayjs(calendarMonth);
    }
    return dayjs(); // Current month
  }, [calendarMonth]);

  // Debounce search
  const debouncedSearch = useDebounce(searchInput, 500);

  // Sync search input with URL
  React.useEffect(() => {
    setSearchInput(searchText);
  }, [searchText]);

  // Update URL when debounced search changes
  React.useEffect(() => {
    if (debouncedSearch !== searchText) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`/schedule?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, searchText, searchParams, router]);

  // Determine date range and filters based on view
  const calendarDateRange = useMemo(() => {
    if (view === "weekly" && weekStart) {
      // WeekStart is Monday, weekEnd is Sunday (6 days later)
      const weekEnd = weekStart.add(6, "day");
      return {
        from: weekStart.format("YYYY-MM-DD"),
        to: weekEnd.format("YYYY-MM-DD"),
      };
    } else if (view === "monthly" && month) {
      return {
        from: month.startOf("month").format("YYYY-MM-DD"),
        to: month.endOf("month").format("YYYY-MM-DD"),
      };
    }
    return { from: defaultFrom, to: defaultTo };
  }, [view, weekStart, month, defaultFrom, defaultTo]);

  // Determine patient/staff filter for calendar views
  const calendarPatientFilter = view !== "table" && calendarFilterBy === "client" ? calendarClientId : undefined;
  const calendarStaffFilter = view !== "table" && calendarFilterBy === "employee" ? calendarEmployeeId : undefined;
  
  // Use table filters when in table view, calendar filters when in calendar view
  const effectivePatientFilter = view === "table" ? (patientFilter || undefined) : calendarPatientFilter;
  const effectiveStaffFilter = view === "table" ? (staffFilter || undefined) : calendarStaffFilter;
  const effectiveStatusFilter = statusFilter || undefined;

  // For calendar views, fetch all events (no pagination)
  const calendarPageSize = view === "table" ? pageSize : 1000; // Large size to get all events

  // Use React Query
  const { data, isLoading } = useSchedules(
    {
      from: calendarDateRange.from,
      to: calendarDateRange.to,
      patientId: effectivePatientFilter,
      staffId: effectiveStaffFilter,
      status: effectiveStatusFilter,
      search: view === "table" ? searchText : undefined, // No search in calendar views
      page: view === "table" ? currentPage - 1 : 0,
      size: calendarPageSize,
      sortBy: view === "table" ? sortBy : "eventDate",
      sortDir: view === "table" ? sortDir : "asc",
    },
    {
      initialData: view === "table" ? initialData : undefined,
    }
  );
  
  // Get all events for calendar views (flatten paginated data)
  const allEvents = useMemo(() => {
    if (view === "table") {
      return data?.content || [];
    }
    // For calendar views, we might need to fetch all pages
    // For now, use the first page (with large size)
    return data?.content || [];
  }, [data, view]);

  // Handle pagination change for ScheduleEventsTable
  const handlePaginationChange = (page: number, pageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("size", String(pageSize));
    router.push(`/schedule?${params.toString()}`, { scroll: false });
  };

  // Handle sort change for ScheduleEventsTable
  const handleSortChange = (sortBy: string, sortDir: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortBy) {
      params.set("sortBy", sortBy);
      params.set("sortDir", sortDir);
    } else {
      params.delete("sortBy");
      params.delete("sortDir");
    }
    params.set("page", "1");
    router.push(`/schedule?${params.toString()}`, { scroll: false });
  };

  // Handle date range change
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (dates && dates[0] && dates[1]) {
      params.set("from", dates[0].format("YYYY-MM-DD"));
      params.set("to", dates[1].format("YYYY-MM-DD"));
      params.set("page", "1");
    } else {
      params.delete("from");
      params.delete("to");
    }
    router.push(`/schedule?${params.toString()}`, { scroll: false });
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/schedule?${params.toString()}`, { scroll: false });
  };

  const handleCreateSuccess = () => {
    router.refresh();
  };

  // Handle export to PDF
  const handleExport = async () => {
    try {
      // Get events to export based on current view
      const eventsToExport = view === "table" ? (data?.content || []) : allEvents;
      
      if (!eventsToExport || eventsToExport.length === 0) {
        message.warning("No events to export");
        return;
      }

      // Determine title based on filters
      let title = "Schedule Export";
      
      if (selectedEmployee) {
        // Split displayName to get firstName and lastName
        const nameParts = selectedEmployee.displayName.split(" ");
        const lastName = nameParts[nameParts.length - 1];
        const firstName = nameParts.slice(0, -1).join(" ");
        title = `Schedules of ${lastName}, ${firstName} Employee`;
      } else if (selectedClient) {
        // Split displayName to get firstName and lastName
        const nameParts = selectedClient.displayName.split(" ");
        const lastName = nameParts[nameParts.length - 1];
        const firstName = nameParts.slice(0, -1).join(" ");
        title = `Schedules of ${lastName}, ${firstName} Client`;
      }

      await exportPdf(eventsToExport, title);
      message.success("PDF exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      message.error("Failed to export PDF. Please try again.");
    }
  };

  // Handle view change
  const handleViewChange = (newView: "table" | "weekly" | "monthly") => {
    // If switching to table view, update URL immediately
    if (newView === "table") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", "table");
      // Clear calendar filters when switching to table view
      params.delete("calendarFilterBy");
      params.delete("calendarClientId");
      params.delete("calendarEmployeeId");
      params.delete("calendarWeekStart");
      params.delete("calendarMonth");
      router.push(`/schedule?${params.toString()}`, { scroll: false });
      setPendingView(null);
      return;
    }
    
    // If switching to calendar view and no filter, just open modal (don't update URL)
    if ((newView === "weekly" || newView === "monthly") && !calendarFilterBy) {
      setPendingView(newView); // Store the view to apply after filter is selected
      setFilterModalOpen(true);
      return;
    }
    
    // If switching to calendar view and filter exists, update URL
    if ((newView === "weekly" || newView === "monthly") && calendarFilterBy) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", newView);
      router.push(`/schedule?${params.toString()}`, { scroll: false });
      setPendingView(null);
    }
  };

  // Handle calendar filter apply
  const handleCalendarFilterApply = (filters: {
    filterBy: "client" | "employee";
    clientId?: string;
    employeeId?: string;
    weekRange?: [dayjs.Dayjs, dayjs.Dayjs];
    month?: dayjs.Dayjs;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Set the view (use pendingView if exists, otherwise use current view)
    const targetView = pendingView || view;
    if (targetView === "weekly" || targetView === "monthly") {
      params.set("view", targetView);
    }
    
    params.set("calendarFilterBy", filters.filterBy);
    
    if (filters.filterBy === "client" && filters.clientId) {
      params.set("calendarClientId", filters.clientId);
      params.delete("calendarEmployeeId");
    } else if (filters.filterBy === "employee" && filters.employeeId) {
      params.set("calendarEmployeeId", filters.employeeId);
      params.delete("calendarClientId");
    }
    
    if (targetView === "weekly" && filters.weekRange) {
      params.set("calendarWeekStart", filters.weekRange[0].format("YYYY-MM-DD"));
    } else if (targetView === "monthly" && filters.month) {
      params.set("calendarMonth", filters.month.format("YYYY-MM"));
    }
    
    setFilterModalOpen(false);
    setPendingView(null);
    router.push(`/schedule?${params.toString()}`, { scroll: false });
  };

  // Get selected client/employee name for display
  const selectedClient = useMemo(() => {
    if (calendarFilterBy === "client" && calendarClientId) {
      return patients.find((p) => p.id === calendarClientId);
    }
    return null;
  }, [calendarFilterBy, calendarClientId, patients]);

  const selectedEmployee = useMemo(() => {
    if (calendarFilterBy === "employee" && calendarEmployeeId) {
      return staff.find((s) => s.id === calendarEmployeeId);
    }
    return null;
  }, [calendarFilterBy, calendarEmployeeId, staff]);

  // Week/Month display text
  const calendarDateDisplay = useMemo(() => {
    if (view === "weekly" && weekStart) {
      const weekEnd = weekStart.add(6, "day");
      return `${weekStart.format("MMM DD")} - ${weekEnd.format("MMM DD YYYY")}`;
    } else if (view === "monthly" && month) {
      return month.format("MMMM YYYY");
    }
    return "";
  }, [view, weekStart, month]);

  // Check if calendar view needs filter - redirect to table view if no filter
  useEffect(() => {
    if ((view === "weekly" || view === "monthly") && !calendarFilterBy) {
      // If in calendar view without filter, redirect to table view
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", "table");
      params.delete("calendarFilterBy");
      params.delete("calendarClientId");
      params.delete("calendarEmployeeId");
      params.delete("calendarWeekStart");
      params.delete("calendarMonth");
      router.replace(`/schedule?${params.toString()}`, { scroll: false });
    }
  }, [view, calendarFilterBy, searchParams, router]);

  return (
    <div className={layoutStyles.pageContainer}>
      <Card className={layoutStyles.controlBar} variant="borderless">
        <div className={layoutStyles.controlsRow}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className={buttonStyles.btnPrimary}
            onClick={() => setCreateModalOpen(true)}
          >
            CREATE SCHEDULE
          </Button>

          <Space size="middle" className={layoutStyles.rightControls}>
            {/* Date Range Picker - Only show in table view */}
            {view === "table" && (
              <RangePicker
                value={[dayjs(defaultFrom), dayjs(defaultTo)]}
                onChange={handleDateRangeChange}
                format="MM/DD/YYYY"
              />
            )}

            {/* Patient Filter - Only show in table view */}
            {view === "table" && (
              <Select
                placeholder="All Patients"
                value={patientFilter || undefined}
                onChange={(value) => handleFilterChange("patientId", value)}
                allowClear
                showSearch
                style={{ width: 200 }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={patients.map((p) => ({
                  label: p.displayName,
                  value: p.id,
                }))}
              />
            )}

            {/* Staff Filter - Only show in table view */}
            {view === "table" && (
              <Select
                placeholder="All Employees"
                value={staffFilter || undefined}
                onChange={(value) => handleFilterChange("staffId", value)}
                allowClear
                showSearch
                style={{ width: 200 }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={staff.map((s) => ({
                  label: s.displayName,
                  value: s.id,
                }))}
              />
            )}

            {/* Status Filter */}
            <Select
              placeholder="All Statuses"
              value={statusFilter || undefined}
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
              style={{ width: 150 }}
              options={[
                { label: "Planned", value: "PLANNED" },
                { label: "Confirmed", value: "CONFIRMED" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Completed", value: "COMPLETED" },
                { label: "Cancelled", value: "CANCELLED" },
              ]}
            />

            {/* View Select */}
            <Select
              value={view}
              style={{ width: 150 }}
              onChange={handleViewChange}
              options={[
                { label: "Table View", value: "table" },
                { label: "Weekly Calendar", value: "weekly" },
                { label: "Monthly Calendar", value: "monthly" },
              ]}
            />

            {/* Search - Only show in table view */}
            {view === "table" && (
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={layoutStyles.searchInput}
                allowClear
              />
            )}

            <Button
              type="default"
              icon={<ExportOutlined />}
              className={buttonStyles.btnSecondary}
              onClick={handleExport}
              loading={isExporting}
            >
              EXPORT
            </Button>
          </Space>
        </div>
      </Card>

      {/* Filter Controls Bar for Calendar Views */}
      {(view === "weekly" || view === "monthly") && calendarFilterBy && (
        <Card className={layoutStyles.controlBar} variant="borderless" style={{ marginBottom: "16px" }}>
          <div className={layoutStyles.controlsRow} style={{ flexWrap: "wrap", gap: "12px" }}>
            <Space size="middle" wrap>
              {/* Status Filter */}
              <Select
                placeholder="STATUS"
                value={statusFilter || undefined}
                onChange={(value) => handleFilterChange("status", value)}
                allowClear
                style={{ width: 150 }}
                options={[
                  { label: "Planned", value: "PLANNED" },
                  { label: "Confirmed", value: "CONFIRMED" },
                  { label: "In Progress", value: "IN_PROGRESS" },
                  { label: "Completed", value: "COMPLETED" },
                  { label: "Cancelled", value: "CANCELLED" },
                ]}
              />

              {/* Client/Employee Tag */}
              {selectedClient && (
                <Tag
                  color="blue"
                  closable
                  onClose={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("calendarFilterBy");
                    params.delete("calendarClientId");
                    params.delete("calendarWeekStart");
                    params.delete("calendarMonth");
                    // Switch back to table view when filter is removed
                    params.set("view", "table");
                    router.push(`/schedule?${params.toString()}`, { scroll: false });
                  }}
                  style={{ padding: "4px 8px", fontSize: "13px" }}
                >
                  Client: {selectedClient.displayName} {calendarDateDisplay && `| ${calendarDateDisplay}`}
                  <EditOutlined
                    style={{ marginLeft: "8px", cursor: "pointer" }}
                    onClick={() => setFilterModalOpen(true)}
                  />
                </Tag>
              )}

              {selectedEmployee && (
                <Tag
                  color="blue"
                  closable
                  onClose={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("calendarFilterBy");
                    params.delete("calendarEmployeeId");
                    params.delete("calendarWeekStart");
                    params.delete("calendarMonth");
                    // Switch back to table view when filter is removed
                    params.set("view", "table");
                    router.push(`/schedule?${params.toString()}`, { scroll: false });
                  }}
                  style={{ padding: "4px 8px", fontSize: "13px" }}
                >
                  Employee: {selectedEmployee.displayName} {calendarDateDisplay && `| ${calendarDateDisplay}`}
                  <EditOutlined
                    style={{ marginLeft: "8px", cursor: "pointer" }}
                    onClick={() => setFilterModalOpen(true)}
                  />
                </Tag>
              )}

              {/* Collapse/Expand All */}
              <Space>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Collapse All</span>
                <Switch
                  checked={!collapsed}
                  onChange={(checked) => setCollapsed(!checked)}
                  size="small"
                />
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Expand All</span>
              </Space>
            </Space>
          </div>
        </Card>
      )}

      {/* Conditional Rendering */}
      {view === "table" ? (
        <Card className={layoutStyles.tableCard} variant="borderless">
          <ScheduleEventsTable
            data={data?.content || []}
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: data?.page?.totalElements || 0,
              onChange: handlePaginationChange,
            }}
            onSortChange={handleSortChange}
            context="global"
            onEdit={(event) => {
              router.push(`/schedule/${event.id}/edit`);
            }}
          />
        </Card>
      ) : view === "weekly" ? (
        <Card className={layoutStyles.tableCard} variant="borderless">
          <WeeklyCalendar
            events={allEvents}
            weekStart={weekStart}
            collapsed={collapsed}
            onEventClick={(event) => {
              router.push(`/schedule/${event.id}/edit`);
            }}
          />
        </Card>
      ) : (
        <Card className={layoutStyles.tableCard} variant="borderless">
          <MonthlyCalendar
            events={allEvents}
            month={month}
            collapsed={collapsed}
            onEventClick={(event) => {
              router.push(`/schedule/${event.id}/edit`);
            }}
            onMonthChange={(newMonth) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("calendarMonth", newMonth.format("YYYY-MM"));
              router.push(`/schedule?${params.toString()}`, { scroll: false });
            }}
          />
        </Card>
      )}

      {/* Calendar Filter Modal */}
      <CalendarViewFilterModal
        open={filterModalOpen}
        viewType={(pendingView || view) === "weekly" ? "weekly" : "monthly"}
        patients={patients}
        staff={staff}
        initialFilterBy={calendarFilterBy || undefined}
        initialClientId={calendarClientId}
        initialEmployeeId={calendarEmployeeId}
        initialWeekRange={
          weekStart
            ? [weekStart, weekStart.add(6, "day")]
            : undefined
        }
        initialMonth={month}
        onCancel={() => {
          setFilterModalOpen(false);
          setPendingView(null); // Clear pending view on cancel
          // If no filter was set and we had a pending view, ensure we stay in table view
          if (pendingView && !calendarFilterBy) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("view", "table");
            router.push(`/schedule?${params.toString()}`, { scroll: false });
          }
        }}
        onApply={handleCalendarFilterApply}
      />

      {/* Create Schedule Modal */}
      <CreateScheduleForm
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

