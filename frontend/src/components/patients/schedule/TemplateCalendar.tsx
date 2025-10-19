"use client";

import React from "react";
import { Dropdown, Modal } from "antd";
import { DownOutlined, MoreOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { TemplateEventDTO } from "@/types/schedule";
import styles from "@/styles/schedule.module.css";

interface TemplateCalendarProps {
  events: TemplateEventDTO[];
  weekNumber: number;
  onEditEvent: (event: TemplateEventDTO) => void;
  onDeleteEvent: (eventId: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TemplateCalendar({
  events,
  // weekNumber,
  onEditEvent,
  onDeleteEvent,
}: TemplateCalendarProps) {
  // Group events by weekday
  const eventsByDay = React.useMemo(() => {
    const grouped: Record<number, TemplateEventDTO[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };

    events.forEach((event) => {
      if (grouped[event.weekday]) {
        grouped[event.weekday].push(event);
      }
    });

    // Sort events by start time within each day
    Object.keys(grouped).forEach((day) => {
      grouped[Number(day)].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return grouped;
  }, [events]);

  const handleDeleteClick = (event: TemplateEventDTO) => {
    Modal.confirm({
      title: "Delete Event",
      content: `Are you sure you want to delete this event (${event.serviceCode} - ${event.startTime} to ${event.endTime})?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        onDeleteEvent(event.id);
      },
    });
  };

  const getMenuItems = (event: TemplateEventDTO): MenuProps["items"] => [
    {
      key: "edit",
      label: "Edit Event",
      onClick: () => onEditEvent(event),
    },
    {
      key: "delete",
      label: "Delete Event",
      danger: true,
      onClick: () => handleDeleteClick(event),
    },
  ];

  return (
    <div className={styles.calendarGrid}>
      {WEEKDAYS.map((day, index) => (
        <div key={index} className={styles.calendarDay}>
          <div className={styles.calendarDayHeader}>{day}</div>
          <div>
            {eventsByDay[index].length > 0 ? (
              eventsByDay[index].map((event) => (
                <div
                  key={event.id}
                  className={`${styles.eventCard} ${styles.eventCardActive}`}
                >
                  <div className={styles.eventActions}>
                    <Dropdown
                      menu={{ items: getMenuItems(event) }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <button
                        className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--primary)] bg-transparent border-none cursor-pointer p-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreOutlined />
                        <DownOutlined style={{ fontSize: "10px" }} />
                      </button>
                    </Dropdown>
                  </div>

                  <div className={styles.eventBadge}>Active</div>
                  <div className={styles.eventCode}>
                    {event.serviceCode || "N/A"}
                  </div>
                  <div className={styles.eventTime}>
                    {event.startTime} - {event.endTime}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.calendarDayEmpty}>No events</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}