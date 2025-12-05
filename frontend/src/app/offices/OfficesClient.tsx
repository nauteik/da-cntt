"use client";

import { useState } from "react";
import { useOffices } from "@/hooks/useOffices";
import { Card, Table, Tag, Space, Button, Input, message } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  ReloadOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { OfficeDTO } from "@/types/office";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import layoutStyles from "@/styles/table-layout.module.css";
import buttonStyles from "@/styles/buttons.module.css";

export default function OfficesClient() {
  const [searchText, setSearchText] = useState("");
  const { data: offices, isLoading, error } = useOffices();

  // Filter offices based on search
  const filteredOffices = offices?.filter((office) => {
    const searchLower = searchText.toLowerCase();
    return (
      office.name.toLowerCase().includes(searchLower) ||
      office.code.toLowerCase().includes(searchLower) ||
      office.county?.toLowerCase().includes(searchLower) ||
      office.email?.toLowerCase().includes(searchLower)
    );
  });

  const columns: ColumnsType<OfficeDTO> = [
    {
      title: "Office Code",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code: string, record) => (
        <Link
          href={`/offices/${record.id}`}
          style={{ color: "#1890ff", fontWeight: 500 }}
        >
          {code}
        </Link>
      ),
    },
    {
      title: "Office Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.county && (
            <div style={{ fontSize: "12px", color: "#888" }}>
              <EnvironmentOutlined /> {record.county}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      width: 220,
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          {record.phone && (
            <div style={{ marginBottom: 4 }}>
              <PhoneOutlined /> {record.phone}
            </div>
          )}
          {record.email && (
            <div>
              <MailOutlined /> {record.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Timezone",
      dataIndex: "timezone",
      key: "timezone",
      width: 180,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Link href={`/offices/${record.id}`}>
          <Button type="link" size="small">
            View Details
          </Button>
        </Link>
      ),
    },
  ];

  if (error) {
    message.error(error.message || "Failed to load offices");
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className={layoutStyles.pageContainer}>
          <Card className={layoutStyles.controlBar} variant="borderless">
            <div className={layoutStyles.controlsRow}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className={buttonStyles.btnPrimary}
                disabled
              >
                ADD OFFICE
              </Button>

              <Space size="middle" className={layoutStyles.rightControls}>
                <Input
                  placeholder="Search by office name, code, county, or email..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className={layoutStyles.searchInput}
                  allowClear
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => window.location.reload()}
                  className={buttonStyles.btnSecondary}
                >
                  REFRESH
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  disabled
                  className={buttonStyles.btnSecondary}
                >
                  EXPORT
                </Button>
              </Space>
            </div>
          </Card>

          <Card className={layoutStyles.tableCard} variant="borderless">
            <Table
              columns={columns}
              dataSource={filteredOffices || []}
              rowKey="id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} offices`,
                position: ["bottomCenter"],
              }}
              scroll={{
                x: 1000,
                y: "calc(100vh - 280px)",
              }}
              size="small"
              sticky={{
                offsetHeader: 0,
              }}
            />
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
