"use client";

import React from "react";
import { Modal, Descriptions, Tag, Divider, Typography, Space } from "antd";
import { MedicationOrder } from "@/types/medication";
import { 
  MedicineBoxOutlined, 
  UserOutlined, 
  CalendarOutlined, 
  InfoCircleOutlined,
  WarningOutlined,
  DatabaseOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface MedicationOrderDetailProps {
  order: MedicationOrder | null;
  visible: boolean;
  onClose: () => void;
}

export default function MedicationOrderDetail({ order, visible, onClose }: MedicationOrderDetailProps) {
  if (!order) return null;

  return (
    <Modal
      title={
        <Space>
          <MedicineBoxOutlined className="text-primary" />
          <span>Medication Order Details</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="py-2">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <Title level={3} style={{ margin: 0 }}>{order.drugName}</Title>
            <Text type="secondary">{order.dosage} - {order.drugForm}</Text>
          </div>
          <Space>
            {order.isPrn && <Tag color="orange">PRN (As Needed)</Tag>}
            {order.isControlled && <Tag color="red">Controlled Substance</Tag>}
            <Tag color={order.status === "active" ? "green" : "default"}>
              {order.status.toUpperCase()}
            </Tag>
          </Space>
        </div>

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Route" span={1}>{order.route}</Descriptions.Item>
          <Descriptions.Item label="Frequency" span={1}>{order.frequency}</Descriptions.Item>
          <Descriptions.Item label="Indication" span={2}>
            <Space>
              <InfoCircleOutlined className="text-gray-400" />
              {order.indication || "No indication specified"}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Start Date" span={1}>
            <Space>
              <CalendarOutlined className="text-gray-400" />
              {dayjs(order.startAt).format("MMMM D, YYYY")}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="End Date" span={1}>
            <Space>
              <CalendarOutlined className="text-gray-400" />
              {order.endAt ? dayjs(order.endAt).format("MMMM D, YYYY") : "Ongoing"}
            </Space>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ marginTop: 24 }}>
          <Space><UserOutlined /> Prescriber & Pharmacy</Space>
        </Divider>
        
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Prescribing Provider">
            {order.prescribingProvider}
          </Descriptions.Item>
          <Descriptions.Item label="Pharmacy Information">
            {order.pharmacyInfo || "Not specified"}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left" style={{ marginTop: 24 }}>
          <Space><DatabaseOutlined /> Inventory Management</Space>
        </Divider>

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Current Stock">
            <Text strong className={(order.currentStock ?? 0) <= (order.reorderLevel ?? 0) ? "text-red-500" : ""}>
              {order.currentStock ?? 0} {order.unitOfMeasure || ''}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Reorder Level">
            {order.reorderLevel ?? 0} {order.unitOfMeasure || ''}
          </Descriptions.Item>
        </Descriptions>

        {order.isControlled && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded flex items-start gap-3">
            <WarningOutlined className="text-red-500 mt-1" />
            <div>
              <Text strong className="text-red-700">Controlled Substance Warning</Text>
              <br />
              <Text style={{ fontSize: '12px' }} className="text-red-600">
                This medication requires double-signature verification for every administration and strict inventory tracking.
              </Text>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
