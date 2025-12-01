"use client";

import React, { useState } from "react";
import { Card, Button, Input, Select, Space, DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import ScheduleEventsTable from "@/components/patients/schedule/ScheduleEventsTable";
import CreateScheduleForm from "@/components/schedule/CreateScheduleForm";
import buttonStyles from "@/styles/buttons.module.css";
import { useStaffScheduleEventsPaginated, useRelatedPatientsForStaff } from "@/hooks/useStaffSchedule";
import { useQueryClient } from "@tanstack/react-query";

interface StaffScheduleProps {
  staffId: string;
}

export default function StaffSchedule({ staffId }: StaffScheduleProps) {
  const queryClient = useQueryClient();
  
  // Filter state for schedule events
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs(),
    dayjs().add(30, "day"),
  ]);
  const [filterPatientId, setFilterPatientId] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1); // UI uses 1-based
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string>("eventDate");
  const [sortDir, setSortDir] = useState<string>("asc");
  const [searchText, setSearchText] = useState("");
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);

  // Fetch related patients list for dropdown (only patients with schedule events for this staff)
  const { data: patientsList = [] } = useRelatedPatientsForStaff(staffId);

  const fmt = (d: Dayjs) => d.format("YYYY-MM-DD");

  // Fetch schedule events with pagination
  const { data: scheduleEventsPage, isLoading: scheduleLoading } = useStaffScheduleEventsPaginated(
    staffId,
    {
      from: fmt(dateRange[0]),
      to: fmt(dateRange[1]),
      status: filterStatus,
      patientId: filterPatientId,
      search: searchText || undefined,
      page: currentPage - 1, // Convert to 0-based for backend
      size: pageSize,
      sortBy,
      sortDir,
    }
  );

  const scheduleEvents = scheduleEventsPage?.content || [];

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

  return (
    <div className="flex flex-col gap-6">
      {/* Schedule Events Section */}
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
                placeholder="PATIENT"
                style={{ width: 200 }}
                showSearch
                value={filterPatientId}
                onChange={(value) => {
                  setFilterPatientId(value);
                  setCurrentPage(1); // Reset to first page
                }}
                options={patientsList.map(patient => ({
                  value: patient.id,
                  label: patient.displayName,
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
                  { value: "COMPLETED", label: "Completed" }
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
            context="staff"
            onEdit={() => {
              // TODO: implement edit
            }}
          />
        </div>
      </Card>

      {/* Create Schedule Modal */}
      <CreateScheduleForm
        open={isCreateScheduleOpen}
        onCancel={() => setIsCreateScheduleOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["staff-schedule-events", staffId] });
          setIsCreateScheduleOpen(false);
        }}
        preselectedStaffId={staffId}
      />

      {/* Apply custom styles to Ant Design Card */}
      <style jsx global>{`
        .ant-card .ant-card-body {
          border-radius: 0 !important;
          border: 0 !important;
          padding: 0 !important;
        }
        .ant-card-head {
          border-bottom: none !important;
          border-radius: 0 !important;
          border: 0 !important;
          padding: 0 !important;
        }
        .ant-card-body {
          border-radius: 0 !important;
          border: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
}

