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

  // Helper function to extract time from ISO string without timezone conversion
  // This matches the formatTime function used in ScheduleEventsTable
  const extractTimeFromISO = (isoString: string): { hours: number; minutes: number } | null => {
    if (!isoString) return null;
    try {
      // Extract time part directly from ISO string (e.g., "00:30:00" from "2026-01-05T00:30:00Z")
      const timePart = isoString.split('T')[1];
      if (!timePart) return null;
      
      const [hoursStr, minutesStr] = timePart.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      return { hours, minutes };
    } catch {
      return null;
    }
  };

  // Format time range - extracts time directly from ISO string without timezone conversion
  const formatTimeRange = (startAt: string, endAt: string): string => {
    try {
      const startTime = extractTimeFromISO(startAt);
      const endTime = extractTimeFromISO(endAt);
      
      if (!startTime || !endTime) return "—";
      
      // Format start time
      let startHours = startTime.hours;
      const startAmPm = startHours >= 12 ? 'PM' : 'AM';
      startHours = startHours % 12;
      startHours = startHours ? startHours : 12; // the hour '0' should be '12'
      const startMinutes = startTime.minutes < 10 ? `0${startTime.minutes}` : startTime.minutes;
      const startFormatted = `${startHours}:${startMinutes} ${startAmPm}`;
      
      // Format end time
      let endHours = endTime.hours;
      const endAmPm = endHours >= 12 ? 'PM' : 'AM';
      endHours = endHours % 12;
      endHours = endHours ? endHours : 12; // the hour '0' should be '12'
      const endMinutes = endTime.minutes < 10 ? `0${endTime.minutes}` : endTime.minutes;
      const endFormatted = `${endHours}:${endMinutes} ${endAmPm}`;
      
      return `${startFormatted} - ${endFormatted}`;
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

