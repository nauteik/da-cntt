"use client";

import React, { useState } from "react";
import { Modal, DatePicker, Button, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { GenerateScheduleFormData } from "@/types/schedule";
import styles from "@/styles/schedule.module.css";

interface GenerateScheduleModalProps {
  open: boolean;
  onCancel: () => void;
  onGenerate: (data: GenerateScheduleFormData) => void;
  currentEndDate?: string; // Current "Generated Through" date
}

export default function GenerateScheduleModal({
  open,
  onCancel,
  onGenerate,
  currentEndDate,
}: GenerateScheduleModalProps) {
  const [endDate, setEndDate] = useState<Dayjs | null>(
    currentEndDate ? dayjs(currentEndDate) : null
  );
  const [error, setError] = useState<string>("");

  const handleGenerate = () => {
    if (!endDate) {
      setError("Please select an end date");
      return;
    }

    // Validate that end date is in the future
    const today = dayjs().startOf("day");
    if (endDate.isBefore(today)) {
      setError("End date must be in the future");
      return;
    }

    // Calculate number of weeks
    const weeksToGenerate = Math.ceil(endDate.diff(today, "week", true));

    onGenerate({
      endDate: endDate.format("YYYY-MM-DD"),
    });

    // Reset and close
    setEndDate(null);
    setError("");
  };

  const handleCancel = () => {
    setEndDate(null);
    setError("");
    onCancel();
  };

  // Calculate preview data
  const getPreviewData = () => {
    if (!endDate) return null;

    const today = dayjs().startOf("day");
    const weeksToGenerate = Math.ceil(endDate.diff(today, "week", true));

    // Mock service breakdown - in real app, this would come from template
    const services = [
      {
        code: "W1726",
        name: "Companion Level 2 (1:1)",
        eventsPerWeek: 7,
        timeRange: "7:00 AM - 2:00 PM",
      },
      {
        code: "W7060",
        name: "IHCS Level 2 (1:1)",
        eventsPerWeek: 7,
        timeRange: "2:00 PM - 9:00 PM",
      },
    ];

    return {
      weeks: weeksToGenerate,
      services: services.map((svc) => ({
        ...svc,
        totalEvents: svc.eventsPerWeek * weeksToGenerate,
      })),
    };
  };

  const preview = getPreviewData();

  return (
    <Modal
      title="Generate Schedule(s)"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          CANCEL
        </Button>,
        <Button key="generate" type="primary" onClick={handleGenerate}>
          GENERATE
        </Button>,
      ]}
      width={600}
    >
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium text-[var(--text-primary)]">
            End Date <span className="text-red-500">*</span>
          </label>
          <Tooltip title="Select the date through which schedules should be generated based on your weekly template">
            <InfoCircleOutlined className="text-[var(--text-secondary)] cursor-help" />
          </Tooltip>
        </div>

        <DatePicker
          value={endDate}
          onChange={(date) => {
            setEndDate(date);
            setError("");
          }}
          format="MM/DD/YYYY"
          className="w-full"
          placeholder="Select end date"
          disabledDate={(current) => {
            // Disable dates before today
            return current && current < dayjs().startOf("day");
          }}
        />

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        {/* Preview Section */}
        {preview && (
          <div className={styles.previewSection}>
            <div className={styles.previewTitle}>Generation Preview</div>
            <div className={styles.previewItem}>
              <strong>Duration:</strong> {preview.weeks}{" "}
              {preview.weeks === 1 ? "week" : "weeks"}
            </div>
            <div className={styles.previewItem}>
              <strong>Service Breakdown:</strong>
            </div>
            {preview.services.map((service, idx) => (
              <div key={idx} className={styles.previewItem}>
                • <strong>{service.code}</strong> ({service.name}):{" "}
                {service.totalEvents} events ({service.timeRange})
              </div>
            ))}
            <div className={styles.previewItem}>
              <strong>Total Events:</strong>{" "}
              {preview.services.reduce((sum, s) => sum + s.totalEvents, 0)}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-sm text-gray-700">
          <p className="font-medium mb-1">Note:</p>
          <p>
            If checked, your template will generate schedule events for the
            specified period. Existing events will not be duplicated.
          </p>
        </div>
      </div>
    </Modal>
  );
}

