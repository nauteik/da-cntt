"use client";

import React, { useState } from "react";
import { Card, Button, Input, Select, Space, message } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type {
  TemplateEventDTO,
  ScheduleEventDTO,
  ScheduleEventStatus,
  AddEventFormData,
  GenerateScheduleFormData,
} from "@/types/schedule";
import TemplateCalendar from "./schedule/TemplateCalendar";
import GenerateScheduleModal from "./schedule/GenerateScheduleModal";
import AddEventModal from "./schedule/AddEventModal";
import ScheduleEventsTable from "./schedule/ScheduleEventsTable";
import buttonStyles from "@/styles/buttons.module.css";

interface PatientScheduleProps {
  patientId: string;
}

// Mock data - in real app, this would come from API
const MOCK_TEMPLATE_EVENTS: TemplateEventDTO[] = [
  // Sunday
  {
    id: "1",
    weekday: 0,
    startTime: "07:00",
    endTime: "14:00",
    authorizationId: "auth1",
    serviceCode: "W1726",
    serviceName: "Companion Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  {
    id: "2",
    weekday: 0,
    startTime: "14:00",
    endTime: "21:00",
    authorizationId: "auth2",
    serviceCode: "W7060",
    serviceName: "IHCS Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  // Monday
  {
    id: "3",
    weekday: 1,
    startTime: "07:00",
    endTime: "14:00",
    authorizationId: "auth1",
    serviceCode: "W1726",
    serviceName: "Companion Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  {
    id: "4",
    weekday: 1,
    startTime: "14:00",
    endTime: "21:00",
    authorizationId: "auth2",
    serviceCode: "W7060",
    serviceName: "IHCS Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  // Tuesday
  {
    id: "5",
    weekday: 2,
    startTime: "07:00",
    endTime: "14:00",
    authorizationId: "auth1",
    serviceCode: "W1726",
    serviceName: "Companion Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  {
    id: "6",
    weekday: 2,
    startTime: "14:00",
    endTime: "21:00",
    authorizationId: "auth2",
    serviceCode: "W7060",
    serviceName: "IHCS Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  // Wednesday
  {
    id: "7",
    weekday: 3,
    startTime: "07:00",
    endTime: "14:00",
    authorizationId: "auth1",
    serviceCode: "W1726",
    serviceName: "Companion Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  {
    id: "8",
    weekday: 3,
    startTime: "14:00",
    endTime: "21:00",
    authorizationId: "auth2",
    serviceCode: "W7060",
    serviceName: "IHCS Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  // Thursday
  {
    id: "9",
    weekday: 4,
    startTime: "07:00",
    endTime: "14:00",
    authorizationId: "auth1",
    serviceCode: "W1726",
    serviceName: "Companion Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  {
    id: "10",
    weekday: 4,
    startTime: "14:00",
    endTime: "21:00",
    authorizationId: "auth2",
    serviceCode: "W7060",
    serviceName: "IHCS Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  // Friday
  {
    id: "11",
    weekday: 5,
    startTime: "07:00",
    endTime: "14:00",
    authorizationId: "auth1",
    serviceCode: "W1726",
    serviceName: "Companion Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  {
    id: "12",
    weekday: 5,
    startTime: "14:00",
    endTime: "21:00",
    authorizationId: "auth2",
    serviceCode: "W7060",
    serviceName: "IHCS Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  // Saturday
  {
    id: "13",
    weekday: 6,
    startTime: "07:00",
    endTime: "14:00",
    authorizationId: "auth1",
    serviceCode: "W1726",
    serviceName: "Companion Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
  {
    id: "14",
    weekday: 6,
    startTime: "14:00",
    endTime: "21:00",
    authorizationId: "auth2",
    serviceCode: "W7060",
    serviceName: "IHCS Level 2 (1:1)",
    eventCode: "NONE",
    plannedUnits: 28,
  },
];

const MOCK_SCHEDULE_EVENTS: ScheduleEventDTO[] = [
  {
    id: "se1",
    patientId: "patient1",
    eventDate: "2025-09-22",
    startAt: "2025-09-22T07:00:00Z",
    endAt: "2025-09-22T14:00:00Z",
    status: "CONFIRMED" as ScheduleEventStatus,
    plannedUnits: 28,
    actualUnits: 28,
    programName: "ODP",
    employeeName: "Clemens, Samantha",
    supervisorName: "Clossin, Bronwen",
    serviceCode: "W7060",
    eventCode: "NONE",
    checkInTime: "2025-09-22T07:02:00Z",
    checkOutTime: "2025-09-22T14:05:00Z",
  },
  {
    id: "se2",
    patientId: "patient1",
    eventDate: "2025-09-22",
    startAt: "2025-09-22T14:00:00Z",
    endAt: "2025-09-22T21:00:00Z",
    status: "CONFIRMED" as ScheduleEventStatus,
    plannedUnits: 28,
    actualUnits: 28,
    programName: "ODP",
    employeeName: "Clemens, Samantha",
    supervisorName: "Clossin, Bronwen",
    serviceCode: "W7060",
    eventCode: "NONE",
    checkInTime: "2025-09-22T14:00:00Z",
    checkOutTime: "2025-09-22T21:00:00Z",
  },
  {
    id: "se3",
    patientId: "patient1",
    eventDate: "2025-09-22",
    startAt: "2025-09-22T07:00:00Z",
    endAt: "2025-09-22T14:00:00Z",
    status: "CANCELLED" as ScheduleEventStatus,
    plannedUnits: 28,
    programName: "ODP",
    employeeName: "Alverez, Julio",
    supervisorName: "Clossin, Bronwen",
    serviceCode: "W1726",
    eventCode: "NONE",
  },
  {
    id: "se4",
    patientId: "patient1",
    eventDate: "2025-09-23",
    startAt: "2025-09-23T07:30:00Z",
    endAt: "2025-09-23T11:30:00Z",
    status: "CONFIRMED" as ScheduleEventStatus,
    plannedUnits: 16,
    actualUnits: 16,
    programName: "ODP",
    employeeName: "Clemens, Samantha",
    supervisorName: "Clossin, Bronwen",
    serviceCode: "W7060",
    eventCode: "NONE",
    checkInTime: "2025-09-23T06:58:00Z",
    checkOutTime: "2025-09-23T14:01:00Z",
  },
  {
    id: "se5",
    patientId: "patient1",
    eventDate: "2025-09-23",
    startAt: "2025-09-23T11:30:00Z",
    endAt: "2025-09-23T14:30:00Z",
    status: "PLANNED" as ScheduleEventStatus,
    plannedUnits: 12,
    programName: "ODP",
    employeeName: "Aleksandrovic, Janette",
    supervisorName: "Clossin, Bronwen",
    serviceCode: "W7060",
    eventCode: "NONE",
  },
  {
    id: "se6",
    patientId: "patient1",
    eventDate: "2025-09-23",
    startAt: "2025-09-23T14:00:00Z",
    endAt: "2025-09-23T21:00:00Z",
    status: "CONFIRMED" as ScheduleEventStatus,
    plannedUnits: 28,
    actualUnits: 27.83,
    programName: "ODP",
    employeeName: "Halvorson, Matthew",
    supervisorName: "Clossin, Bronwen",
    serviceCode: "W1726",
    eventCode: "NONE",
    checkInTime: "2025-09-23T14:02:00Z",
    checkOutTime: "2025-09-23T21:00:00Z",
  },
  {
    id: "se7",
    patientId: "patient1",
    eventDate: "2025-09-24",
    startAt: "2025-09-24T07:00:00Z",
    endAt: "2025-09-24T14:00:00Z",
    status: "CANCELLED" as ScheduleEventStatus,
    plannedUnits: 28,
    programName: "ODP",
    employeeName: "Clemens, Samantha",
    supervisorName: "Clossin, Bronwen",
    serviceCode: "W1726",
    eventCode: "NONE",
  },
  {
    id: "se8",
    patientId: "patient1",
    eventDate: "2025-09-24",
    startAt: "2025-09-24T07:30:00Z",
    endAt: "2025-09-24T11:30:00Z",
    status: "CANCELLED" as ScheduleEventStatus,
    plannedUnits: 16,
    programName: "ODP",
    employeeName: "Clemens, Samantha",
    supervisorName: "Clossin, Bronwen",
    serviceCode: "W1726",
    eventCode: "NONE",
  },
  {
    id: "se9",
    patientId: "patient1",
    eventDate: "2025-09-24",
    startAt: "2025-09-24T11:30:00Z",
    endAt: "2025-09-24T14:30:00Z",
    status: "CANCELLED" as ScheduleEventStatus,
    plannedUnits: 12,
    programName: "ODP",
    employeeName: "Clemens, Samantha",
    supervisorName: "Clossin, Bronwen",
    serviceCode: "W1726",
    eventCode: "NONE",
  },
];

export default function PatientSchedule({ patientId }: PatientScheduleProps) {
  // In real implementation, patientId would be used to fetch data from API
  console.log("Patient ID:", patientId);
  
  const [templateEvents, setTemplateEvents] = useState<TemplateEventDTO[]>(
    MOCK_TEMPLATE_EVENTS
  );
  const [scheduleEvents] = useState<ScheduleEventDTO[]>(MOCK_SCHEDULE_EVENTS);
  const [currentWeek] = useState(1);

  // Modal states
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TemplateEventDTO | null>(
    null
  );

  // Filter states
  const [searchText, setSearchText] = useState("");

  const handleEditEvent = (event: TemplateEventDTO) => {
    setEditingEvent(event);
    setIsAddEventModalOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setTemplateEvents((prev) => prev.filter((e) => e.id !== eventId));
    message.success("Event deleted successfully");
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setIsAddEventModalOpen(true);
  };

  const handleSaveEvent = (data: AddEventFormData) => {
    // In real implementation, this would process the form data
    console.log("Saving event data:", data);
    
    if (editingEvent) {
      // Update existing event
      message.success("Event updated successfully");
    } else {
      // Add new event
      message.success("Event added successfully");
    }
    setIsAddEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleGenerate = (data: GenerateScheduleFormData) => {
    message.success(`Schedule generated through ${data.endDate}`);
    setIsGenerateModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Template Schedule Section */}
        <Card
          className="border-none shadow-none"
          variant="borderless"
          styles={{ body: { paddingTop: 0 } }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-2 bg-surface-theme border-b border-[var(--border-color)]">
            <div className="flex flex-col sm:flex-row py-2 items-start sm:items-center gap-3 sm:gap-4 text-sm text-[var(--text-primary)]">
              <span>Generated Through: 07/04/2026</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f] rounded font-medium">
                <CheckCircleOutlined />
                Active
              </span>
              <Button
                type="primary"
                className={buttonStyles.btnPrimary}
                onClick={() => setIsGenerateModalOpen(true)}
              >
                GENERATE
              </Button>
            </div>
            <Button danger className={buttonStyles.btnSecondary}>
              DELETE TEMPLATE
            </Button>
          </div>

          {/* Week Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 bg-primary border-t border-[var(--border-color)]">
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={handleAddEvent}
              className="text-[var(--primary)] font-bold"
            >
              ADD EVENT
            </Button>
            <span className="font-semibold text-sm text-[var(--text-primary)]">Week {currentWeek}</span>
            <Button
              type="link"
              icon={<PlusOutlined />}
              className="text-[var(--primary)] font-bold"
            >
              ADD WEEK
            </Button>
          </div>

          {/* Calendar */}
          <div className="p-0">
            <TemplateCalendar
              events={templateEvents}
              weekNumber={currentWeek}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
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
              loading={false}
              onEdit={(event) => {
                message.info(`Edit event: ${event.id}`);
              }}
              onDelete={(eventId) => {
                message.info(`Delete event: ${eventId}`);
              }}
            />
          </div>
        </Card>

        {/* Modals */}
        <GenerateScheduleModal
          open={isGenerateModalOpen}
          onCancel={() => setIsGenerateModalOpen(false)}
          onGenerate={handleGenerate}
          currentEndDate="2026-07-04"
        />

        <AddEventModal
          open={isAddEventModalOpen}
          onCancel={() => {
            setIsAddEventModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
          initialData={editingEvent}
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

