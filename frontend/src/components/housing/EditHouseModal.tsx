"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Switch, Alert } from "antd";
import { useUpdateHouse } from "@/hooks/useHouses";
import type { HouseDTO, HouseUpdateRequest } from "@/types/house";
import formStyles from "@/styles/form.module.css";

const { TextArea } = Input;

interface EditHouseModalProps {
  open: boolean;
  onClose: () => void;
  house: HouseDTO | null;
  onSuccess?: () => void;
}

export default function EditHouseModal({
  open,
  onClose,
  house,
  onSuccess,
}: EditHouseModalProps) {
  const [form] = Form.useForm<HouseUpdateRequest>();

  const updateMutation = useUpdateHouse({
    onSuccess: () => {
      form.resetFields();
      onClose();
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to update house:", error);
    },
  });

  useEffect(() => {
    if (open && house) {
      form.setFieldsValue({
        code: house.code,
        name: house.name,
        description: house.description || "",
        isActive: house.isActive,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, house, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (house) {
        updateMutation.mutate({
          id: house.id,
          request: values,
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
      title="Edit House"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={updateMutation.isPending}
      width={600}
      okText="Save"
      cancelText="Cancel"
      styles={{
        body: { padding: "24px" },
      }}
    >
      {updateMutation.error && (
        <Alert
          message="Error"
          description={updateMutation.error.message || "Failed to update house"}
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
          label="House Code"
          name="code"
          rules={[
            { required: true, message: "House code is required" },
            { max: 50, message: "House code must not exceed 50 characters" },
          ]}
        >
          <Input
            className={formStyles.formInput}
            placeholder="Enter house code"
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

        <Form.Item
          label="Status"
          name="isActive"
          valuePropName="checked"
        >
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

