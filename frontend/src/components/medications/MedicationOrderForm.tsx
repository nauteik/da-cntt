"use client";

import React from "react";
import { Modal, Form, Input, Select, DatePicker, Checkbox, Row, Col, InputNumber, message } from "antd";
import { useCreateOrder, useDrugForms } from "@/hooks/useMedications";
import { DrugForm } from "@/types/medication";

interface MedicationOrderFormProps {
  visible: boolean;
  onCancel: () => void;
  patientId: string;
}

export default function MedicationOrderForm({ visible, onCancel, patientId }: MedicationOrderFormProps) {
  const [form] = Form.useForm();
  const { data: drugForms } = useDrugForms();
  const createOrderMutation = useCreateOrder();

  const onFinish = async (values: any) => {
    try {
      await createOrderMutation.mutateAsync({
        ...values,
        patientId,
        startAt: values.startAt.format("YYYY-MM-DD"),
        endAt: values.endAt ? values.endAt.format("YYYY-MM-DD") : null,
      });
      message.success("Medication order created successfully");
      onCancel();
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || "Failed to create medication order");
    }
  };

  return (
    <Modal
      title="New Medication Order"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={800}
      confirmLoading={createOrderMutation.isLoading}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isPrn: false, isControlled: false }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="drugName" label="Medication Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Lisinopril" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="drugForm" label="Form" rules={[{ required: true }]}>
              <Select placeholder="Select form">
                {drugForms?.map(form => (
                  <Select.Option key={form} value={form}>{form}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="dosage" label="Dosage" rules={[{ required: true }]}>
              <Input placeholder="e.g. 10mg" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="route" label="Route" rules={[{ required: true }]}>
              <Input placeholder="e.g. Oral" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
              <Input placeholder="e.g. Daily, BID, PRN" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="startAt" label="Start Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endAt" label="End Date (Optional)">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="isPrn" valuePropName="checked">
              <Checkbox>PRN (As Needed)</Checkbox>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isControlled" valuePropName="checked">
              <Checkbox>Controlled Substance</Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="prescribingProvider" label="Prescribing Provider">
              <Input placeholder="Dr. Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="pharmacyInfo" label="Pharmacy Info">
              <Input placeholder="Pharmacy Name & Phone" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="currentStock" label="Initial Stock">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="reorderLevel" label="Reorder Level">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="unitOfMeasure" label="Unit (tablets, ml, etc.)">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="indication" label="Indication / Reason for Medication">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
