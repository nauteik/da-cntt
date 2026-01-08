"use client";

import React, { useState, useEffect } from "react";
import { Modal, Form, Radio, Select, DatePicker, Alert, Button } from "antd";
import type { RadioChangeEvent } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { PatientSelectDTO, StaffSelectDTO } from "@/types/patient";
import buttonStyles from "@/styles/buttons.module.css";
import formStyles from "@/styles/form.module.css";

const { RangePicker } = DatePicker;

interface CalendarViewFilterModalProps {
  open: boolean;
  viewType: "weekly" | "monthly";
  patients: PatientSelectDTO[];
  staff: StaffSelectDTO[];
  initialFilterBy?: "client" | "employee" | null;
  initialClientId?: string;
  initialEmployeeId?: string;
  initialWeekRange?: [Dayjs, Dayjs];
  initialMonth?: Dayjs;
  onCancel: () => void;
  onApply: (filters: {
    filterBy: "client" | "employee";
    clientId?: string;
    employeeId?: string;
    weekRange?: [Dayjs, Dayjs];
    month?: Dayjs;
  }) => void;
}

export default function CalendarViewFilterModal({
  open,
  viewType,
  patients,
  staff,
  initialFilterBy,
  initialClientId,
  initialEmployeeId,
  initialWeekRange,
  initialMonth,
  onCancel,
  onApply,
}: CalendarViewFilterModalProps) {
  const [form] = Form.useForm();
  const [filterBy, setFilterBy] = useState<"client" | "employee" | null>(
    initialFilterBy || null
  );

  // Initialize form values
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        filterBy: initialFilterBy || undefined,
        clientId: initialClientId,
        employeeId: initialEmployeeId,
        weekRange: initialWeekRange,
        month: initialMonth || dayjs(),
      });
      setFilterBy(initialFilterBy || null);
    }
  }, [
    open,
    initialFilterBy,
    initialClientId,
    initialEmployeeId,
    initialWeekRange,
    initialMonth,
    form,
  ]);

  const handleFilterByChange = (e: RadioChangeEvent) => {
    const value = e.target.value as "client" | "employee" | null;
    setFilterBy(value);
    // Clear the other field when switching
    if (value === "client") {
      form.setFieldValue("employeeId", undefined);
    } else if (value === "employee") {
      form.setFieldValue("clientId", undefined);
    }
  };

  const handleApply = async () => {
    try {
      const values = await form.validateFields();
      
      if (!values.filterBy) {
        form.setFields([
          {
            name: "filterBy",
            errors: ["Please select Client or Employee"],
          },
        ]);
        return;
      }

      const filters: {
        filterBy: "client" | "employee";
        clientId?: string;
        employeeId?: string;
        weekRange?: [Dayjs, Dayjs];
        month?: Dayjs;
      } = {
        filterBy: values.filterBy,
      };

      if (values.filterBy === "client" && values.clientId) {
        filters.clientId = values.clientId;
      } else if (values.filterBy === "employee" && values.employeeId) {
        filters.employeeId = values.employeeId;
      }

      if (viewType === "weekly" && values.weekRange) {
        // Ensure weekRange[0] is Monday
        const startDate = values.weekRange[0];
        const monday = startDate.day() === 0 
          ? startDate.add(1, "day") 
          : startDate.startOf("week").add(1, "day");
        filters.weekRange = [monday, values.weekRange[1]];
      } else if (viewType === "monthly" && values.month) {
        filters.month = values.month;
      }

      onApply(filters);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFilterBy(null);
    onCancel();
  };

  return (
    <Modal
      title="CALENDAR VIEW"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button
          key="cancel"
          onClick={handleCancel}
          className={buttonStyles.btnCancel}
        >
          CANCEL
        </Button>,
        <Button
          key="apply"
          type="primary"
          onClick={handleApply}
          className={buttonStyles.btnPrimary}
        >
          APPLY
        </Button>,
      ]}
      width={600}
      centered
    >
      <div style={{ marginBottom: "16px" }}>
        <span style={{ color: "red", fontSize: "12px" }}>*Required</span>
      </div>

      <Alert
        message={`Filter by Employee or Client to see the ${viewType === "weekly" ? "Weekly" : "Monthly"} Calendar.`}
        type="info"
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: "24px" }}
      />

      <Form form={form} layout="vertical">
        {/* Week Range or Month Picker */}
        {viewType === "weekly" ? (
          <Form.Item
            label={
              <>
                Week Range<span style={{ color: "red", marginLeft: "4px" }}>*</span>
              </>
            }
            name="weekRange"
            rules={[
              { required: true, message: "Please select a week range" },
            ]}
          >
            <RangePicker
              className={formStyles.formDatePicker}
              format="MM/DD/YYYY"
              style={{ width: "100%" }}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  form.setFieldValue("weekRange", dates);
                }
              }}
            />
          </Form.Item>
        ) : (
          <Form.Item
            label={
              <>
                Month<span style={{ color: "red", marginLeft: "4px" }}>*</span>
              </>
            }
            name="month"
            rules={[{ required: true, message: "Please select a month" }]}
          >
            <DatePicker
              className={formStyles.formDatePicker}
              picker="month"
              format="MMMM YYYY"
              style={{ width: "100%" }}
            />
          </Form.Item>
        )}

        {/* Filter By */}
        <Form.Item
          label={
            <>
              Filter By<span style={{ color: "red", marginLeft: "4px" }}>*</span>
            </>
          }
          name="filterBy"
          rules={[
            { required: true, message: "Please select Client or Employee" },
          ]}
        >
          <Radio.Group onChange={handleFilterByChange}>
            <Radio value="employee">Employee</Radio>
            <Radio value="client">Client</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Client Selector */}
        {filterBy === "client" && (
          <Form.Item
            label={
              <>
                Client<span style={{ color: "red", marginLeft: "4px" }}>*</span>
              </>
            }
            name="clientId"
            rules={[{ required: true, message: "Please select a client" }]}
          >
            <Select
              className={formStyles.formSelect}
              placeholder="Select Client"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={patients.map((p) => ({
                label: p.displayName,
                value: p.id,
              }))}
            />
          </Form.Item>
        )}

        {/* Employee Selector */}
        {filterBy === "employee" && (
          <Form.Item
            label={
              <>
                Employee<span style={{ color: "red", marginLeft: "4px" }}>*</span>
              </>
            }
            name="employeeId"
            rules={[{ required: true, message: "Please select an employee" }]}
          >
            <Select
              className={formStyles.formSelect}
              placeholder="Select Employee"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={staff.map((s) => ({
                label: s.displayName,
                value: s.id,
              }))}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

