"use client";

import React from "react";
import {
  Modal,
  Form,
  Select,
  TimePicker,
  Input,
  Button
} from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { AddEventFormData, TemplateEventDTO, AuthorizationSelectDTO } from "@/types/schedule";
import type { StaffSelectDTO } from "@/types/staff";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import styles from "@/styles/form.module.css";
import buttonStyles from "@/styles/buttons.module.css";

interface AddEventFormProps {
  open: boolean;
  onCancel: () => void;
  onSave: (data: AddEventFormData) => Promise<void>;
  initialData?: TemplateEventDTO | null; // For edit mode
  patientId: string;
  mutationError?: Error | null;
  mutationIsSuccess?: boolean;
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

// Types imported from central declarations

export default function AddEventForm({
  open,
  onCancel,
  onSave,
  initialData,
  patientId,
  mutationError,
  mutationIsSuccess,
}: AddEventFormProps) {
  const [form] = Form.useForm();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const isEditMode = !!initialData;

  React.useEffect(() => {
    if (mutationIsSuccess) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  }, [mutationIsSuccess]);

  // Authorizations for patient -> Service select
  const { data: authList = [] } = useQuery<AuthorizationSelectDTO[]>({
    queryKey: ["patient-authorizations-select", patientId],
    queryFn: async () => {
      const res = await apiClient<AuthorizationSelectDTO[]>(`/patients/${patientId}/schedule/authorizations/select`);
      return res.data || [];
    },
    enabled: open && !!patientId,
  });

  // Staff select (active staff)
  const { data: staffList = [] } = useQuery<StaffSelectDTO[]>({
    queryKey: ["staff-select"],
    queryFn: async () => {
      const res = await apiClient<StaffSelectDTO[]>(`/staff/select`);
      return res.data || [];
    },
    enabled: open,
  });

  React.useEffect(() => {
    if (open && initialData) {
      // Populate form with initial data for edit mode
      form.setFieldsValue({
        serviceId: initialData.authorizationId,
        eventCode: initialData.eventCode,
        billType: initialData.billType,
        weekday: initialData.weekday, // Single value for edit mode
        startTime: dayjs(initialData.startTime, "HH:mm"),
        endTime: dayjs(initialData.endTime, "HH:mm"),
        employeeId: initialData.staffId,
        comments: initialData.comment,
      });
    } else if (open) {
      // Reset form for add mode
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const formData: AddEventFormData = {
        serviceId: values.serviceId,
        eventCode: values.eventCode,
        billType: values.billType,
        // In edit mode: single weekday, in create mode: array of weekdays
        ...(isEditMode 
          ? { weekday: values.weekday, weekdays: [] } 
          : { weekdays: values.weekdays }
        ),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        employeeId: values.employeeId,
        comments: values.comments,
      };

      await onSave(formData);
    }).catch(() => {
      // Validation errors handled by Ant Design Form
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Auto-fill Event Code & Bill Type when selecting Service
  const handleServiceChange = (authId: string) => {
    const auth = authList.find((a) => a.id === authId);
    if (auth) {
      form.setFieldsValue({
        eventCode: auth.eventCode || undefined,
        billType: auth.billType || undefined,
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      width={700}
      className={styles.formModal}
      footer={null}
      closeIcon={null}
      styles={{
        body: { padding: 0 },
      }}
    >
      <div className="flex flex-col h-[75vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-theme bg-theme-surface">
          <h2 className="text-xl font-semibold text-theme-primary m-0">
            {isEditMode ? "Edit Event(s) to Template" : "Add Event(s) to Template"}
          </h2>
          <CloseOutlined
            className="text-xl text-theme-secondary cursor-pointer hover:text-theme-primary transition-colors p-1"
            onClick={handleCancel}
          />
        </div>

        {/* Form */}
        <Form form={form} layout="vertical" onFinish={handleOk} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-8 pt-4 pb-1 bg-theme-surface flex flex-col">

            {/* Type Section */}
            <div>
              <div className="text-xs text-red-500 mb-2">* Required</div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Type
              </h3>

              <Form.Item
                label={<span>Service <span className="text-red-500">*</span></span>}
                name="serviceId"
                rules={[{ required: true, message: "Please select a service" }]}
              >
                <Select
                  className={styles.formSelect}
                  placeholder="Select service"
                  onChange={handleServiceChange}
                  options={authList.map((a) => ({
                    value: a.id,
                    label: `${a.serviceCode || ""}- ${a.serviceName || ""}`.trim(),
                  }))}
                />
              </Form.Item>

              <Form.Item
                label="Event Code"
                name="eventCode"
                rules={[]}
              >
                <Input className={styles.formInput} placeholder="Auto-filled from Authorization" disabled />
              </Form.Item>

              <Form.Item
                label="Bill Type"
                name="billType"
                rules={[]}
              >
                <Input className={styles.formInput} placeholder="Auto-filled from Authorization" disabled />
              </Form.Item>
            </div>

            {/* Schedule Section */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Schedule
              </h3>

              {isEditMode ? (
                // Edit mode: single day select
                <Form.Item
                  label={<span>Day Of The Event <span className="text-red-500">*</span></span>}
                  name="weekday"
                  rules={[
                    { required: true, message: "Please select a day" },
                  ]}
                  help="To add this event to multiple days, please create a new event"
                >
                  <Select
                    className={styles.formSelect}
                    placeholder="Select day of the event"
                    options={WEEKDAY_OPTIONS}
                  />
                </Form.Item>
              ) : (
                // Create mode: multiple days select
                <Form.Item
                  label={<span>Day(S) Of The Event <span className="text-red-500">*</span></span>}
                  name="weekdays"
                  rules={[
                    { required: true, message: "Please select at least one day" },
                  ]}
                >
                  <Select
                    className={styles.formSelect}
                    mode="multiple"
                    placeholder="Select day(s) of the event"
                    options={WEEKDAY_OPTIONS}
                    maxTagCount="responsive"
                  />
                </Form.Item>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label={<span>Start Time <span className="text-red-500">*</span></span>}
                  name="startTime"
                  rules={[{ required: true, message: "Please select start time" }]}
                >
                  <TimePicker
                    className={`${styles.formDatePicker} w-full`}
                    format="hh:mm A"
                    use12Hours
                    placeholder="--:--"
                    needConfirm={false}
                    onCalendarChange={(t) => {
                      form.setFieldValue("startTime",t);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span>End Time <span className="text-red-500">*</span></span>
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
                  rules={[{ required: true, message: "Please select end time" }]}
                >
                  <TimePicker
                    className={`${styles.formDatePicker} w-full`}
                    format="hh:mm A"
                    use12Hours
                    placeholder="--:--"
                    needConfirm={false}
                    onCalendarChange={(t) => {
                      form.setFieldValue("endTime", t);
                    }}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Assignment Section */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Assignment
              </h3>

              <Form.Item label="Employee" name="employeeId">
                <Select
                  className={styles.formSelect}
                  showSearch
                  placeholder="Start typing employee's name..."
                  options={staffList.map((e) => ({ value: e.id, label: e.displayName }))}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item label="Comments" name="comments">
                <Input.TextArea
                  className={styles.formInput}
                  rows={4}
                  placeholder="Write your comments here..."
                />
              </Form.Item>
            </div>

            {/* Active Schedule Population removed */}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0">
            {/* Error Message */}
            {mutationError && !showSuccess && (
              <div className="px-8 py-3 bg-theme-surface border-t border-theme">
                <p className="text-sm text-red-600 m-0">
                  {mutationError.message || "Failed to create event. Please try again."}
                </p>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="px-8 py-3 bg-theme-surface border-t border-theme flex items-center gap-2">
                <p className="text-sm text-green-600 font-[550] m-0">
                  Event {isEditMode ? "updated" : "created"} successfully
                </p>
              </div>
            )}

            <div className="flex justify-end items-center px-8 py-4 border-t border-theme bg-theme-surface gap-3">
              <Button
                onClick={handleCancel}
                className={buttonStyles.btnCancel}
              >
                CANCEL
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className={buttonStyles.btnPrimary}
              >
                {isEditMode ? "SAVE CHANGES" : "ADD EVENT"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

