"use client";

import React from "react";
import { LeftOutlined, WarningOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { VisitMaintenanceDTO } from "@/types/visitMaintenance";
import { VisitStatus } from "@/types/visitMaintenance";
import { Tag } from "antd";

interface VisitHeaderProps {
  visit: VisitMaintenanceDTO;
}

export default function VisitHeader({ visit }: VisitHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push("/visit-maintenance");
  };

  // Get status color based on VisitStatus enum
  const getStatusColor = (status: VisitStatus) => {
    const statusMap: Record<VisitStatus, string> = {
      [VisitStatus.NOT_STARTED]: "default",
      [VisitStatus.IN_PROGRESS]: "processing",
      [VisitStatus.COMPLETED]: "success",
      [VisitStatus.INCOMPLETE]: "warning",
      [VisitStatus.VERIFIED]: "cyan",
      [VisitStatus.CANCELLED]: "error",
    };
    return statusMap[status] || "default";
  };

  return (
    <div className="bg-[var(--bg-surface)] rounded-none pt-2.5 px-4 mb-0">
      {/* Row 1: Back button and Visit ID */}
      <div className="flex items-center gap-4 mb-3">
        <div
          onClick={handleBack}
          className="flex items-center gap-1 font-semibold text-base cursor-pointer text-[var(--primary)] hover:opacity-80 transition-opacity"
        >
          <LeftOutlined /> BACK
        </div>

        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-xl font-bold text-theme-primary m-0">
            Visit #{visit.serviceDeliveryId}
          </h1>
          <Tag color={getStatusColor(visit.visitStatus)}>
            {visit.visitStatusDisplay}
          </Tag>
          {visit.isUnscheduled && (
            <Tag color="orange" icon={<WarningOutlined />}>
              Unscheduled (Replacement)
            </Tag>
          )}
        </div>
      </div>

      {/* Replacement Alert */}
      {visit.isUnscheduled && visit.unscheduledReason && (
        <div className="bg-[#fff7e6] border border-[#ffd591] rounded-md p-3 mb-3">
          <div className="flex items-start gap-2">
            <WarningOutlined className="text-[#fa8c16] mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-[#d46b08] mb-1">Staff Replacement</div>
              <div className="text-sm text-[#ad6800]">
                <strong>Reason:</strong> {visit.unscheduledReason}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Visit info - all in one line */}
      <div className="flex items-center gap-3 flex-wrap text-xs leading-[1.5] max-xl:text-[11px] max-md:flex-col max-md:items-start max-md:gap-2">
        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Client:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {visit.clientName || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Employee:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {visit.employeeName || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Service:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {visit.serviceName || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Schedule In:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {visit.scheduledTimeIn || "—"}
          </span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Schedule Out:</span>{" "}
          <span className="text-theme-primary font-semibold">
            {visit.scheduledTimeOut || "—"}
          </span>
        </span>
      </div>
    </div>
  );
}
