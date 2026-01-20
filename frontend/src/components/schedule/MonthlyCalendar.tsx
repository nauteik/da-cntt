"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Tag } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { ScheduleEventDTO, ScheduleEventStatus } from "@/types/schedule";
import dayjs from "dayjs";

interface MonthlyCalendarProps {
  events: ScheduleEventDTO[];
  month: dayjs.Dayjs; // The month to display
  onEventClick?: (event: ScheduleEventDTO) => void;
  onMonthChange?: (month: dayjs.Dayjs) => void;
  collapsed?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getStatusColor = (status: ScheduleEventStatus): string => {
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

export default function MonthlyCalendar({
  events,
  month,
  onEventClick,
  onMonthChange,
  collapsed = false,
}: MonthlyCalendarProps) {
  const router = useRouter();

  // Get first day of month and last day of month
  const firstDayOfMonth = month.startOf("month");
  const lastDayOfMonth = month.endOf("month");
  
  // Get first day of calendar grid (Sunday of the week containing first day of month)
  const firstDayOfCalendar = firstDayOfMonth.startOf("week");
  
  // Get last day of calendar grid (Saturday of the week containing last day of month)
  const lastDayOfCalendar = lastDayOfMonth.endOf("week");

  // Generate all dates in the calendar grid
  const calendarDates = useMemo(() => {
    const dates: dayjs.Dayjs[] = [];
    let currentDate = firstDayOfCalendar;
    
    while (currentDate.isBefore(lastDayOfCalendar) || currentDate.isSame(lastDayOfCalendar, "day")) {
      dates.push(currentDate);
      currentDate = currentDate.add(1, "day");
    }
    
    return dates;
  }, [firstDayOfCalendar, lastDayOfCalendar]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, ScheduleEventDTO[]> = {};
    
    calendarDates.forEach((date) => {
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
  }, [events, calendarDates]);

  const handleEventClick = (event: ScheduleEventDTO) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      router.push(`/schedule/${event.id}/edit`);
    }
  };

  const handlePrevMonth = () => {
    const prevMonth = month.subtract(1, "month");
    if (onMonthChange) {
      onMonthChange(prevMonth);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = month.add(1, "month");
    if (onMonthChange) {
      onMonthChange(nextMonth);
    }
  };

  const today = dayjs();

  return (
    <div>
      {/* Month Header */}
      <div className="flex justify-between items-center p-4 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={handlePrevMonth}
          style={{ padding: "4px 8px" }}
        />
        <div className="text-lg font-semibold text-[var(--text-primary)]">
          {month.format("MMMM YYYY")}
        </div>
        <Button
          type="text"
          icon={<RightOutlined />}
          onClick={handleNextMonth}
          style={{ padding: "4px 8px" }}
        />
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-[1px] bg-[var(--border-color)] border border-[var(--border-color)] border-b-0">
        {WEEKDAYS.map((day) => (
          <div key={day} className="bg-[var(--bg-surface)] p-2 text-center font-semibold text-xs text-[var(--text-secondary)] uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-[1px] bg-[var(--border-color)] border border-[var(--border-color)]">
        {calendarDates.map((date) => {
          const dateStr = date.format("YYYY-MM-DD");
        const dayEvents = eventsByDate[dateStr] || [];
          const isOtherMonth = !date.isSame(month, "month");
          const isToday = date.isSame(today, "day");
          const dateNumber = date.date();

          return (
            <div
              key={dateStr}
              className={`min-h-[120px] bg-[var(--bg-surface)] p-2 relative cursor-pointer transition-colors duration-200 hover:bg-[var(--bg-primary)] ${
                isOtherMonth ? "bg-[var(--bg-primary)] opacity-50" : ""
              } ${isToday ? "bg-[#e6f7ff] border-2 border-[#1890ff]" : ""}`}
            >
              <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">{dateNumber}</div>
              <div className="flex flex-col gap-1 mt-1">
                {dayEvents.length === 0 ? null : collapsed ? (
                  <div className="flex gap-1 flex-wrap">
                    {dayEvents.slice(0, 3).map((event) => {
                      const statusColor = getStatusColor(event.status);
                      return (
                        <span
                          key={event.id}
                          className="w-1.5 h-1.5 rounded-full inline-block mr-1"
                          style={{ backgroundColor: statusColor }}
                          title={`${event.serviceCode || "NONE"} - ${event.status}`}
                        />
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  dayEvents.map((event) => {
                    const statusColor = getStatusColor(event.status);
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
                          padding: "8px 12px",
                          marginBottom: "4px",
                          cursor: "pointer",
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
    </div>
  );
}

