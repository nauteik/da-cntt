"use client";

import React, { useState } from "react";
import { Table, Tag, Button, DatePicker, Space, Card, Typography, Modal, Form, Input, InputNumber, Checkbox, Row, Col, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, HeartOutlined } from "@ant-design/icons";
import { usePatientMAR, useActiveOrders, useRecordAdministration } from "@/hooks/useMedications";
import { useAuth } from "@/contexts/AuthContext";
import { MedicationOrder, MedicationAdministration } from "@/types/medication";
import dayjs from "dayjs";
import TabLoading from "@/components/common/TabLoading";
import InlineError from "@/components/common/InlineError";

const { Title, Text } = Typography;

interface MedicationMARProps {
  patientId: string;
}

export default function MedicationMAR({ patientId }: MedicationMARProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MedicationOrder | null>(null);
  const [form] = Form.useForm();

  const { data: marEntries, isLoading: marLoading, error: marError } = usePatientMAR(patientId, selectedDate.format("YYYY-MM-DD"));
  const { data: activeOrders, isLoading: ordersLoading } = useActiveOrders(patientId);
  const recordAdminMutation = useRecordAdministration();

  const handleRecordAdmin = (order: MedicationOrder) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      medicationOrderId: order.id,
      patientId: patientId,
      administeredAt: dayjs(),
      doseGiven: order.dosage,
      isPrn: order.isPrn,
      status: "given",
      staffId: user?.id
    });
    setIsAdminModalVisible(true);
  };

  const onFinish = async (values: any) => {
    try {
      await recordAdminMutation.mutateAsync({
        ...values,
        staffId: values.staffId || user?.id,
        administeredAt: values.administeredAt.toISOString(),
      });
      message.success("Administration recorded successfully");
      setIsAdminModalVisible(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || "Failed to record administration");
    }
  };

  if (marLoading || ordersLoading) return <TabLoading />;
  if (marError) return <InlineError title="Error" message={marError.message} />;

  const marColumns = [
    {
      title: "Time",
      dataIndex: "administeredAt",
      key: "administeredAt",
      render: (text: string) => dayjs(text).format("HH:mm"),
    },
    {
      title: "Medication",
      key: "medication",
      render: (_: any, record: MedicationAdministration) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.medicationOrder?.drugName || "Unknown Medication"}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.medicationOrder?.dosage} - {record.medicationOrder?.route}
          </Text>
        </Space>
      ),
    },
    {
      title: "Dose",
      dataIndex: "doseGiven",
      key: "doseGiven",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = { given: "green", refused: "red", held: "orange", missed: "gray" };
        return <Tag color={colors[status] || "blue"}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Vitals",
      key: "vitals",
      render: (_: any, record: MedicationAdministration) => (
        <Text type="secondary" style={{ fontSize: "12px" }}>
          {record.systolicBP && `BP: ${record.systolicBP}/${record.diastolicBP} `}
          {record.pulse && `P: ${record.pulse} `}
          {record.glucose && `G: ${record.glucose}`}
        </Text>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div className="flex justify-between items-center">
        <DatePicker 
          value={selectedDate} 
          onChange={(date) => date && setSelectedDate(date)} 
          allowClear={false}
        />
        <Title level={5} style={{ margin: 0 }}>MAR for {selectedDate.format("MMMM D, YYYY")}</Title>
      </div>

      <Card title="Pending Administrations (Scheduled Today)" size="small">
        <Table 
          dataSource={activeOrders?.filter(o => !o.isPrn)} 
          rowKey="id"
          pagination={false}
          columns={[
            { title: "Medication", dataIndex: "drugName", key: "drugName" },
            { title: "Dosage", dataIndex: "dosage", key: "dosage" },
            { title: "Frequency", dataIndex: "frequency", key: "frequency" },
            { 
              title: "Action", 
              key: "action",
              render: (_: any, record: MedicationOrder) => (
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<PlusOutlined />}
                  onClick={() => handleRecordAdmin(record)}
                >
                  Record
                </Button>
              )
            }
          ]}
        />
      </Card>

      <Card title="PRN Medications (As Needed)" size="small">
        <Table 
          dataSource={activeOrders?.filter(o => o.isPrn)} 
          rowKey="id"
          pagination={false}
          columns={[
            { title: "Medication", dataIndex: "drugName", key: "drugName" },
            { title: "Dosage", dataIndex: "dosage", key: "dosage" },
            { title: "Frequency", dataIndex: "frequency", key: "frequency" },
            { 
              title: "Action", 
              key: "action",
              render: (_: any, record: MedicationOrder) => (
                <Button 
                  type="default" 
                  size="small" 
                  icon={<PlusOutlined />}
                  onClick={() => handleRecordAdmin(record)}
                >
                  Record PRN
                </Button>
              )
            }
          ]}
        />
      </Card>

      <Card title="Administration History" size="small">
        <Table 
          dataSource={marEntries} 
          columns={marColumns} 
          rowKey="id" 
          pagination={false}
        />
      </Card>

      <Modal
        title={`Record Administration: ${selectedOrder?.drugName}`}
        open={isAdminModalVisible}
        onCancel={() => setIsAdminModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        confirmLoading={recordAdminMutation.isLoading}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Hidden fields for required IDs */}
          <Form.Item name="medicationOrderId" hidden><Input /></Form.Item>
          <Form.Item name="patientId" hidden><Input /></Form.Item>
          <Form.Item name="status" hidden><Input /></Form.Item>
          <Form.Item name="staffId" hidden><Input /></Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="administeredAt" label="Time Administered" rules={[{ required: true }]}>
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="doseGiven" label="Dose Given" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Status">
                <Tag color="green">GIVEN</Tag>
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="isPrn" valuePropName="checked" label=" ">
                <Checkbox disabled>PRN Medication</Checkbox>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5}><HeartOutlined /> Vitals (Optional unless required)</Title>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="systolicBP" label="Systolic BP">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="diastolicBP" label="Diastolic BP">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="pulse" label="Pulse">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="glucose" label="Glucose">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>

          {selectedOrder?.isControlled && (
            <Card size="small" className="bg-red-50 border-red-200">
              <Text type="danger" strong>Controlled Medication: Witness Signature Required</Text>
              <Form.Item 
                name="witnessStaffId" 
                label="Witness Staff ID" 
                rules={[
                  { required: true, message: "Witness ID is required for controlled medications" },
                  { 
                    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 
                    message: "Please enter a valid UUID (e.g., 36-character format)" 
                  }
                ]}
              >
                <Input placeholder="Enter Witness Staff ID or Scan Badge" />
              </Form.Item>
            </Card>
          )}
        </Form>
      </Modal>
    </Space>
  );
}
