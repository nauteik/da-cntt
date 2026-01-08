"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Select, DatePicker, Alert } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useAssignPatientToHouse } from "@/hooks/useHouses";
import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/api";
import type { PatientSelectDTO } from "@/types/patient";
// import type { AssignPatientRequest } from "@/types/house";
import formStyles from "@/styles/form.module.css";

interface AssignPatientModalProps {
  open: boolean;
  onClose: () => void;
  houseId: string;
  houseName: string;
  onSuccess?: () => void;
}

export default function AssignPatientModal({
  open,
  onClose,
  houseId,
  houseName,
  onSuccess,
}: AssignPatientModalProps) {
  interface AssignPatientFormValues {
    patientId: string;
    moveInDate: Dayjs;
  }
  
  const [form] = Form.useForm<AssignPatientFormValues>();
  const [patients, setPatients] = useState<PatientSelectDTO[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const assignMutation = useAssignPatientToHouse({
    onSuccess: () => {
      form.resetFields();
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to assign patient:", error);
    },
  });

  useEffect(() => {
    if (open) {
      loadPatients();
      form.setFieldsValue({
        moveInDate: dayjs(),
      });
    } else {
      form.resetFields();
    }
  }, [open, form]);

  const loadPatients = async () => {
    setLoadingPatients(true);
    try {
      const response: ApiResponse<PatientSelectDTO[]> =
        await apiClient<PatientSelectDTO[]>("/patients/select");
      if (response.success && response.data) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const moveInDate = values.moveInDate as Dayjs;
      assignMutation.mutate({
        houseId,
        request: {
          patientId: values.patientId,
          moveInDate: moveInDate.format("YYYY-MM-DD"),
        },
      });
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
      title={`Assign Patient to ${houseName}`}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={assignMutation.isPending}
      width={600}
      okText="Assign"
      cancelText="Cancel"
      styles={{
        body: { padding: "24px" },
      }}
    >
      {assignMutation.error && (
        <Alert
          message="Error"
          description={
            assignMutation.error.message || "Failed to assign patient to house"
          }
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          label={
            <>
              Patient<span style={{ color: "red", marginLeft: "4px" }}>*</span>
            </>
          }
          name="patientId"
          rules={[{ required: true, message: "Please select a patient" }]}
        >
          <Select
            className={formStyles.formSelect}
            placeholder="Select a patient"
            showSearch
            loading={loadingPatients}
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

        <Form.Item
          label={
            <>
              Move-In Date
              <span style={{ color: "red", marginLeft: "4px" }}>*</span>
            </>
          }
          name="moveInDate"
          rules={[{ required: true, message: "Please select move-in date" }]}
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

