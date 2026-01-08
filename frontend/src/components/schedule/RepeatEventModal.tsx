"use client";

import React, { useState } from "react";
import { Modal, InputNumber, Select, Radio, DatePicker, Space } from "antd";
import type { RepeatConfigDTO } from "@/types/schedule";
import buttonStyles from "@/styles/buttons.module.css";
import formStyles from "@/styles/form.module.css";
import dayjs from "dayjs";

interface RepeatEventModalProps {
  open: boolean;
  onOk: (config: RepeatConfigDTO) => void;
  onCancel: () => void;
  initialValue?: RepeatConfigDTO;
}

const DAYS_OF_WEEK = [
  { label: "Mo", value: 1 },
  { label: "Tu", value: 2 },
  { label: "We", value: 3 },
  { label: "Th", value: 4 },
  { label: "Fr", value: 5 },
  { label: "Sa", value: 6 },
  { label: "Su", value: 0 },
];

export default function RepeatEventModal({
  open,
  onOk,
  onCancel,
  initialValue,
}: RepeatEventModalProps) {
  const [interval, setInterval] = useState<number>(initialValue?.interval || 1);
  const [frequency, setFrequency] = useState<"WEEK" | "MONTH">(
    initialValue?.frequency || "WEEK"
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initialValue?.daysOfWeek || []
  );
  const [endType, setEndType] = useState<"on" | "after">(
    initialValue?.endDate ? "on" : initialValue?.occurrences ? "after" : "on"
  );
  const [endDate, setEndDate] = useState<string | undefined>(
    initialValue?.endDate
  );
  const [occurrences, setOccurrences] = useState<number>(
    initialValue?.occurrences || 1
  );

  const handleOk = () => {
    const config: RepeatConfigDTO = {
      interval,
      frequency,
      daysOfWeek: frequency === "WEEK" ? daysOfWeek : undefined,
      endDate: endType === "on" ? endDate : undefined,
      occurrences: endType === "after" ? occurrences : undefined,
    };
    onOk(config);
  };

  const handleDayToggle = (day: number) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  return (
    <Modal
      title="Repeat Event"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={500}
      okText="DONE"
      cancelText="CANCEL"
      okButtonProps={{ className: buttonStyles.btnPrimary }}
      cancelButtonProps={{ className: buttonStyles.btnCancel }}
    >
      <div className="space-y-4 py-4">
        {/* Repeat Every */}
        <div>
          <label className="block text-sm font-medium mb-2">Repeat every</label>
          <div className="flex gap-2 items-center">
            <InputNumber
              min={1}
              max={52}
              value={interval}
              onChange={(value) => setInterval(value || 1)}
              className={formStyles.formInput}
              style={{ width: 100 }}
            />
            <Select
              value={frequency}
              onChange={setFrequency}
              className={formStyles.formSelect}
              style={{ width: 150 }}
              options={[
                { label: "Week(s)", value: "WEEK" },
                { label: "Month(s)", value: "MONTH" },
              ]}
            />
          </div>
        </div>

        {/* Repeat On (only for weekly) */}
        {frequency === "WEEK" && (
          <div>
            <label className="block text-sm font-medium mb-2">Repeat On</label>
            <div className="flex gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`w-10 h-10 rounded-full border transition-colors ${
                    daysOfWeek.includes(day.value)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ends */}
        <div>
          <label className="block text-sm font-medium mb-2">Ends</label>
          <Radio.Group value={endType} onChange={(e) => setEndType(e.target.value)}>
            <Space direction="vertical" className="w-full">
              <Radio value="on">
                <div className="flex items-center gap-2">
                  <span>On</span>
                  <DatePicker
                    value={endDate ? dayjs(endDate) : undefined}
                    onChange={(date) => setEndDate(date?.format("YYYY-MM-DD"))}
                    format="MM/DD/YYYY"
                    className={formStyles.formDatePicker}
                    disabled={endType !== "on"}
                  />
                </div>
              </Radio>
              <Radio value="after">
                <div className="flex items-center gap-2">
                  <span>After</span>
                  <InputNumber
                    min={1}
                    max={365}
                    value={occurrences}
                    onChange={(value) => setOccurrences(value || 1)}
                    className={formStyles.formInput}
                    style={{ width: 80 }}
                    disabled={endType !== "after"}
                  />
                  <span>event(s)</span>
                </div>
              </Radio>
            </Space>
          </Radio.Group>
        </div>
      </div>
    </Modal>
  );
}


