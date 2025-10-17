"use client";

import React, { useState } from "react";
import {
  Modal,
  Form,
  Select,
  Checkbox,
  TimePicker,
  Input,
  Button,
  Space,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { AddEventFormData, TemplateEventDTO } from "@/types/schedule";

interface AddEventModalProps {
  open: boolean;
  onCancel: () => void;
  onSave: (data: AddEventFormData) => void;
  initialData?: TemplateEventDTO | null; // For edit mode
}

const WEEKDAY_OPTIONS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

// Mock data - in real app, these would come from API
const MOCK_SERVICES = [
  { id: "1", code: "W1726", name: "Companion Level 2 (1:1)" },
  { id: "2", code: "W7060", name: "IHCS Level 2 (1:1)" },
  { id: "3", code: "W1728", name: "Personal Care (1:1)" },
];

const MOCK_EVENT_CODES = [
  { value: "NONE", label: "(No modifiers) None (NONE)" },
  { value: "TE", label: "TE - Telemedicine" },
  { value: "GT", label: "GT - Via interactive audio/video" },
];

const MOCK_BILL_TYPES = [
  { value: "05", label: "05- Unit" },
  { value: "15", label: "15- 15 Minutes" },
  { value: "30", label: "30- 30 Minutes" },
];

const MOCK_EMPLOYEES = [
  { id: "1", name: "Alverez, Julio (149824)" },
  { id: "2", name: "Clossin, Bronwen (145123)" },
  { id: "3", name: "Clemens, Samantha (148956)" },
];

export default function AddEventModal({
  open,
  onCancel,
  onSave,
  initialData,
}: AddEventModalProps) {
  const [form] = Form.useForm();
  const isEditMode = !!initialData;

  React.useEffect(() => {
    if (open && initialData) {
      // Populate form with initial data for edit mode
      form.setFieldsValue({
        serviceId: initialData.authorizationId,
        eventCode: initialData.eventCode || "NONE",
        billType: "05",
        weekdays: [initialData.weekday],
        startTime: dayjs(initialData.startTime, "HH:mm"),
        endTime: dayjs(initialData.endTime, "HH:mm"),
        employeeId: undefined,
        comments: "",
        activeSchedulePopulation: true,
      });
    } else if (open) {
      // Reset form for add mode
      form.resetFields();
      form.setFieldsValue({
        activeSchedulePopulation: true,
      });
    }
  }, [open, initialData, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const formData: AddEventFormData = {
        serviceId: values.serviceId,
        eventCode: values.eventCode,
        billType: values.billType,
        weekdays: values.weekdays,
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        employeeId: values.employeeId,
        comments: values.comments,
        activeSchedulePopulation: values.activeSchedulePopulation ?? true,
      };

      onSave(formData);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEditMode ? "Edit Event(s) to Template" : "Add Event(s) to Template"}
      open={open}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          CANCEL
        </Button>,
        <Button key="save" type="primary" onClick={handleOk}>
          {isEditMode ? "SAVE CHANGES" : "ADD EVENT"}
        </Button>,
      ]}
    >
      <div className="text-xs text-red-500 mb-4">* Required</div>

      <Form form={form} layout="vertical">
        {/* Type Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
            Type
          </h3>

          <Form.Item
            label="Service"
            name="serviceId"
            required
            rules={[{ required: true, message: "Please select a service" }]}
          >
            <Select
              placeholder="Select service"
              options={MOCK_SERVICES.map((s) => ({
                value: s.id,
                label: `${s.code}- ${s.name}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Event Code"
            name="eventCode"
            required
            rules={[{ required: true, message: "Please select event code" }]}
          >
            <Select placeholder="Select event code" options={MOCK_EVENT_CODES} />
          </Form.Item>

          <Form.Item
            label="Bill Type"
            name="billType"
            required
            rules={[{ required: true, message: "Please select bill type" }]}
          >
            <Select placeholder="Select bill type" options={MOCK_BILL_TYPES} />
          </Form.Item>
        </div>

        {/* Schedule Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
            Schedule
          </h3>

          <Form.Item
            label="Day(S) Of The Event"
            name="weekdays"
            required
            rules={[
              { required: true, message: "Please select at least one day" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select day(s) of the event"
              options={WEEKDAY_OPTIONS}
              maxTagCount="responsive"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Start Time"
              name="startTime"
              required
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <TimePicker
                format="hh:mm A"
                use12Hours
                className="w-full"
                placeholder="--:--"
              />
            </Form.Item>

            <Form.Item
              label={
                <div className="flex items-center justify-between w-full">
                  <span>End Time</span>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    className="ml-2"
                  >
                  </Button>
                </div>
              }
              name="endTime"
              required
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <TimePicker
                format="hh:mm A"
                use12Hours
                className="w-full"
                placeholder="--:--"
              />
            </Form.Item>
          </div>
        </div>

        {/* Assignment Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-4 text-[var(--text-primary)]">
            Assignment
          </h3>

          <Form.Item label="Employee" name="employeeId">
            <Select
              showSearch
              placeholder="Start typing employee's name..."
              options={MOCK_EMPLOYEES.map((e) => ({
                value: e.id,
                label: e.name,
              }))}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item label="Comments" name="comments">
            <Input.TextArea
              rows={4}
              placeholder="Write your comments here..."
            />
          </Form.Item>
        </div>

        {/* Active Schedule Population Checkbox */}
        <Form.Item name="activeSchedulePopulation" valuePropName="checked">
          <Checkbox>
            <span className="text-sm">Active Schedule population</span>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              If checked, your template will generate schedule for two weeks in
              future
            </div>
          </Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}

