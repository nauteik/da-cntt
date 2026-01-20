"use client";

import React from "react";
import { Table, Tag, Empty } from "antd";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { useHouseStays } from "@/hooks/useHouseDetail";
import type { PatientHouseStayDTO } from "@/types/house";
import { formatDateLong } from "@/lib/dateUtils";
import TabLoading from "@/components/common/TabLoading";
import InlineError from "@/components/common/InlineError";

interface HouseStayHistoryProps {
  houseId: string;
  initialStays?: PatientHouseStayDTO[];
}

export default function HouseStayHistory({
  houseId,
  initialStays,
}: HouseStayHistoryProps) {
  const router = useRouter();

  const {
    data: stays,
    isLoading,
    error,
  } = useHouseStays(houseId, {
    initialData: initialStays,
  });

  const columns: ColumnsType<PatientHouseStayDTO> = [
    {
      title: "PATIENT NAME",
      dataIndex: "patientName",
      key: "patientName",
      render: (text: string, record: PatientHouseStayDTO) => (
        <span
          className="cursor-pointer font-medium transition-colors"
          style={{
            color: "var(--primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--primary-hover)";
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--primary)";
            e.currentTarget.style.textDecoration = "none";
          }}
          onClick={() => router.push(`/clients/${record.patientId}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: "MOVE-IN DATE",
      dataIndex: "moveInDate",
      key: "moveInDate",
      render: (date: string) => formatDateLong(date),
    },
    {
      title: "MOVE-OUT DATE",
      dataIndex: "moveOutDate",
      key: "moveOutDate",
      render: (date: string | null) => (date ? formatDateLong(date) : "—"),
    },
    {
      title: "STATUS",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "Active" : "Completed"}
        </Tag>
      ),
    },
  ];

  if (isLoading) {
    return <TabLoading />;
  }

  if (error) {
    return (
      <div className="p-6 min-h-[600px] flex items-center justify-center">
        <InlineError
          title="Error Loading Stay History"
          message={error.message || "Failed to load stay history"}
        />
      </div>
    );
  }

  if (!stays || stays.length === 0) {
    return (
      <div className="p-6 min-h-[600px] flex items-center justify-center">
        <Empty
          description="No stay history available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Table
        columns={columns}
        dataSource={stays}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} entries`,
          pageSizeOptions: ["10", "25", "50", "100"],
        }}
        size="small"
      />
    </div>
  );
}

