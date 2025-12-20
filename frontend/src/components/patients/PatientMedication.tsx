"use client";

import React, { useState } from "react";
import { Tabs, Card, Button, Space, Typography, Badge } from "antd";
import { PlusOutlined, HistoryOutlined, WarningOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import MedicationOrderList from "../medications/MedicationOrderList";
import MedicationMAR from "../medications/MedicationMAR";
import PatientAllergies from "../medications/PatientAllergies";
import MedicationOrderForm from "../medications/MedicationOrderForm";
import { PatientHeaderDTO } from "@/types/patient";
import { useActiveOrders, usePatientAllergies } from "@/hooks/useMedications";

const { Title } = Typography;

interface PatientMedicationProps {
  patientId: string;
  patient: PatientHeaderDTO;
}

export default function PatientMedication({ patientId, patient }: PatientMedicationProps) {
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  
  const { data: activeOrders } = useActiveOrders(patientId);
  const { data: allergies } = usePatientAllergies(patientId);

  const tabItems = [
    {
      key: "orders",
      label: (
        <Space size="small">
          Active Orders
          <Badge 
            count={activeOrders?.length || 0} 
            showZero 
            color={activeOrders?.length ? "#1890ff" : "#d9d9d9"}
            style={{ fontSize: "10px" }}
          />
        </Space>
      ),
      children: <MedicationOrderList patientId={patientId} />,
    },
    {
      key: "mar",
      label: "eMAR (Administration)",
      children: <MedicationMAR patientId={patientId} />,
    },
    {
      key: "allergies",
      label: (
        <Space size="small">
          Allergies
          <Badge 
            count={allergies?.length || 0} 
            showZero={false}
            color="#ff4d4f"
            style={{ fontSize: "10px" }}
          />
        </Space>
      ),
      children: <PatientAllergies patientId={patientId} />,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} style={{ margin: 0 }}>Medication Management</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsOrderModalVisible(true)}
        >
          New Medication Order
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Tabs defaultActiveKey="orders" items={tabItems} />
      </Card>

      <MedicationOrderForm 
        visible={isOrderModalVisible} 
        onCancel={() => setIsOrderModalVisible(false)} 
        patientId={patientId}
      />
    </div>
  );
}
