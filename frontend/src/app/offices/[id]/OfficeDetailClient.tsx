"use client";

import { useState } from "react";
import {
  useOfficeDetail,
  useOfficeStaff,
  useOfficePatients,
} from "@/hooks/useOffices";
import {
  Card,
  Descriptions,
  Tag,
  Tabs,
  Table,
  Space,
  Button,
  Switch,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Input,
} from "antd";
import {
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { OfficeStaffDTO, OfficePatientDTO } from "@/types/office";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

interface OfficeDetailClientProps {
  officeId: string;
}

export default function OfficeDetailClient({
  officeId,
}: OfficeDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [staffActiveOnly, setStaffActiveOnly] = useState(true);
  const [patientsActiveOnly, setPatientsActiveOnly] = useState(true);
  const [staffSearchText, setStaffSearchText] = useState("");
  const [patientSearchText, setPatientSearchText] = useState("");

  const {
    data: office,
    isLoading: officeLoading,
    error: officeError,
  } = useOfficeDetail(officeId);
  const {
    data: staff,
    isLoading: staffLoading,
  } = useOfficeStaff(officeId, staffActiveOnly);
  const {
    data: patients,
    isLoading: patientsLoading,
  } = useOfficePatients(officeId, patientsActiveOnly);

  if (officeError) {
    message.error(officeError.message || "Failed to load office details");
  }

  // Filter staff based on search
  const filteredStaff = staff?.filter((member) => {
    const searchLower = staffSearchText.toLowerCase();
    return (
      member.fullName.toLowerCase().includes(searchLower) ||
      member.employeeId?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.phone?.toLowerCase().includes(searchLower) ||
      member.role?.toLowerCase().includes(searchLower) ||
      member.position?.toLowerCase().includes(searchLower)
    );
  });

  // Filter patients based on search
  const filteredPatients = patients?.filter((patient) => {
    const searchLower = patientSearchText.toLowerCase();
    return (
      patient.fullName.toLowerCase().includes(searchLower) ||
      patient.patientCode?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower) ||
      patient.gender?.toLowerCase().includes(searchLower)
    );
  });

  const staffColumns: ColumnsType<OfficeStaffDTO> = [
    {
      title: "Employee ID",
      dataIndex: "employeeId",
      key: "employeeId",
      width: 120,
      render: (id: string) => id || "N/A",
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <Link
          href={`/employees/${record.id}`}
          style={{ color: "#1890ff", fontWeight: 500 }}
        >
          {record.fullName}
        </Link>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role: string) => role || "N/A",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 150,
      render: (position: string) => position || "N/A",
    },
    {
      title: "Contact",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          {record.phone && (
            <div>
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  const patientColumns: ColumnsType<OfficePatientDTO> = [
    {
      title: "Patient Code",
      dataIndex: "patientCode",
      key: "patientCode",
      width: 120,
      render: (code: string) => code || "N/A",
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <Link
          href={`/clients/${record.id}`}
          style={{ color: "#1890ff", fontWeight: 500 }}
        >
          {record.fullName}
        </Link>
      ),
    },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      width: 120,
      render: (dob: string) => (dob ? new Date(dob).toLocaleDateString() : "N/A"),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      width: 100,
      render: (gender: string) => gender || "N/A",
    },
    {
      title: "Contact",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          {record.phone && (
            <div>
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "orange"}>
          {status || "N/A"}
        </Tag>
      ),
    },
  ];

  if (officeLoading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <Spin size="large" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!office) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <Card>
            <div style={{ textAlign: "center", padding: "40px" }}>
              Office not found
            </div>
          </Card>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  const tabItems = [
    {
      key: "overview",
      label: (
        <span>
          <EnvironmentOutlined /> Overview
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Statistics */}
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Staff"
                  value={office.totalStaff}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Staff"
                  value={office.activeStaff}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Patients"
                  value={office.totalPatients}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Patients"
                  value={office.activePatients}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Office Details */}
          <Card title="Office Information">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Office Code" span={1}>
                {office.code}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={1}>
                <Tag color={office.isActive ? "green" : "red"}>
                  {office.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Office Name" span={2}>
                {office.name}
              </Descriptions.Item>
              <Descriptions.Item label="County" span={2}>
                {office.county || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone" span={1}>
                {office.phone || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={1}>
                {office.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Timezone" span={2}>
                <ClockCircleOutlined /> {office.timezone}
              </Descriptions.Item>
              {office.fullAddress && (
                <Descriptions.Item label="Address" span={2}>
                  <EnvironmentOutlined /> {office.fullAddress}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Created At" span={1}>
                {new Date(office.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At" span={1}>
                {new Date(office.updatedAt).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      ),
    },
    {
      key: "staff",
      label: (
        <span>
          <TeamOutlined /> Staff ({staff?.length || 0})
        </span>
      ),
      children: (
        <Card
          title="Office Staff"
          extra={
            <Space>
              <span>Active Only:</span>
              <Switch
                checked={staffActiveOnly}
                onChange={setStaffActiveOnly}
                checkedChildren={<CheckCircleOutlined />}
                unCheckedChildren={<CloseCircleOutlined />}
              />
            </Space>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 16 }}>
            <Input
              placeholder="Search by name, employee ID, email, phone, role, or position..."
              prefix={<SearchOutlined />}
              value={staffSearchText}
              onChange={(e) => setStaffSearchText(e.target.value)}
              allowClear
              size="large"
              style={{ maxWidth: 600 }}
            />
            <Table
              columns={staffColumns}
              dataSource={filteredStaff || []}
              rowKey="id"
              loading={staffLoading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Total ${total} staff members`,
              }}
              scroll={{ x: 1000 }}
            />
          </Space>
        </Card>
      ),
    },
    {
      key: "patients",
      label: (
        <span>
          <UserOutlined /> Patients ({patients?.length || 0})
        </span>
      ),
      children: (
        <Card
          title="Office Patients"
          extra={
            <Space>
              <span>Active Only:</span>
              <Switch
                checked={patientsActiveOnly}
                onChange={setPatientsActiveOnly}
                checkedChildren={<CheckCircleOutlined />}
                unCheckedChildren={<CloseCircleOutlined />}
              />
            </Space>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 16 }}>
            <Input
              placeholder="Search by name, patient code, email, phone, or gender..."
              prefix={<SearchOutlined />}
              value={patientSearchText}
              onChange={(e) => setPatientSearchText(e.target.value)}
              allowClear
              size="large"
              style={{ maxWidth: 600 }}
            />
            <Table
              columns={patientColumns}
              dataSource={filteredPatients || []}
              rowKey="id"
              loading={patientsLoading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Total ${total} patients`,
              }}
              scroll={{ x: 1000 }}
            />
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <AdminLayout>
        <Card
          title={
            <Space>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
              />
              <EnvironmentOutlined style={{ fontSize: "24px" }} />
              <span style={{ fontSize: "20px", fontWeight: 600 }}>
                {office.name}
              </span>
              <Tag color={office.isActive ? "green" : "red"}>
                {office.isActive ? "Active" : "Inactive"}
              </Tag>
            </Space>
          }
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </Card>
      </AdminLayout>
    </ProtectedRoute>
  );
}
