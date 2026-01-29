"use client";

import React from "react";
import { Modal, Form, Input, Select, Alert, App } from "antd";
import { useCreateHouse } from "@/hooks/useHouses";
import type { HouseCreateRequest } from "@/types/house";
import type { OfficeDTO } from "@/types/office";
import formStyles from "@/styles/form.module.css";

const { TextArea } = Input;

interface CreateHouseModalProps {
  open: boolean;
  onClose: () => void;
  offices: OfficeDTO[];
  onSuccess?: () => void;
}

export default function CreateHouseModal({
  open,
  onClose,
  offices,
  onSuccess,
}: CreateHouseModalProps) {
  const [form] = Form.useForm<HouseCreateRequest>();
  const { message } = App.useApp();

  const createMutation = useCreateHouse({
    onSuccess: () => {
      message.success("House created successfully");
      form.resetFields();
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      message.error(error.message || "Failed to create house");
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate(values);
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
      title="Create New House"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending}
      width={600}
      okText="Create"
      cancelText="Cancel"
      styles={{
        body: { padding: "24px" },
      }}
    >
      {createMutation.error && (
        <Alert
          message="Error"
          description={createMutation.error.message || "Failed to create house"}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        className="mt-4"
        requiredMark="optional"
      >
        <Form.Item
          label="Office"
          name="officeId"
          rules={[{ required: true, message: "Office is required" }]}
        >
          <Select
            className={formStyles.formSelect}
            placeholder="Select office"
            showSearch
            optionFilterProp="children"
            options={offices.map((office) => ({
              label: office.name,
              value: office.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="House Code"
          name="code"
          rules={[
            { required: true, message: "House code is required" },
            { max: 50, message: "House code must not exceed 50 characters" },
          ]}
        >
          <Input
            className={formStyles.formInput}
            placeholder="Enter house code (e.g., H001)"
          />
        </Form.Item>

        <Form.Item
          label="House Name"
          name="name"
          rules={[
            { required: true, message: "House name is required" },
            { max: 255, message: "House name must not exceed 255 characters" },
          ]}
        >
          <Input
            className={formStyles.formInput}
            placeholder="Enter house name"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { max: 1000, message: "Description must not exceed 1000 characters" },
          ]}
        >
          <TextArea
            className={formStyles.formInput}
            rows={4}
            placeholder="Enter description (optional)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
