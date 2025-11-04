"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, Button, Input, Select, Space, App } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
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
import AddEventForm from "./schedule/AddEventForm";
import ScheduleEventsTable from "./schedule/ScheduleEventsTable";
import buttonStyles from "@/styles/buttons.module.css";
import { usePatientTemplateWithWeeks, usePatientScheduleEvents, useCreateTemplate, useAddWeek, useDeleteWeek, useDeleteTemplate, useCreateTemplateEvent } from "@/hooks/usePatientSchedule";
import { useQueryClient } from "@tanstack/react-query";

interface PatientScheduleProps {
  patientId: string;
}

interface WeekSectionProps {
  weekIndex: number;
  events: TemplateEventDTO[];
  isCollapsed: boolean;
  onEditEvent: (event: TemplateEventDTO) => void;
  onDeleteEvent: () => void;
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

  // Schedule events (range: today -7 .. today +7)
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 7);
  const to = new Date(today);
  to.setDate(today.getDate() + 7);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const { data: scheduleEvents = [], isLoading: scheduleLoading } = usePatientScheduleEvents(
    patientId,
    { from: fmt(from), to: fmt(to) }
  );

  // Mutations
  const createTemplateMutation = useCreateTemplate(patientId);
  const addWeekMutation = useAddWeek(patientId);
  const deleteWeekMutation = useDeleteWeek(patientId);
  const deleteTemplateMutation = useDeleteTemplate(patientId);

  // Modal states
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isAddEventFormOpen, setIsAddEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TemplateEventDTO | null>(
    null
  );
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);

  // Filter states
  const [searchText, setSearchText] = useState("");

  const handleEditEvent = (event: TemplateEventDTO) => {
    setEditingEvent(event);
    setIsAddEventFormOpen(true);
  };

  const handleDeleteEvent = () => {
    // TODO: wire to delete mutation once edit modal exposes id
  };

  const handleAddEvent = (weekIndex: number) => {
    setEditingEvent(null);
    setIsAddEventFormOpen(true);
    setSelectedWeekIndex(weekIndex);
  };

  const createTemplateEventMutation = useCreateTemplateEvent(patientId);

  const handleSaveEvent = async (data: import("@/types/schedule").AddEventFormData) => {
    if (!selectedWeekIndex) return;
    const toMinutes = (t: string) => {
      const [hh, mm] = t.split(":");
      return parseInt(hh) * 60 + parseInt(mm);
    };
    const plannedUnits = Math.max(0, toMinutes(data.endTime) - toMinutes(data.startTime));
    try {
      await createTemplateEventMutation.mutateAsync({
        weekIndex: selectedWeekIndex,
        weekdays: data.weekdays,
        startTime: data.startTime,
        endTime: data.endTime,
        authorizationId: data.serviceId,
        eventCode: data.eventCode,
        plannedUnits,
        staffId: data.employeeId,
        comment: data.comments,
      } as unknown as Record<string, unknown>);
      // Keep modal open to show success message; allow user to close manually
      await queryClient.invalidateQueries({ queryKey: ["patient-template-with-weeks", patientId] });
      await queryClient.refetchQueries({ queryKey: ["patient-template-with-weeks", patientId], exact: true });
    } catch (error) {
      // Error will be shown via mutation error state
      console.error("Failed to create event:", error);
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

  const handleGenerate = () => {
    setIsGenerateModalOpen(false);
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
                  <span>Generated Through: 07/04/2026</span>
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
              >
                CREATE SCHEDULE
              </Button>

              <Space size="middle" wrap>
                <Input
                  placeholder="Type here for a quick search..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ minWidth: 240 }}
                  allowClear
                />
                <Select
                  placeholder="DATE RANGE"
                  style={{ width: 150 }}
                  options={[
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                  ]}
                />
                <Select
                  placeholder="EMPLOYEE"
                  style={{ width: 150 }}
                  showSearch
                  options={[
                    { value: "1", label: "Clemens, Samantha" },
                    { value: "2", label: "Alverez, Julio" },
                    { value: "3", label: "Clossin, Bronwen" },
                  ]}
                />
                <Select
                  placeholder="STATUS"
                  style={{ width: 130 }}
                  options={[
                    { value: "CONFIRMED", label: "Confirmed" },
                    { value: "CANCELLED", label: "Cancelled" },
                    { value: "PLANNED", label: "Planned" },
                  ]}
                />
                <Button
                  icon={<FilterOutlined />}
                  className={buttonStyles.btnSecondary}
                >
                  FILTERS
                </Button>
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
                  onEdit={() => {
                    // TODO: implement edit
                  }}
                  onDelete={() => {
                    // TODO: implement delete
                  }}
            />
          </div>
        </Card>

        {/* Modals */}
        <GenerateScheduleForm
          open={isGenerateModalOpen}
          onCancel={() => setIsGenerateModalOpen(false)}
          onGenerate={handleGenerate}
          currentEndDate="2026-07-04"
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
          mutationError={createTemplateEventMutation.error}
          mutationIsSuccess={createTemplateEventMutation.isSuccess}
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

