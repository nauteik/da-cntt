"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Table, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import type { ScheduleEventDTO, ScheduleEventStatus } from "@/types/schedule";
import { formatDate } from "@/lib/dateUtils";

interface ScheduleEventsTableProps {
  data: ScheduleEventDTO[];
  loading?: boolean;
  onEdit?: (event: ScheduleEventDTO) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onSortChange?: (sortBy: string, sortDir: string) => void;
  context?: "patient" | "staff" | "global"; // "patient" shows EMPLOYEE/SUPERVISOR, "staff" shows CLIENT/CLIENT SUPERVISOR, "global" shows all 4 columns
}

export default function ScheduleEventsTable({
  data,
  loading = false,
  onEdit,
  pagination,
  onSortChange,
  context = "patient",
}: ScheduleEventsTableProps) {
  const router = useRouter();
  const getStatusColor = (status: ScheduleEventStatus): string => {
    const colorMap: Record<ScheduleEventStatus, string> = {
      PLANNED: "orange",
      CONFIRMED: "gold",
      IN_PROGRESS: "blue",
      COMPLETED: "green",
      CANCELLED: "red",
    };
    return colorMap[status] || "default";
  };

  const calculateHours = (start: string, end: string): string => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate.getTime() - startDate.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      return hours.toFixed(2);
    } catch {
      return "-";
    }
  };

  const formatTime = (datetime?: string): string => {
    if (!datetime) return "-";
    try {
      // Parse ISO string (e.g. "2023-11-24T14:00:00Z") and extract time part directly
      // We treat the stored time as the intended display time, ignoring browser timezone
      const timePart = datetime.split('T')[1]; // "14:00:00Z" or "14:00:00+00:00"
      if (!timePart) return "-";
      
      const [hoursStr, minutesStr] = timePart.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${strMinutes} ${ampm}`;
    } catch {
      return "-";
    }
  };

  const columns: ColumnsType<ScheduleEventDTO> = [
    {
      title: "DATE",
      dataIndex: "eventDate",
      key: "eventDate",
      width: 100,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => a.eventDate.localeCompare(b.eventDate),
    },
    {
      title: "PROGRAM",
      dataIndex: "programIdentifier",
      key: "programIdentifier",
      width: 90,
      render: (program: string) => program || "ODP",
    },
    ...(context === "global"
      ? [
          {
            title: "CLIENT",
            dataIndex: "patientName",
            key: "patientName",
            width: 135,
            render: (name: string, record: ScheduleEventDTO) => {
              const displayName = name || record.patientClientId || "-";
              if (displayName === "-" || !record.patientId) {
                return <div className="text-[13px] text-[var(--text-primary)]">{displayName}</div>;
              }
              return (
                <span
                  className="text-[13px] text-[var(--primary)] cursor-pointer font-medium transition-colors hover:text-[var(--primary-hover)] hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/clients/${record.patientId}`);
                  }}
                >
                  {displayName}
                </span>
              );
            },
          },
          {
            title: "CLIENT SUPERVISOR",
            dataIndex: "supervisorName",
            key: "supervisorName",
            width: 125,
            render: (name: string) => (
              <div className="text-[13px] text-[var(--text-primary)]">{name || "-"}</div>
            ),
          },
          {
            title: "EMPLOYEE",
            dataIndex: "employeeName",
            key: "employeeName",
            width: 135,
            render: (name: string, record: ScheduleEventDTO) => {
              if (!name || name === "-" || !record.employeeId) {
                return <div className="text-[13px] text-[var(--text-primary)]">{name || "-"}</div>;
              }
              return (
                <span
                  className="text-[13px] text-[var(--primary)] cursor-pointer font-medium transition-colors hover:text-[var(--primary-hover)] hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/employees/${record.employeeId}`);
                  }}
                >
                  {name}
                </span>
              );
            },
          },
          {
            title: "EMPLOYEE SUPERVISOR",
            dataIndex: "supervisorName",
            key: "employeeSupervisorName",
            width: 125,
            render: (name: string) => (
              <div className="text-[13px] text-[var(--text-primary)]">{name || "-"}</div>
            ),
          },
        ]
      : context === "staff"
        ? [
            {
              title: "CLIENT",
              dataIndex: "patientName",
              key: "patientName",
              width: 150,
              render: (name: string, record: ScheduleEventDTO) => (
                <div className="text-[13px] text-[var(--text-primary)]">
                  {name || record.patientClientId || "-"}
                </div>
              ),
            },
            {
              title: "CLIENT SUPERVISOR",
              dataIndex: "supervisorName",
              key: "supervisorName",
              width: 130,
              render: (name: string) => (
                <div className="text-[13px] text-[var(--text-primary)]">{name || "-"}</div>
              ),
            },
          ]
        : [
            {
              title: "EMPLOYEE",
              dataIndex: "employeeName",
              key: "employeeName",
              width: 140,
              render: (name: string) => (
                <div className="text-[13px] text-[var(--text-primary)]">{name || "-"}</div>
              ),
            },
            {
              title: "SUPERVISOR",
              dataIndex: "supervisorName",
              key: "supervisorName",
              width: 125,
              render: (name: string) => (
                <div className="text-[13px] text-[var(--text-primary)]">{name || "-"}</div>
              ),
            },
          ]),
    {
      title: "SERVICE",
      dataIndex: "serviceCode",
      key: "serviceCode",
      width: 85,
      render: (code: string) => (
        <div className="text-[13px] overflow-hidden text-ellipsis whitespace-nowrap">{code || "-"}</div>
      ),
    },
    {
      title: "EVENT CODE",
      dataIndex: "eventCode",
      key: "eventCode",
      width: 95,
      render: (code: string) => <div className="text-[13px]">{code || "NONE"}</div>,
    },
    {
      title: "SCHEDULE IN / OUT",
      key: "scheduleInOut",
      width: 140,
      render: (_: unknown, record: ScheduleEventDTO) => (
        <div className="text-[13px] whitespace-nowrap">
          {formatTime(record.startAt)} - {formatTime(record.endAt)}
        </div>
      ),
    },
    {
      title: "HRS",
      key: "scheduledHrs",
      width: 65,
      align: "center",
      render: (_: unknown, record: ScheduleEventDTO) => (
        <div className="text-[13px]">{calculateHours(record.startAt, record.endAt)}</div>
      ),
    },
    {
      title: "CALL IN / OUT",
      key: "callInOut",
      width: 140,
      render: (_: unknown, record: ScheduleEventDTO) => {
        if (!record.checkInTime || !record.checkOutTime) {
          return <span className="text-[13px] text-[var(--text-secondary)]">-</span>;
        }
        return (
          <div className="text-[13px] whitespace-nowrap">
            {formatTime(record.checkInTime)} - {formatTime(record.checkOutTime)}
          </div>
        );
      },
    },
    {
      title: "HRS",
      key: "actualHrs",
      width: 65,
      align: "center",
      render: (_: unknown, record: ScheduleEventDTO) => {
        if (!record.checkInTime || !record.checkOutTime) {
          return <div className="text-[13px]">-</div>;
        }
        return <div className="text-[13px]">{calculateHours(record.checkInTime, record.checkOutTime)}</div>;
      },
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 95,
      render: (status: ScheduleEventStatus) => (
        <Tag color={getStatusColor(status)} className="text-xs">
          {status}
        </Tag>
      ),
      filters: [
        { text: "Confirmed", value: "CONFIRMED" },
        { text: "Cancelled", value: "CANCELLED" },
        { text: "Planned", value: "PLANNED" },
        { text: "In Progress", value: "IN_PROGRESS" },
        { text: "Completed", value: "COMPLETED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "",
      key: "actions",
      width: 50,
      fixed: "right",
      render: (_: unknown, record: ScheduleEventDTO) => (
        <EditOutlined
          className="text-[var(--text-secondary)] hover:text-[var(--primary)] cursor-pointer text-base"
          onClick={() => onEdit?.(record)}
        />
      ),
    },
  ];

  const handleTableChange = (
    paginationConfig: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<ScheduleEventDTO> | SorterResult<ScheduleEventDTO>[]
  ) => {
    // Handle sorting - only handle single sorter
    if (!Array.isArray(sorter) && sorter.field && onSortChange) {
      const sortDir = sorter.order === "descend" ? "desc" : "asc";
      const fieldStr = Array.isArray(sorter.field) ? sorter.field[0] : String(sorter.field);
      onSortChange(fieldStr, sortDir);
    }
  };

  return (
    <div className="tableCard">
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) => {
          // Use id if available, otherwise create a unique key from record properties
          if (record.id) {
            return record.id;
          }
          // Fallback: create unique key from record properties
          return `${record.patientId}-${record.eventDate}-${record.startAt}-${record.endAt}`;
        }}
        loading={loading}
        pagination={
          pagination
            ? {
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} entries`,
                pageSizeOptions: ["10", "25", "50", "100"],
                onChange: pagination.onChange,
              }
            : {
                pageSize: 25,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} entries`,
                pageSizeOptions: ["10", "25", "50", "100"],
              }
        }
        onChange={handleTableChange}
        size="small"
      />
    </div>
  );
}

