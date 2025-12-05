"use client";

import React from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { ScheduleEventDTO } from "@/types/schedule";
import type { PatientSelectDTO, StaffSelectDTO } from "@/types/patient";
import dayjs from "dayjs";

interface EditScheduleHeaderProps {
  event: ScheduleEventDTO;
  patient: PatientSelectDTO | undefined;
  staff: StaffSelectDTO | undefined;
  onBack?: () => void;
}

export default function EditScheduleHeader({
  event,
  patient,
  staff,
  onBack,
}: EditScheduleHeaderProps) {
  const router = useRouter();

  // Status color mapping
  const getStatusColor = (status: string): string => {
    switch (status?.toUpperCase()) {
      case "PLANNED":
        return "#de6000"; // orange
      case "CONFIRMED":
        return "#1f701f"; // green
      case "IN_PROGRESS":
        return "#0077CC"; // blue
      case "COMPLETED":
        return "#1f701f"; // green
      case "CANCELLED":
        return "#9e0303"; // red
      default:
        return "var(--text-primary)";
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push("/schedule");
    }
  };

  // Format time range
  const formatTimeRange = (startAt: string, endAt: string): string => {
    try {
      const start = dayjs(startAt);
      const end = dayjs(endAt);
      const startTime = start.format("h:mm A");
      const endTime = end.format("h:mm A");
      return `${startTime} - ${endTime}`;
    } catch {
      return "—";
    }
  };

  const timeRange = event.startAt && event.endAt 
    ? formatTimeRange(event.startAt, event.endAt)
    : "—";

  const eventDate = event.eventDate 
    ? dayjs(event.eventDate).format("MM/DD/YYYY")
    : "—";

  return (
    <div className="bg-[var(--bg-surface)] rounded-none pt-2.5 px-4 mb-0">
      {/* Row 1: Back button, Client/Employee names, Status */}
      <div className="flex items-center gap-4 mb-3">
        <div
          onClick={handleBack}
          className="flex items-center gap-1 font-semibold text-base cursor-pointer text-[var(--primary)] hover:opacity-80 transition-opacity"
        >
          <LeftOutlined /> BACK
        </div>

        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-xl font-bold text-theme-primary m-0">
            {patient?.displayName || event.patientName || "—"}
          </h1>

          {staff && (
            <>
              <span className="text-theme-secondary">/</span>
              <h2 className="text-lg font-semibold text-theme-primary m-0">
                {staff.displayName}
              </h2>
            </>
          )}

          <div className="flex items-center gap-1 py-1.5 px-3 border border-theme rounded bg-[var(--bg-surface)] text-[13px] min-w-[150px]">
            <span
              className="font-[550]"
              style={{ color: getStatusColor(event.status || "") }}
            >
              {event.status?.replace("_", " ") || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Event info - all in one line */}
      <div className="flex items-center gap-3 flex-wrap text-xs leading-[1.5] max-xl:text-[11px] max-md:flex-col max-md:items-start max-md:gap-2">
        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Date:</span>{" "}
          <span className="text-theme-primary font-semibold">{eventDate}</span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        <span className="inline-flex items-center gap-1">
          <span className="text-theme-secondary font-medium">Time:</span>{" "}
          <span className="text-theme-primary font-semibold">{timeRange}</span>
        </span>

        <span className="text-theme-border font-light max-md:hidden">|</span>

        {event.serviceCode && (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="text-theme-secondary font-medium">Service:</span>{" "}
              <span className="text-theme-primary font-semibold">
                {event.serviceCode}
              </span>
            </span>
            <span className="text-theme-border font-light max-md:hidden">|</span>
          </>
        )}

        {event.eventCode && (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="text-theme-secondary font-medium">Event Code:</span>{" "}
              <span className="text-theme-primary font-semibold">
                {event.eventCode}
              </span>
            </span>
            <span className="text-theme-border font-light max-md:hidden">|</span>
          </>
        )}

        {event.patientClientId && (
          <>
            <span className="inline-flex items-center gap-1">
              <span className="text-theme-secondary font-medium">Client ID:</span>{" "}
              <span className="text-theme-primary font-semibold">
                {event.patientClientId}
              </span>
            </span>
            <span className="text-theme-border font-light max-md:hidden">|</span>
          </>
        )}

        {event.plannedUnits !== undefined && (
          <span className="inline-flex items-center gap-1">
            <span className="text-theme-secondary font-medium">Planned Units:</span>{" "}
            <span className="text-theme-primary font-semibold">
              {event.plannedUnits}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

