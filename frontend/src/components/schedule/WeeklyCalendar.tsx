"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Tag } from "antd";
import type { ScheduleEventDTO, ScheduleEventStatus } from "@/types/schedule";
import dayjs from "dayjs";

interface WeeklyCalendarProps {
  events: ScheduleEventDTO[];
  weekStart: dayjs.Dayjs; // Start of the week (Monday)
  onEventClick?: (event: ScheduleEventDTO) => void;
  collapsed?: boolean;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getStatusDotColor = (status: ScheduleEventStatus): string => {
  const colorMap: Record<ScheduleEventStatus, string> = {
    PLANNED: "#faad14", // Orange
    CONFIRMED: "#ffd700", // Yellow/Gold
    IN_PROGRESS: "#1890ff", // Blue
    COMPLETED: "#52c41a", // Green
    CANCELLED: "#ff4d4f", // Red
  };
  return colorMap[status] || "#d9d9d9";
};

const formatTime = (datetime: string): string => {
  try {
    const date = dayjs(datetime);
    return date.format("h:mm A");
  } catch {
    return "-";
  }
};

export default function WeeklyCalendar({
  events,
  weekStart,
  onEventClick,
  collapsed = false,
}: WeeklyCalendarProps) {
  const router = useRouter();

  // Generate week dates (Monday to Sunday)
  const weekDates = useMemo(() => {
    const dates: dayjs.Dayjs[] = [];
    for (let i = 0; i < 7; i++) {
      dates.push(weekStart.add(i, "day"));
    }
    return dates;
  }, [weekStart]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, ScheduleEventDTO[]> = {};
    
    weekDates.forEach((date) => {
      const dateStr = date.format("YYYY-MM-DD");
      grouped[dateStr] = [];
    });

    events.forEach((event) => {
      const eventDate = dayjs(event.eventDate).format("YYYY-MM-DD");
      if (grouped[eventDate]) {
        grouped[eventDate].push(event);
      }
    });

    // Sort events within each day by start time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const timeA = dayjs(a.startAt);
        const timeB = dayjs(b.startAt);
        return timeA.isBefore(timeB) ? -1 : timeA.isAfter(timeB) ? 1 : 0;
      });
    });

    return grouped;
  }, [events, weekDates]);

  const handleEventClick = (event: ScheduleEventDTO) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      router.push(`/schedule/${event.id}/edit`);
    }
  };

  return (
    <div className="grid grid-cols-7 gap-3 mt-4 min-h-[600px] max-lg:grid-cols-3 max-md:grid-cols-1">
      {weekDates.map((date, index) => {
        const dateStr = date.format("YYYY-MM-DD");
        const dayEvents = eventsByDate[dateStr] || [];
        const dayName = WEEKDAYS[index];
        const dateDisplay = date.format("MMM DD").toUpperCase();

        return (
          <div key={dateStr} className="min-h-[500px] bg-[var(--bg-surface)] border border-[var(--border-color)] rounded p-3 flex flex-col">
            <div className="font-semibold text-xs uppercase text-[var(--text-primary)] mb-3 text-center pb-2 border-b border-[var(--border-color)]">
              {dayName} - {dateDisplay}
            </div>
            <div className="flex-1 overflow-y-auto">
              {dayEvents.length === 0 ? (
                <div className="flex items-center justify-center text-[var(--text-secondary)] text-xs min-h-[100px]">No events</div>
              ) : (
                dayEvents.map((event) => {
                  const statusColor = getStatusDotColor(event.status);
                  const startTime = formatTime(event.startAt);
                  const endTime = formatTime(event.endAt);
                  const timeRange = `${startTime} - ${endTime}`;

                  return (
                    <Card
                      key={event.id}
                      className="transition-all duration-200 rounded-none hover:shadow-md hover:-translate-y-[1px]"
                      onClick={() => handleEventClick(event)}
                      size="small"
                      style={{
                        marginBottom: "8px",
                        cursor: "pointer",
                        padding: "8px 12px",
                        borderLeft: `3px solid ${statusColor}`,
                        borderRadius: 0,
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{
                            backgroundColor: statusColor,
                          }}
                        />
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {event.serviceCode || "NONE"}
                        </span>
                        {!collapsed && (
                          <Tag
                            color={statusColor}
                            style={{
                              fontSize: "10px",
                              padding: "0 4px",
                              margin: 0,
                              lineHeight: "16px",
                            }}
                          >
                            {event.status}
                          </Tag>
                        )}
                      </div>
                      {!collapsed && (
                        <div className="text-[11px] text-[var(--text-secondary)] mt-1">
                          Schedule: {timeRange}
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

