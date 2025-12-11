"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, Button, Input, Select, Space, App, DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import {
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  UpOutlined,
  DownOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type {
  TemplateEventDTO,
} from "@/types/schedule";
import TemplateCalendar from "@/components/patients/schedule/TemplateCalendar";
import GenerateScheduleForm from "@/components/patients/schedule/GenerateScheduleForm";
import dayjs from "dayjs";
import AddEventForm from "./schedule/AddEventForm";
import ScheduleEventsTable from "./schedule/ScheduleEventsTable";
import CreateScheduleForm from "@/components/schedule/CreateScheduleForm";
import buttonStyles from "@/styles/buttons.module.css";
import { usePatientTemplateWithWeeks, usePatientScheduleEventsPaginated, useCreateTemplate, useAddWeek, useDeleteWeek, useDeleteTemplate, useCreateTemplateEvent, useUpdateTemplateEvent, useGenerateSchedule, useRelatedStaffForPatient } from "@/hooks/usePatientSchedule";
import { apiClient } from "@/lib/apiClient";
import { useQueryClient } from "@tanstack/react-query";

interface PatientScheduleProps {
  patientId: string;
}

interface WeekSectionProps {
  weekIndex: number;
  events: TemplateEventDTO[];
  isCollapsed: boolean;
  onEditEvent: (event: TemplateEventDTO) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: (weekIndex: number) => void;
  onDeleteWeek: () => void;
  onToggleCollapse: () => void;
}

function WeekSection({ weekIndex, events, isCollapsed, onEditEvent, onDeleteEvent, onAddEvent, onDeleteWeek, onToggleCollapse }: WeekSectionProps) {
  const templateEvents: TemplateEventDTO[] = useMemo(() => {
    return (events || []).map((e) => ({
      ...e,
      weekday: e.weekday ?? e.dayOfWeek, // dayOfWeek is already 0-6
    }));
  }, [events]);

  return (
    <>
      {/* Week Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 bg-primary border-t border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={isCollapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={onToggleCollapse}
            className="text-[var(--text-primary)]"
          />
          <span className="font-semibold text-sm text-[var(--text-primary)]">
            Week {weekIndex}
          </span>
          <Button type="link" icon={<PlusOutlined />} onClick={() => onAddEvent(weekIndex)} className= {buttonStyles.btnCancel + " text-[var(--primary)] font-bold"}>
            ADD EVENT
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={onDeleteWeek}
            danger
            className="text-red-500"
          />
        </div>
      </div>

      {/* Calendar - Only show if not collapsed */}
      {!isCollapsed && (
        <div className="p-0">
          <TemplateCalendar
            events={templateEvents}
            weekNumber={weekIndex}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
        </div>
      )}
    </>
  );
}


