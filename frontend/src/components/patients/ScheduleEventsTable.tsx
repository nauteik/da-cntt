"use client";

import React from "react";
import { Table, Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ScheduleEventDTO, ScheduleEventStatus } from "@/types/schedule";
import { formatDate } from "@/lib/dateUtils";
import styles from "@/styles/schedule.module.css";

interface ScheduleEventsTableProps {
  data: ScheduleEventDTO[];
  loading?: boolean;
  onEdit?: (event: ScheduleEventDTO) => void;
  onDelete?: (eventId: string) => void;
}

export default function ScheduleEventsTable({
  data,
  loading = false,
  onEdit,
  onDelete,
}: ScheduleEventsTableProps) {
  const getStatusColor = (status: ScheduleEventStatus): string => {
    const colorMap: Record<ScheduleEventStatus, string> = {
      CONFIRMED: "green",
      CANCELLED: "red",
      PLANNED: "blue",
      DRAFT: "default",
      IN_PROGRESS: "orange",
      COMPLETED: "green",
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
      const date = new Date(datetime);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "-";
    }
  };

  const columns: ColumnsType<ScheduleEventDTO> = [
    {
      title: "DATE",
      dataIndex: "eventDate",
      key: "eventDate",
      width: 110,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => a.eventDate.localeCompare(b.eventDate),
    },
    {
      title: "PROGRAM",
      dataIndex: "programName",
      key: "programName",
      width: 100,
      render: (program: string) => program || "ODP",
    },
    {
      title: "EMPLOYEE",
      dataIndex: "employeeName",
      key: "employeeName",
      width: 150,
      render: (name: string, record: ScheduleEventDTO) => (
        <div>
          <div className="text-[13px] text-[var(--text-primary)]">
            {name || "Clemens, Samantha"}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {record.supervisorName || "Clossin, Bronwen"}
          </div>
        </div>
      ),
    },
    {
      title: "SERVICE",
      dataIndex: "serviceCode",
      key: "serviceCode",
      width: 100,
      render: (code: string) => code || "W7060",
    },
    {
      title: "EVENT CODE",
      dataIndex: "eventCode",
      key: "eventCode",
      width: 120,
      render: (code: string) => code || "NONE",
    },
    {
      title: "SCHEDULE IN / OUT",
      key: "scheduleInOut",
      width: 150,
      render: (_: unknown, record: ScheduleEventDTO) => (
        <div className="text-[13px]">
          {formatTime(record.startAt)} - {formatTime(record.endAt)}
        </div>
      ),
    },
    {
      title: "HRS",
      key: "scheduledHrs",
      width: 70,
      align: "center",
      render: (_: unknown, record: ScheduleEventDTO) =>
        calculateHours(record.startAt, record.endAt),
    },
    {
      title: "CALL IN / OUT",
      key: "callInOut",
      width: 150,
      render: (_: unknown, record: ScheduleEventDTO) => {
        if (!record.checkInTime || !record.checkOutTime) {
          return <span className="text-[var(--text-secondary)]">-</span>;
        }
        return (
          <div className="text-[13px]">
            {formatTime(record.checkInTime)} - {formatTime(record.checkOutTime)}
          </div>
        );
      },
    },
    {
      title: "HRS",
      key: "actualHrs",
      width: 70,
      align: "center",
      render: (_: unknown, record: ScheduleEventDTO) => {
        if (!record.checkInTime || !record.checkOutTime) {
          return "-";
        }
        return calculateHours(record.checkInTime, record.checkOutTime);
      },
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (status: ScheduleEventStatus) => (
        <Tag color={getStatusColor(status)} className="text-xs">
          {status}
        </Tag>
      ),
      filters: [
        { text: "Confirmed", value: "CONFIRMED" },
        { text: "Cancelled", value: "CANCELLED" },
        { text: "Planned", value: "PLANNED" },
        { text: "Draft", value: "DRAFT" },
        { text: "In Progress", value: "IN_PROGRESS" },
        { text: "Completed", value: "COMPLETED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_: unknown, record: ScheduleEventDTO) => (
        <Space size="small">
          <EditOutlined
            className="text-[var(--text-secondary)] hover:text-[var(--primary)] cursor-pointer"
            onClick={() => onEdit?.(record)}
          />
          <DeleteOutlined
            className="text-[var(--text-secondary)] hover:text-red-500 cursor-pointer"
            onClick={() => onDelete?.(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 25,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} entries`,
        pageSizeOptions: ["10", "25", "50", "100"],
      }}
      scroll={{ x: 1400 }}
      size="small"
    />
  );
}

