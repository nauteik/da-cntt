"use client";

import React, { useState } from "react";
import { Table, Tag, Space, Button, Tooltip, Empty, message, Popconfirm } from "antd";
import { StopOutlined, InfoCircleOutlined, AlertOutlined } from "@ant-design/icons";
import { useActiveOrders, useDiscontinueOrder } from "@/hooks/useMedications";
import { MedicationOrder } from "@/types/medication";
import TabLoading from "@/components/common/TabLoading";
import InlineError from "@/components/common/InlineError";
import MedicationOrderDetail from "./MedicationOrderDetail";

interface MedicationOrderListProps {
  patientId: string;
}

export default function MedicationOrderList({ patientId }: MedicationOrderListProps) {
  const { data: orders, isLoading, error } = useActiveOrders(patientId);
  const discontinueMutation = useDiscontinueOrder();
  
  const [selectedOrder, setSelectedOrder] = useState<MedicationOrder | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const handleDiscontinue = async (orderId: string) => {
    try {
      await discontinueMutation.mutateAsync({ orderId, patientId });
      message.success("Medication discontinued");
    } catch (err: unknown) {
      message.error((err as { message?: string })?.message || "Failed to discontinue medication");
    }
  };

  const showDetail = (order: MedicationOrder) => {
    setSelectedOrder(order);
    setIsDetailVisible(true);
  };

  if (isLoading) return <TabLoading />;
  if (error) return <InlineError title="Error" message={error.message} />;

  const columns = [
    {
      title: "Medication",
      dataIndex: "drugName",
      key: "drugName",
      render: (text: string, record: MedicationOrder) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium text-primary">{text}</span>
          <span className="text-xs text-gray-500">{record.dosage} - {record.drugForm}</span>
        </Space>
      ),
    },
    {
      title: "Route & Frequency",
      key: "routeFreq",
      render: (_: unknown, record: MedicationOrder) => (
        <Space direction="vertical" size={0}>
          <span>{record.route}</span>
          <span className="text-xs font-medium">{record.frequency}</span>
        </Space>
      ),
    },
    {
      title: "Type",
      dataIndex: "isPrn",
      key: "isPrn",
      render: (isPrn: boolean) => (
        isPrn ? <Tag color="orange">PRN</Tag> : <Tag color="blue">Scheduled</Tag>
      ),
    },
    {
      title: "Stock",
      key: "stock",
      render: (_: unknown, record: MedicationOrder) => {
        const currentStock = record.currentStock ?? 0;
        const reorderLevel = record.reorderLevel ?? 0;
        const isLow = currentStock <= reorderLevel && reorderLevel > 0;
        return (
          <Space>
            <span className={isLow ? "text-red-500 font-bold" : ""}>
              {currentStock} {record.unitOfMeasure || ''}
            </span>
            {isLow && (
              <Tooltip title="Low Stock Alert">
                <AlertOutlined className="text-red-500" />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: "Prescriber",
      dataIndex: "prescribingProvider",
      key: "prescribingProvider",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: MedicationOrder) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              icon={<InfoCircleOutlined />} 
              size="small" 
              onClick={() => showDetail(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Discontinue Medication"
            description="Are you sure you want to discontinue this medication?"
            onConfirm={() => handleDiscontinue(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Discontinue">
              <Button 
                icon={<StopOutlined />} 
                danger 
                size="small" 
                loading={discontinueMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table 
        dataSource={orders} 
        columns={columns} 
        rowKey="id" 
        pagination={false}
        locale={{ emptyText: <Empty description="No active medication orders found" /> }}
      />
      
      <MedicationOrderDetail 
        order={selectedOrder}
        visible={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
      />
    </>
  );
}