export default function PatientSchedule({ patientId }: PatientScheduleProps) {
  const { modal } = App.useApp();
  const queryClient = useQueryClient();

  // Get template with all weeks
  const { data: templateWithWeeks } = usePatientTemplateWithWeeks(patientId);

  // Collapsed state: default Week 1 expanded, others collapsed
  const [collapsedWeeks, setCollapsedWeeks] = useState<Set<number>>(new Set());

  // Update collapsed state when template data changes
  const weekIndexesStr = templateWithWeeks?.weeks?.map(w => w.weekIndex).sort().join(',') || '';
  useEffect(() => {
    if (templateWithWeeks?.weeks && templateWithWeeks.weeks.length > 0) {
      setCollapsedWeeks(prev => {
        // Only update if weeks have changed
        const currentWeekIndexes = new Set(templateWithWeeks.weeks.map(w => w.weekIndex));
        const prevWeekIndexes = new Set(Array.from(prev));
        
        // Check if sets are different
        if (currentWeekIndexes.size !== prevWeekIndexes.size ||
            !Array.from(currentWeekIndexes).every(w => prevWeekIndexes.has(w))) {
          // All weeks collapsed except Week 1
          const newSet = new Set(currentWeekIndexes);
          newSet.delete(1);
          return newSet;
        }
        return prev;
      });
    } else if (!templateWithWeeks) {
      // Reset collapsed weeks when template is deleted
      setCollapsedWeeks(new Set());
    }
  }, [weekIndexesStr, templateWithWeeks?.weeks, templateWithWeeks]);

  const hasTemplate = !!templateWithWeeks && templateWithWeeks.template !== null;

  // Filter state for schedule events
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs(),
    dayjs().add(30, "day"),
  ]);
  const [filterStaffId, setFilterStaffId] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1); // UI uses 1-based
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string>("eventDate");
  const [sortDir, setSortDir] = useState<string>("asc");
  const [searchText, setSearchText] = useState("");

  // Fetch related staff list for dropdown (only staff with schedule events for this patient)
  const { data: staffList = [] } = useRelatedStaffForPatient(patientId);

  const fmt = (d: Dayjs) => d.format("YYYY-MM-DD");

  // Fetch schedule events with pagination
  const { data: scheduleEventsPage, isLoading: scheduleLoading } = usePatientScheduleEventsPaginated(
    patientId,
    {
      from: fmt(dateRange[0]),
      to: fmt(dateRange[1]),
      status: filterStatus,
      staffId: filterStaffId,
      search: searchText || undefined,
      page: currentPage - 1, // Convert to 0-based for backend
      size: pageSize,
      sortBy,
      sortDir,
    }
  );

  const scheduleEvents = scheduleEventsPage?.content || [];

  // Mutations
  const createTemplateMutation = useCreateTemplate(patientId);
  const addWeekMutation = useAddWeek(patientId);
  const deleteWeekMutation = useDeleteWeek(patientId);
  const deleteTemplateMutation = useDeleteTemplate(patientId);
  const generateScheduleMutation = useGenerateSchedule(patientId);

  // Modal states
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isAddEventFormOpen, setIsAddEventFormOpen] = useState(false);
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TemplateEventDTO | null>(
    null
  );
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);

  // Pagination handlers
  const handlePaginationChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };

  const handleSortChange = (field: string, direction: string) => {
    setSortBy(field);
    setSortDir(direction);
  };

  const handleEditEvent = (event: TemplateEventDTO) => {
    setEditingEvent(event);
    setIsAddEventFormOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) return;
    try {
      await apiClient<TemplateEventDTO[]>(`/patients/${patientId}/schedule/template/events/${eventId}`, {
        method: "DELETE",
      });
      await queryClient.invalidateQueries({ queryKey: ["patient-template-with-weeks", patientId] });
      await queryClient.refetchQueries({ queryKey: ["patient-template-with-weeks", patientId], exact: true });
    } catch (error) {
      console.error("Failed to delete template event:", error);
    }
  };

  const handleAddEvent = (weekIndex: number) => {
    setEditingEvent(null);
    setIsAddEventFormOpen(true);
    setSelectedWeekIndex(weekIndex);
  };

  const createTemplateEventMutation = useCreateTemplateEvent(patientId);
  const updateTemplateEventMutation = useUpdateTemplateEvent(patientId, editingEvent?.id || "");

  const handleSaveEvent = async (data: import("@/types/schedule").AddEventFormData) => {
    const toMinutes = (t: string) => {
      const [hh, mm] = t.split(":");
      return parseInt(hh) * 60 + parseInt(mm);
    };
    const plannedUnits = Math.max(0, toMinutes(data.endTime) - toMinutes(data.startTime));
    
    try {
      if (editingEvent) {
        // Edit mode: use PUT endpoint with single weekday
        await updateTemplateEventMutation.mutateAsync({
          dayOfWeek: data.weekday, // Single value for edit
          startTime: data.startTime,
          endTime: data.endTime,
          authorizationId: data.serviceId,
          eventCode: data.eventCode,
          plannedUnits,
          staffId: data.employeeId,
          comment: data.comments,
        } as unknown as Record<string, unknown>);
      } else {
        // Create mode: use POST endpoint with multiple weekdays
        if (!selectedWeekIndex) return;
        await createTemplateEventMutation.mutateAsync({
          weekIndex: selectedWeekIndex,
          weekdays: data.weekdays, // Array of weekdays for create
          startTime: data.startTime,
          endTime: data.endTime,
          authorizationId: data.serviceId,
          eventCode: data.eventCode,
          plannedUnits,
          staffId: data.employeeId,
          comment: data.comments,
        } as unknown as Record<string, unknown>);
      }
      // Keep modal open to show success message; allow user to close manually
      await queryClient.invalidateQueries({ queryKey: ["patient-template-with-weeks", patientId] });
      await queryClient.refetchQueries({ queryKey: ["patient-template-with-weeks", patientId], exact: true });
    } catch (error) {
      // Error will be shown via mutation error state
      console.error(editingEvent ? "Failed to update event:" : "Failed to create event:", error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await createTemplateMutation.mutateAsync({ name: "Master Weekly" });
      // Invalidate and refetch template with weeks
      await queryClient.invalidateQueries({ queryKey: ["patient-template-with-weeks", patientId] });
      await queryClient.refetchQueries({ queryKey: ["patient-template-with-weeks", patientId] });
    } catch {
      // Silent fail - no message
    }
  };

  const handleAddWeek = async () => {
    // Calculate next week index (max + 1)
    const nextWeekIndex = templateWithWeeks?.weeks?.length 
      ? Math.max(...templateWithWeeks.weeks.map(w => w.weekIndex)) + 1 
      : 1;
    try {
      await addWeekMutation.mutateAsync({ weekIndex: nextWeekIndex });
      // Invalidate and refetch template with weeks
      await queryClient.invalidateQueries({ queryKey: ["patient-template-with-weeks", patientId] });
      await queryClient.refetchQueries({ queryKey: ["patient-template-with-weeks", patientId] });
    } catch {
      // Silent fail - no message
    }
  };

  const handleDeleteWeek = (weekIndex: number) => {
    modal.confirm({
      title: "Delete Week",
      content: `Are you sure you want to delete Week ${weekIndex}? This action cannot be undone and will delete all events in this week.`,
      okText: "DELETE",
      okType: "danger",
      cancelText: "CANCEL",
      centered: true,
      okButtonProps: {
        className: buttonStyles.btnDanger,
      },
      cancelButtonProps: {
        className: buttonStyles.btnCancel,
      },
      onOk: async () => {
        try {
          await deleteWeekMutation.mutateAsync({ weekIndex });
          // Remove from collapsed set if present
          setCollapsedWeeks(prev => {
            const newSet = new Set(prev);
            newSet.delete(weekIndex);
            return newSet;
          });
          // Invalidate and refetch template with weeks
          queryClient.invalidateQueries({ queryKey: ["patient-template-with-weeks", patientId] });
          await queryClient.refetchQueries({ 
            queryKey: ["patient-template-with-weeks", patientId],
            exact: true 
          });
        } catch (error) {
          console.error("Failed to delete week:", error);
        }
      },
    });
  };

  const handleDeleteTemplate = () => {
    modal.confirm({
      title: "Delete Template",
      content: "Are you sure you want to delete this schedule template? This action cannot be undone and will delete all weeks and events.",
      okText: "DELETE",
      okType: "danger",
      cancelText: "CANCEL",
      centered: true,
      okButtonProps: {
        className: buttonStyles.btnDanger,
      },
      cancelButtonProps: {
        className: buttonStyles.btnCancel,
      },
      onOk: async () => {
        try {
          await deleteTemplateMutation.mutateAsync();
          // Reset collapsed weeks state
          setCollapsedWeeks(new Set());
          // Invalidate and force refetch - this will show "no template" state immediately
          queryClient.removeQueries({ queryKey: ["patient-template-with-weeks", patientId] });
          await queryClient.refetchQueries({ 
            queryKey: ["patient-template-with-weeks", patientId],
            exact: true 
          });
        } catch (error) {
          console.error("Failed to delete template:", error);
        }
      },
    });
  };

  const handleToggleCollapse = (weekIndex: number) => {
    setCollapsedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekIndex)) {
        newSet.delete(weekIndex);
      } else {
        newSet.add(weekIndex);
      }
      return newSet;
    });
  };

  const handleGenerate = async (data: import("@/types/schedule").GenerateScheduleFormData) => {
    try {
      await generateScheduleMutation.mutateAsync({ endDate: data.endDate });
      // refresh template (to reflect generatedThrough) and events list
      await queryClient.invalidateQueries({ queryKey: ["patient-template-with-weeks", patientId] });
      await queryClient.invalidateQueries({ queryKey: ["patient-schedule-events", patientId] });
    } finally {
      setIsGenerateModalOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Template Schedule Section */}
        <Card className="border-none shadow-none" variant="borderless" styles={{ body: { paddingTop: 0 } }}>
          {hasTemplate ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-2 bg-surface-theme border-b border-[var(--border-color)]">
                <div className="flex flex-col sm:flex-row py-2 items-start sm:items-center gap-3 sm:gap-4 text-sm text-[var(--text-primary)]">
                  <span>
                    Generated Through: {
                      templateWithWeeks?.template?.generatedThrough
                        ? dayjs(templateWithWeeks.template.generatedThrough).format("MM/DD/YYYY")
                        : "—"
                    }
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f] rounded font-medium">
                    <CheckCircleOutlined />
                    Active
                  </span>
                  <Button type="primary" className={buttonStyles.btnPrimary} onClick={() => setIsGenerateModalOpen(true)}>
                    GENERATE
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    className= {buttonStyles.btnCancel + " text-[var(--primary)] font-bold"}
                    onClick={handleAddWeek}
                    loading={addWeekMutation.isPending}
                  >
                    ADD WEEK
                  </Button>
                  <Button 
                    className={buttonStyles.btnDanger}
                    onClick={handleDeleteTemplate}
                    loading={deleteTemplateMutation.isPending}
                  >
                    DELETE TEMPLATE
                  </Button>
                </div>
              </div>

              {/* All Weeks */}
              {templateWithWeeks.weeks.map((week) => (
                <WeekSection
                  key={week.weekIndex}
                  weekIndex={week.weekIndex}
                  events={week.events}
                  isCollapsed={collapsedWeeks.has(week.weekIndex)}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onAddEvent={handleAddEvent}
                  onDeleteWeek={() => handleDeleteWeek(week.weekIndex)}
                  onToggleCollapse={() => handleToggleCollapse(week.weekIndex)}
                />
              ))}
            </>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center gap-4">
              <div className="text-sm text-[var(--text-secondary)]">
                No schedule template found for this patient.
              </div>
              <Button
                type="primary"
                className={buttonStyles.btnPrimary}
                onClick={handleCreateTemplate}
                loading={createTemplateMutation.isPending}
              >
                CREATE TEMPLATE
              </Button>
            </div>
          )}
        </Card>

        {/* Generated Schedule Section */}
        <Card className="border-none shadow-none" variant="borderless">
          {/* Controls */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className={buttonStyles.btnPrimary}
                onClick={() => setIsCreateScheduleOpen(true)}
              >
                CREATE SCHEDULE
              </Button>

              <Space size="middle" wrap>
                <Input
                  placeholder="Type here for a quick search..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1); // Reset to first page
                  }}
                  style={{ minWidth: 240 }}
                  allowClear
                />
                <DatePicker.RangePicker
                  value={dateRange}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([dates[0], dates[1]]);
                      setCurrentPage(1); // Reset to first page
                    }
                  }}
                  format="MM/DD/YYYY"
                  style={{ width: 240 }}
                />
                <Select
                  placeholder="Employee"
                  style={{ width: 180 }}
                  showSearch
                  value={filterStaffId}
                  onChange={(value) => {
                    setFilterStaffId(value);
                    setCurrentPage(1); // Reset to first page
                  }}
                  options={staffList.map(staff => ({
                    value: staff.id,
                    label: staff.displayName,
                  }))}
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
                <Select
                  placeholder="STATUS"
                  style={{ width: 130 }}
                  value={filterStatus}
                  onChange={(value) => {
                    setFilterStatus(value);
                    setCurrentPage(1); // Reset to first page
                  }}
                  options={[
                    { value: "CONFIRMED", label: "Confirmed" },
                    { value: "CANCELLED", label: "Cancelled" },
                    { value: "PLANNED", label: "Planned" },
                    { value: "IN_PROGRESS", label: "In Progress" },
                    { value: "COMPLETED", label: "Completed" },
                    { value: "DRAFT", label: "Draft" },
                  ]}
                  allowClear
                />
                <Button
                  icon={<ExportOutlined />}
                  className={buttonStyles.btnSecondary}
                >
                  EXPORT DATA
                </Button>
              </Space>
            </div>
          </div>

          {/* Start of Care Info */}
          <div className="px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
            <span className="text-sm text-[var(--text-secondary)]">
              Start of Care: (05/19/2025)
            </span>
          </div>

          {/* Table */}
          <div className="p-0">
            <ScheduleEventsTable
              data={scheduleEvents}
              loading={scheduleLoading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: scheduleEventsPage?.totalElements || 0,
                onChange: handlePaginationChange,
              }}
              onSortChange={handleSortChange}
              context="patient"
              onEdit={() => {
                // TODO: implement edit
              }}
            />
          </div>
        </Card>

        {/* Modals */}
        <GenerateScheduleForm
          open={isGenerateModalOpen}
          onCancel={() => setIsGenerateModalOpen(false)}
          onGenerate={handleGenerate}
          currentEndDate={templateWithWeeks?.template?.generatedThrough ?? undefined}
          isGenerating={generateScheduleMutation.isPending}
          templateWeeks={templateWithWeeks?.weeks}
        />

        <AddEventForm
          open={isAddEventFormOpen}
          onCancel={() => {
            setIsAddEventFormOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
          initialData={editingEvent}
          patientId={patientId}
          mutationError={editingEvent ? updateTemplateEventMutation.error : createTemplateEventMutation.error}
          mutationIsSuccess={editingEvent ? updateTemplateEventMutation.isSuccess : createTemplateEventMutation.isSuccess}
        />

        <CreateScheduleForm
          open={isCreateScheduleOpen}
          onCancel={() => setIsCreateScheduleOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["patient-schedule-events", patientId] });
            setIsCreateScheduleOpen(false);
          }}
          preselectedPatientId={patientId}
        />
      </div>
    {/* Apply custom styles to Ant Design Card */}
    <style jsx global>{`
        .ant-card .ant-card-body {
          border-radius: 0 !important;
          border: 0 !important
          padding: 0 !important
        }
        .ant-card-head {
          border-bottom: none !important;
          border-radius: 0 !important;
          border: 0 !important
          padding: 0 !important
        }
        .ant-card-body {
          border-radius: 0 !important;
          border: 0 !important
          padding: 0 !important
        }
      `}</style>
    </>
  );
}

