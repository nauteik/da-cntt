"use client";

import React, { useState } from "react";
import { Table, Tag, Button, Space, Modal, Form, Input, Select, message, Empty } from "antd";
import { PlusOutlined, WarningOutlined } from "@ant-design/icons";
import { usePatientAllergies, useAddAllergy } from "@/hooks/useMedications";
import TabLoading from "@/components/common/TabLoading";
import InlineError from "@/components/common/InlineError";

interface AllergyFormValues {
  allergen: string;
  reaction?: string;
  severity: string;
  isActive: boolean;
}

interface PatientAllergiesProps {
  patientId: string;
}

export default function PatientAllergies({ patientId }: PatientAllergiesProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const { data: allergies, isLoading, error } = usePatientAllergies(patientId);
  const addAllergyMutation = useAddAllergy();

  const onFinish = async (values: AllergyFormValues) => {
    try {
      await addAllergyMutation.mutateAsync({
        ...values,
        patientId,
        isActive: true
      });
      message.success("Allergy added successfully");
      setIsModalVisible(false);
      form.resetFields();
    } catch (err: unknown) {
      message.error((err as { message?: string })?.message || "Failed to add allergy");
    }
  };

  if (isLoading) return <TabLoading />;
  if (error) return <InlineError title="Error" message={error.message} />;

  const columns = [
    {
      title: "Allergen",
      dataIndex: "allergen",
      key: "allergen",
      render: (text: string) => <span className="font-bold text-red-600">{text}</span>,
    },
    {
      title: "Reaction",
      dataIndex: "reaction",
      key: "reaction",
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      render: (severity: string) => {
        const colors: Record<string, string> = { Severe: "red", Moderate: "orange", Mild: "blue" };
        return <Tag color={colors[severity] || "default"}>{severity.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        isActive ? <Tag color="success">ACTIVE</Tag> : <Tag color="default">INACTIVE</Tag>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Space>
          <WarningOutlined className="text-red-500 text-xl" />
          <span className="text-lg font-medium">Patient Allergy Profile</span>
        </Space>
        <Button type="primary" danger icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Add Allergy
        </Button>
      </div>

      <Table 
        dataSource={allergies} 
        columns={columns} 
        rowKey="id" 
        pagination={false}
        locale={{ emptyText: <Empty description="No allergies recorded for this patient" /> }}
      />

      <Modal
        title="Add New Allergy"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={addAllergyMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="allergen" label="Allergen (Medication, Food, etc.)" rules={[{ required: true }]}>
            <Input placeholder="e.g. Penicillin" />
          </Form.Item>
          <Form.Item name="reaction" label="Reaction">
            <Input placeholder="e.g. Hives, Anaphylaxis" />
          </Form.Item>
          <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Mild">Mild</Select.Option>
              <Select.Option value="Moderate">Moderate</Select.Option>
              <Select.Option value="Severe">Severe</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
