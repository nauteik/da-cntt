"use client";

import React, { useEffect } from "react";
import { Modal, Form, DatePicker, Alert } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useUnassignPatientFromHouse } from "@/hooks/useHouses";
import type { HouseDTO } from "@/types/house";
import formStyles from "@/styles/form.module.css";

interface UnassignPatientModalProps {
  open: boolean;
  onClose: () => void;
  house: HouseDTO | null;
  onSuccess?: () => void;
}

export default function UnassignPatientModal({
  open,
  onClose,
  house,
  onSuccess,
}: UnassignPatientModalProps) {
  const [form] = Form.useForm<{ moveOutDate: Dayjs }>();

  const unassignMutation = useUnassignPatientFromHouse({
    onSuccess: () => {
      form.resetFields();
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to unassign patient:", error);
    },
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        moveOutDate: dayjs(),
      });
    } else {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const moveOutDate = values.moveOutDate as Dayjs;
      if (house?.currentStayId) {
        unassignMutation.mutate({
          stayId: house.currentStayId,
          request: {
            moveOutDate: moveOutDate.format("YYYY-MM-DD"),
          },
        });
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={`Unassign Patient from ${house?.name || "House"}`}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={unassignMutation.isPending}
      width={600}
      okText="Unassign"
      cancelText="Cancel"
      styles={{
        body: { padding: "24px" },
      }}
    >
      {unassignMutation.error && (
        <Alert
          message="Error"
          description={
            unassignMutation.error.message ||
            "Failed to unassign patient from house"
          }
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      {house?.currentPatientName && (
        <div className="mb-4">
          <p className="text-sm text-theme-secondary">
            Current Patient: <strong>{house.currentPatientName}</strong>
          </p>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          label={
            <>
              Move-Out Date
              <span style={{ color: "red", marginLeft: "4px" }}>*</span>
            </>
          }
          name="moveOutDate"
          rules={[{ required: true, message: "Please select move-out date" }]}
        >
          <DatePicker
            className={formStyles.formInput}
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            disabledDate={(current) => {
              // Disable future dates
              return current && current > dayjs().endOf("day");
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

